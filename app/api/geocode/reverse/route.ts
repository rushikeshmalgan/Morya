// app/api/geocode/reverse/route.ts — Proxy for Nominatim reverse geocoding

import { NextRequest, NextResponse } from "next/server";
import { reverseGeocodeCity } from "@/lib/geo";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = parseFloat(searchParams.get("lat") || "");
  const lng = parseFloat(searchParams.get("lng") || "");

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng required" }, { status: 400 });
  }

  const city = await reverseGeocodeCity(lat, lng);
  return NextResponse.json({ city });
}
