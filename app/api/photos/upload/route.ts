// app/api/photos/upload/route.ts — Photo upload (multipart, no Base64)
// Supports two modes:
// 1. Direct upload: pandalId provided by client (general upload)
// 2. Visit-linked upload: visitId provided — photo is tied to an existing verified visit

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { storage, generateFilename, isValidImageMimeType, MAX_FILE_SIZE } from "@/lib/storage";
import { PhotoCategory, ModerationStatus } from "@prisma/client";

export async function POST(request: NextRequest) {
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let pandalId: string | null = null;
    let visitId: string | null = null;
    let category: PhotoCategory = PhotoCategory.BEST_BAPPA;
    let caption: string | null = null;
    let lat: number | null = null;
    let lng: number | null = null;
    let photoFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      pandalId = (formData.get("pandalId") as string) || null;
      visitId = (formData.get("visitId") as string) || null;
      const cat = formData.get("category") as string | null;
      if (cat && Object.values(PhotoCategory).includes(cat as PhotoCategory)) {
        category = cat as PhotoCategory;
      }
      caption = (formData.get("caption") as string) || null;
      const latRaw = formData.get("latitude");
      const lngRaw = formData.get("longitude");
      lat = latRaw ? parseFloat(latRaw as string) : null;
      lng = lngRaw ? parseFloat(lngRaw as string) : null;
      photoFile = formData.get("photo") as File | null;
    } else {
      const body = await request.json();
      pandalId = body.pandalId || null;
      visitId = body.visitId || null;
      if (body.category && Object.values(PhotoCategory).includes(body.category as PhotoCategory)) {
        category = body.category as PhotoCategory;
      }
      caption = body.caption || null;
      lat = body.latitude ?? null;
      lng = body.longitude ?? null;
    }

    if (!photoFile) {
      return NextResponse.json(
        { error: "photo is required" },
        { status: 400 }
      );
    }

    // Validate file type
    if (!isValidImageMimeType(photoFile.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Please upload JPEG, PNG, or WebP." },
        { status: 400 }
      );
    }

    // Validate file size
    if (photoFile.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.` },
        { status: 400 }
      );
    }

    // Resolve pandalId from visit if provided (server-authoritative)
    let finalPandalId = pandalId;
    let finalVisitId = visitId;
    let existingVisitPhotoId: string | null = null;

    if (visitId) {
      const visit = await prisma.pandalVisit.findUnique({
        where: { id: visitId },
        select: { id: true, userId: true, pandalId: true, photoId: true },
      });

      if (!visit) {
        return NextResponse.json({ error: "Visit not found" }, { status: 404 });
      }

      if (visit.userId !== user.id) {
        return NextResponse.json({ error: "Unauthorized — visit belongs to another user" }, { status: 403 });
      }

      finalPandalId = visit.pandalId;
      finalVisitId = visit.id;
      existingVisitPhotoId = visit.photoId;
    }

    if (!finalPandalId) {
      return NextResponse.json(
        { error: "pandalId or visitId is required" },
        { status: 400 }
      );
    }

    // Verify pandal exists
    const pandal = await prisma.pandal.findUnique({ where: { id: finalPandalId } });
    if (!pandal) {
      return NextResponse.json({ error: "Pandal not found" }, { status: 404 });
    }

    // Convert file to buffer and upload to storage
    const bytes = await photoFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filename = generateFilename(photoFile.name);
    const imageUrl = await storage.upload(buffer, filename, "pandals", photoFile.type);

    // Create photo record
    const photo = await prisma.photo.create({
      data: {
        userId: user.id,
        pandalId: finalPandalId,
        imageUrl,
        latitude: lat,
        longitude: lng,
        category,
        caption,
        moderationStatus: ModerationStatus.PENDING,
      },
    });

    // Link photo to visit if visit-linked upload
    if (finalVisitId && !existingVisitPhotoId) {
      await prisma.pandalVisit.update({
        where: { id: finalVisitId },
        data: { photoId: photo.id },
      });
    }

    return NextResponse.json({ photo, imageUrl }, { status: 201 });
  } catch (err) {
    console.error("Photo upload error:", err);
    return NextResponse.json(
      { error: "Photo upload failed. Please try again." },
      { status: 500 }
    );
  }
}
