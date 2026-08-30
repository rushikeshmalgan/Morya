// app/api/pandals/route.ts — Submit a new, community-contributed pandal

import { NextRequest, NextResponse } from "next/server";
import { PandalStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, requireSession } from "@/lib/auth";
import { updatePandalSubmissionQuests } from "@/lib/achievements";
import {
  consumeDuplicateConfirmation,
  createSubmissionFingerprint,
  issueDuplicateConfirmation,
} from "@/lib/duplicate-confirmation";
import { haversineDistance } from "@/lib/geo";
import {
  generateFilename,
  isValidImageMimeType,
  MAX_FILE_SIZE,
  storage,
} from "@/lib/storage";
import {
  parseCoordinate,
  parseOptionalText,
  parseRequiredText,
} from "@/lib/validation";

const DUPLICATE_RADIUS = Number.parseInt(
  process.env.DUPLICATE_PANDAL_RADIUS_METERS || "100",
  10
);

type SubmissionInput = {
  address: string | null;
  city: string | null;
  confirmationToken: unknown;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  name: string | null;
  photoFile: File | null;
};

async function readSubmission(request: NextRequest): Promise<SubmissionInput> {
  const contentType = request.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    const photo = formData.get("photo");
    return {
      name: parseRequiredText(formData.get("name"), 2, 120),
      description: parseOptionalText(formData.get("description"), 1_000),
      latitude: parseCoordinate(formData.get("latitude"), "latitude"),
      longitude: parseCoordinate(formData.get("longitude"), "longitude"),
      city: parseRequiredText(formData.get("city"), 2, 120),
      address: parseOptionalText(formData.get("address"), 240),
      confirmationToken: formData.get("duplicateConfirmationToken"),
      photoFile: photo instanceof File ? photo : null,
    };
  }

  const body: unknown = await request.json();
  const value = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  return {
    name: parseRequiredText(value.name, 2, 120),
    description: parseOptionalText(value.description, 1_000),
    latitude: parseCoordinate(value.latitude, "latitude"),
    longitude: parseCoordinate(value.longitude, "longitude"),
    city: parseRequiredText(value.city, 2, 120),
    address: parseOptionalText(value.address, 240),
    confirmationToken: value.duplicateConfirmationToken,
    photoFile: null,
  };
}

export async function POST(request: NextRequest) {
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`pandal-submission:${user.id}`, 8);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many pandal submissions. Please try again later." },
      { status: 429 }
    );
  }

  let input: SubmissionInput;
  try {
    input = await readSubmission(request);
  } catch {
    return NextResponse.json({ error: "Invalid submission data" }, { status: 400 });
  }

  const { address, city, description, latitude, longitude, name, photoFile } = input;
  if (!name || !city || latitude === null || longitude === null) {
    return NextResponse.json(
      { error: "A valid name, city, latitude, and longitude are required" },
      { status: 400 }
    );
  }

  if (!photoFile) {
    return NextResponse.json({ error: "A pandal photo is required" }, { status: 400 });
  }

  if (!isValidImageMimeType(photoFile.type)) {
    return NextResponse.json(
      { error: "Invalid photo type. Please upload JPEG, PNG, WebP, or HEIC." },
      { status: 400 }
    );
  }

  if (photoFile.size <= 0 || photoFile.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `Photo must be no larger than ${MAX_FILE_SIZE / (1024 * 1024)}MB.` },
      { status: 400 }
    );
  }

  const fingerprint = createSubmissionFingerprint({ city, latitude, longitude, name });
  const hasConfirmation = consumeDuplicateConfirmation(
    input.confirmationToken,
    user.id,
    fingerprint
  );

  if (!hasConfirmation) {
    const existingPandals = await prisma.pandal.findMany({
      where: { status: { not: PandalStatus.REJECTED } },
      select: { id: true, name: true, latitude: true, longitude: true },
    });
    const potentialDuplicates = existingPandals
      .map((pandal) => ({
        ...pandal,
        distance: haversineDistance(
          latitude,
          longitude,
          pandal.latitude,
          pandal.longitude
        ),
      }))
      .filter((pandal) => pandal.distance <= DUPLICATE_RADIUS)
      .sort((left, right) => left.distance - right.distance);

    if (potentialDuplicates.length > 0) {
      return NextResponse.json(
        {
          duplicate: true,
          message: "A similar pandal may already exist nearby",
          suggestedPandal: potentialDuplicates[0],
          confirmationToken: issueDuplicateConfirmation(user.id, fingerprint),
        },
        { status: 409 }
      );
    }
  }

  let imageUrl: string | null = null;
  try {
    const filename = generateFilename(photoFile.name);
    imageUrl = await storage.upload(
      Buffer.from(await photoFile.arrayBuffer()),
      filename,
      "pandals",
      photoFile.type
    );

    const pandal = await prisma.pandal.create({
      data: {
        name,
        description,
        latitude,
        longitude,
        city,
        address,
        status: PandalStatus.PENDING,
        submittedBy: user.id,
        isNew: true,
        photos: {
          create: {
            userId: user.id,
            imageUrl,
            moderationStatus: "PENDING",
          },
        },
      },
      include: { photos: true },
    });
    let newAchievements: string[] = [];
    try {
      newAchievements = await updatePandalSubmissionQuests(user.id);
    } catch (gamificationError) {
      // The pending submission is already durable; do not report it as failed
      // solely because a secondary progress update needs a retry.
      console.error("Pandal submission gamification update failed:", gamificationError);
    }

    return NextResponse.json(
      {
        pandal,
        newAchievements,
        message: "Your submission will be reviewed and added to the map soon!",
      },
      { status: 201 }
    );
  } catch (submissionError) {
    if (imageUrl) await storage.delete(imageUrl);
    console.error("POST /api/pandals error:", submissionError);
    return NextResponse.json(
      { error: "Unable to submit this pandal. Please try again." },
      { status: 500 }
    );
  }
}
