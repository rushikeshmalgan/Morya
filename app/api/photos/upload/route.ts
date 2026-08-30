// app/api/photos/upload/route.ts — Visit-aware multipart photo upload.

import { NextRequest, NextResponse } from "next/server";
import { ModerationStatus, PhotoCategory, PandalStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, requireSession } from "@/lib/auth";
import { awardAchievement, updatePhotoQuests } from "@/lib/achievements";
import {
  generateFilename,
  isValidImageMimeType,
  MAX_FILE_SIZE,
  storage,
} from "@/lib/storage";
import { parseCoordinate, parseOptionalText } from "@/lib/validation";

class VisitAlreadyHasPhotoError extends Error {}

export async function POST(request: NextRequest) {
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { allowed } = checkRateLimit(`photo-upload:${user.id}`, 30);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many photo uploads. Please try again later." },
      { status: 429 }
    );
  }

  if (!(request.headers.get("content-type") || "").includes("multipart/form-data")) {
    return NextResponse.json({ error: "Photo uploads must use multipart form data" }, { status: 415 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid photo upload" }, { status: 400 });
  }

  const photoValue = formData.get("photo");
  const photoFile = photoValue instanceof File ? photoValue : null;
  const pandalValue = formData.get("pandalId");
  const visitValue = formData.get("visitId");
  const pandalId = typeof pandalValue === "string" && pandalValue.length >= 10 ? pandalValue : null;
  const visitId = typeof visitValue === "string" && visitValue.length >= 10 ? visitValue : null;
  const categoryValue = formData.get("category");
  const category =
    typeof categoryValue === "string" && categoryValue !== ""
      ? categoryValue as PhotoCategory
      : PhotoCategory.BEST_BAPPA;
  const captionValue = formData.get("caption");
  const caption = parseOptionalText(captionValue, 500);
  const latValue = formData.get("latitude");
  const lngValue = formData.get("longitude");
  const latitude = parseCoordinate(latValue, "latitude");
  const longitude = parseCoordinate(lngValue, "longitude");

  if (!photoFile) {
    return NextResponse.json({ error: "photo is required" }, { status: 400 });
  }
  if (!pandalId && !visitId) {
    return NextResponse.json({ error: "pandalId or visitId is required" }, { status: 400 });
  }
  if (!Object.values(PhotoCategory).includes(category)) {
    return NextResponse.json({ error: "Invalid photo category" }, { status: 400 });
  }
  if (captionValue && !caption) {
    return NextResponse.json({ error: "Caption must be 500 characters or fewer" }, { status: 400 });
  }
  if ((latValue || lngValue) && (latitude === null || longitude === null)) {
    return NextResponse.json({ error: "Latitude and longitude must be valid coordinates" }, { status: 400 });
  }
  if (!isValidImageMimeType(photoFile.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Please upload JPEG, PNG, WebP, or HEIC." },
      { status: 400 }
    );
  }
  if (photoFile.size <= 0 || photoFile.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: `File must be no larger than ${MAX_FILE_SIZE / (1024 * 1024)}MB.` },
      { status: 400 }
    );
  }

  let finalPandalId = pandalId;
  let finalVisitId: string | null = null;
  if (visitId) {
    const visit = await prisma.pandalVisit.findUnique({
      where: { id: visitId },
      select: { id: true, userId: true, pandalId: true, photoId: true, verificationStatus: true },
    });
    if (!visit) return NextResponse.json({ error: "Visit not found" }, { status: 404 });
    if (visit.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized — visit belongs to another user" }, { status: 403 });
    }
    if (visit.verificationStatus !== "VERIFIED") {
      return NextResponse.json({ error: "Photos can only be linked to verified visits" }, { status: 409 });
    }
    if (visit.photoId) {
      return NextResponse.json({ error: "A photo is already linked to this visit" }, { status: 409 });
    }
    finalPandalId = visit.pandalId;
    finalVisitId = visit.id;
  }

  const pandal = await prisma.pandal.findUnique({
    where: { id: finalPandalId || "" },
    select: { id: true, status: true },
  });
  if (!pandal || pandal.status !== PandalStatus.APPROVED) {
    return NextResponse.json({ error: "Pandal not found" }, { status: 404 });
  }

  let imageUrl: string | null = null;
  try {
    imageUrl = await storage.upload(
      Buffer.from(await photoFile.arrayBuffer()),
      generateFilename(photoFile.name),
      "pandals",
      photoFile.type
    );

    const photo = await prisma.$transaction(async (tx) => {
      const created = await tx.photo.create({
        data: {
          userId: user.id,
          pandalId: pandal.id,
          imageUrl: imageUrl!,
          latitude,
          longitude,
          category,
          caption,
          moderationStatus: ModerationStatus.PENDING,
        },
      });

      if (finalVisitId) {
        const linked = await tx.pandalVisit.updateMany({
          where: {
            id: finalVisitId,
            userId: user.id,
            photoId: null,
            verificationStatus: "VERIFIED",
          },
          data: { photoId: created.id },
        });
        if (linked.count !== 1) throw new VisitAlreadyHasPhotoError();
      }
      return created;
    });

    const newAchievements: string[] = [];
    try {
      if (await awardAchievement(user.id, "first_photo")) newAchievements.push("first_photo");
      newAchievements.push(...(await updatePhotoQuests(user.id)));
    } catch (gamificationError) {
      console.error("Photo gamification update failed:", gamificationError);
    }

    return NextResponse.json({ photo, imageUrl, newAchievements }, { status: 201 });
  } catch (uploadError) {
    if (imageUrl) await storage.delete(imageUrl);
    if (uploadError instanceof VisitAlreadyHasPhotoError) {
      return NextResponse.json({ error: "A photo is already linked to this visit" }, { status: 409 });
    }
    console.error("POST /api/photos/upload error:", uploadError);
    return NextResponse.json({ error: "Photo upload failed. Please try again." }, { status: 500 });
  }
}
