// app/api/user/city/route.ts — Update user city preference

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function PATCH(request: NextRequest) {
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const body = await request.json();
  const { city, cityLat, cityLng } = body;

  if (!city || typeof city !== "string") {
    return NextResponse.json({ error: "City name required" }, { status: 400 });
  }

  const updated = await prisma.anonymousUser.update({
    where: { id: user.id },
    data: { city, cityLat, cityLng },
  });

  return NextResponse.json({ city: updated.city });
}
