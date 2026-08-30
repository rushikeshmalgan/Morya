// app/api/admin/proxy/route.ts — Server-side proxy for admin dashboard
// Keeps all secrets server-side. Never exposes ADMIN_TOKEN or ADMIN_PASSWORD to the browser.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PandalStatus, ModerationStatus } from "@prisma/client";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "bappa-admin-secret";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "bappa-admin";

function hasAdminSession(request: NextRequest): boolean {
  return request.cookies.get("admin_session")?.value === ADMIN_TOKEN;
}

function setAdminSession(response: NextResponse) {
  response.cookies.set("admin_session", ADMIN_TOKEN, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

function clearAdminSession(response: NextResponse) {
  response.cookies.delete("admin_session");
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;

  if (password !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  setAdminSession(response);
  return response;
}

export async function GET(request: NextRequest) {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action");

  switch (action) {
    case "stats": {
      const [pendingPandals, approvedPandals, pendingPhotos, totalUsers] = await Promise.all([
        prisma.pandal.count({ where: { status: PandalStatus.PENDING } }),
        prisma.pandal.count({ where: { status: PandalStatus.APPROVED } }),
        prisma.photo.count({ where: { moderationStatus: ModerationStatus.PENDING } }),
        prisma.anonymousUser.count(),
      ]);
      return NextResponse.json({ pendingPandals, approvedPandals, pendingPhotos, totalUsers });
    }

    case "pandals": {
      const status = searchParams.get("status") as PandalStatus | null;
      const where: Record<string, unknown> = {};
      if (status && Object.values(PandalStatus).includes(status)) {
        where.status = status;
      }

      const pandals = await prisma.pandal.findMany({
        where,
        include: {
          photos: { take: 1, orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      });

      const submitterIds = pandals.map((p) => p.submittedBy).filter(Boolean) as string[];
      const submitters = await prisma.anonymousUser.findMany({
        where: { id: { in: submitterIds } },
        select: { id: true, generatedName: true, generatedNumber: true },
      });
      const submitterMap = new Map(submitters.map((s) => [s.id, s]));

      const enriched = pandals.map((p) => ({
        ...p,
        submitter: p.submittedBy ? submitterMap.get(p.submittedBy) || null : null,
      }));

      return NextResponse.json({ pandals: enriched });
    }

    case "photos": {
      const moderationStatus = searchParams.get("moderationStatus") as ModerationStatus | null;
      const where: Record<string, unknown> = {};
      if (moderationStatus && Object.values(ModerationStatus).includes(moderationStatus)) {
        where.moderationStatus = moderationStatus;
      }

      const photos = await prisma.photo.findMany({
        where,
        include: {
          user: { select: { generatedName: true, generatedNumber: true } },
          pandal: { select: { name: true, city: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ photos });
    }

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, id } = body;

  switch (action) {
    case "approve_pandal": {
      const pandal = await prisma.pandal.findUnique({ where: { id } });
      if (!pandal) return NextResponse.json({ error: "Pandal not found" }, { status: 404 });

      const updated = await prisma.pandal.update({
        where: { id },
        data: { status: PandalStatus.APPROVED },
      });

      if (pandal.status === PandalStatus.PENDING && pandal.submittedBy) {
        const achievement = await prisma.achievement.findUnique({ where: { key: "pandal_pioneer" } });
        if (achievement) {
          try {
            await prisma.userAchievement.create({
              data: { userId: pandal.submittedBy, achievementId: achievement.id },
            });
          } catch {
            // Already unlocked
          }
        }
      }

      return NextResponse.json({ pandal: updated });
    }

    case "reject_pandal": {
      const pandal = await prisma.pandal.findUnique({ where: { id } });
      if (!pandal) return NextResponse.json({ error: "Pandal not found" }, { status: 404 });

      const updated = await prisma.pandal.update({
        where: { id },
        data: { status: PandalStatus.REJECTED },
      });

      return NextResponse.json({ pandal: updated });
    }

    case "approve_photo": {
      const photo = await prisma.photo.findUnique({ where: { id } });
      if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

      const updated = await prisma.photo.update({
        where: { id },
        data: { moderationStatus: ModerationStatus.APPROVED },
        include: {
          user: { select: { generatedName: true, generatedNumber: true } },
          pandal: { select: { name: true, city: true } },
        },
      });

      return NextResponse.json({ photo: updated });
    }

    case "reject_photo": {
      const photo = await prisma.photo.findUnique({ where: { id } });
      if (!photo) return NextResponse.json({ error: "Photo not found" }, { status: 404 });

      const updated = await prisma.photo.update({
        where: { id },
        data: { moderationStatus: ModerationStatus.REJECTED },
        include: {
          user: { select: { generatedName: true, generatedNumber: true } },
          pandal: { select: { name: true, city: true } },
        },
      });

      return NextResponse.json({ photo: updated });
    }

    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!hasAdminSession(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { action, id } = body;

  if (action === "logout") {
    const response = NextResponse.json({ success: true });
    clearAdminSession(response);
    return response;
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
