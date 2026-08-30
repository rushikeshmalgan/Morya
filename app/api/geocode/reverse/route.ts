// app/api/geocode/reverse/route.ts — Proxy for Nominatim reverse geocoding

import { NextRequest, NextResponse } from "next/server";
import { reverseGeocodeCity } from "@/lib/geo";
import { parseCoordinate } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseCoordinate(searchParams.get("lat"), "latitude");
  const lng = parseCoordinate(searchParams.get("lng"), "longitude");

  if (lat === null || lng === null) {
    return NextResponse.json({ error: "Valid lat and lng are required" }, { status: 400 });
  }

  const city = await reverseGeocodeCity(lat, lng);
  return NextResponse.json({ city });
}
