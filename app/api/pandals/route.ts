// app/api/pandals/route.ts — Submit a new (unknown) pandal

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { haversineDistance } from "@/lib/geo";
import { storage, generateFilename, isValidImageMimeType, MAX_FILE_SIZE } from "@/lib/storage";
import { PandalStatus } from "@prisma/client";

const DUPLICATE_RADIUS = parseInt(process.env.DUPLICATE_PANDAL_RADIUS_METERS || "100");

export async function POST(request: NextRequest) {
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const contentType = request.headers.get("content-type") || "";
  let name: string | null = null;
  let description: string | null = null;
  let latitude: number | null = null;
  let longitude: number | null = null;
  let city: string | null = null;
  let address: string | null = null;
  let photoFile: File | null = null;
  let skipDuplicateCheck = false;

  if (contentType.includes("multipart/form-data")) {
    const formData = await request.formData();
    name = (formData.get("name") as string) || null;
    description = (formData.get("description") as string) || null;
    latitude = formData.get("latitude") ? parseFloat(formData.get("latitude") as string) : null;
    longitude = formData.get("longitude") ? parseFloat(formData.get("longitude") as string) : null;
    city = formData.get("city") as string;
    address = (formData.get("address") as string) || null;
    photoFile = formData.get("photo") as File | null;
    skipDuplicateCheck = formData.get("skipDuplicateCheck") === "true";
  } else {
    const body = await request.json();
    name = body.name || null;
    description = body.description || null;
    latitude = body.latitude;
    longitude = body.longitude;
    city = body.city;
    address = body.address || null;
    skipDuplicateCheck = body.skipDuplicateCheck === true;
  }

  if (!latitude || !longitude || !city) {
    return NextResponse.json(
      { error: "latitude, longitude, and city are required" },
      { status: 400 }
    );
  }

  // Duplicate detection — check for existing pandals within DUPLICATE_RADIUS
  if (!skipDuplicateCheck) {
    const allPandals = await prisma.pandal.findMany({
      where: { city, status: { not: PandalStatus.REJECTED } },
      select: { id: true, name: true, latitude: true, longitude: true },
    });

    const potentialDuplicates = allPandals
      .map((p) => ({
        ...p,
        distance: haversineDistance(latitude, longitude, p.latitude, p.longitude),
      }))
      .filter((p) => p.distance <= DUPLICATE_RADIUS)
      .sort((a, b) => a.distance - b.distance);

    if (potentialDuplicates.length > 0) {
      return NextResponse.json(
        {
          duplicate: true,
          message: "A similar pandal may already exist nearby",
          suggestedPandal: potentialDuplicates[0],
        },
        { status: 409 }
      );
    }
  }

  // Upload photo if provided
  let imageUrl: string | undefined;
  if (photoFile) {
    if (!isValidImageMimeType(photoFile.type)) {
      return NextResponse.json(
        { error: "Invalid photo type. Please upload JPEG, PNG, or WebP." },
        { status: 400 }
      );
    }
    if (photoFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `Photo too large. Max size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }
    const bytes = await photoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = generateFilename(photoFile.name);
    imageUrl = await storage.upload(buffer, filename, "pandals", photoFile.type);
  }

  // Create pending pandal
  const pandal = await prisma.pandal.create({
    data: {
      name: name || "Unknown Ganpati",
      description,
      latitude,
      longitude,
      city,
      address,
      status: PandalStatus.PENDING,
      submittedBy: user.id,
      isNew: true,
      ...(imageUrl && { photos: { create: { userId: user.id, imageUrl, moderationStatus: "APPROVED" } } }),
    },
    include: { photos: true },
  });

  return NextResponse.json(
    {
      pandal,
      message: "Your submission will be reviewed and added to the map soon!",
    },
    { status: 201 }
  );
}
