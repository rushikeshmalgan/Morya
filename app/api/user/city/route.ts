// app/api/user/city/route.ts — Update user city preference

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import { parseCoordinate, parseRequiredText } from "@/lib/validation";

export async function PATCH(request: NextRequest) {
  const { user, error } = await requireSession(request);
  if (error || !user) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const city = parseRequiredText(body?.city, 2, 120);
  const cityLat = parseCoordinate(body?.cityLat, "latitude");
  const cityLng = parseCoordinate(body?.cityLng, "longitude");

  if (!city) {
    return NextResponse.json({ error: "City name required" }, { status: 400 });
  }
  if ((body?.cityLat !== undefined || body?.cityLng !== undefined) && (cityLat === null || cityLng === null)) {
    return NextResponse.json({ error: "cityLat and cityLng must be valid coordinates" }, { status: 400 });
  }

  const updated = await prisma.anonymousUser.update({
    where: { id: user.id },
    data: { city, cityLat, cityLng },
  });

  return NextResponse.json({ city: updated.city });
}
