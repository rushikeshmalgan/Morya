import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city");

    const where: Record<string, unknown> = {
      status: "APPROVED",
    };

    if (city && city !== "ALL") {
      where.city = { equals: city };
    }

    // Prioritize rare/iconic pandals first, then by establishment
    const pandals = await prisma.pandal.findMany({
      where,
      include: {
        photos: {
          take: 1,
          select: {
            imageUrl: true,
          },
        },
      },
      orderBy: [
        { isRare: "desc" },
        { established: "asc" },
      ],
    });

    const formatted = pandals.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      latitude: p.latitude,
      longitude: p.longitude,
      address: p.address,
      city: p.city,
      established: p.established,
      isRare: p.isRare,
      visitCount: 0,
      imageUrl: p.photos[0]?.imageUrl || null,
      aartiTimes: p.aartiTimes ? JSON.parse(p.aartiTimes) : [],
    }));

    return NextResponse.json({ pandals: formatted });
  } catch (error) {
    console.error("Famous pandals fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch famous pandals" }, { status: 500 });
  }
}
