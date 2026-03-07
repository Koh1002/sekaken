import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const region = searchParams.get("region");
  const search = searchParams.get("search");
  const importance = searchParams.get("importance");

  const where: Record<string, unknown> = {};

  if (category && category !== "all") {
    where.category = category;
  }

  if (region && region !== "all") {
    if (region === "japan") {
      where.countryEn = "Japan";
    } else {
      const regionMap: Record<string, string> = {
        europe: "Europe and North America",
        asia: "Asia and the Pacific",
        americas: "Latin America and the Caribbean",
        africa: "Africa",
        arab: "Arab States",
      };
      if (regionMap[region]) {
        where.region = regionMap[region];
      }
    }
  }

  if (search) {
    where.OR = [
      { nameJa: { contains: search } },
      { nameEn: { contains: search } },
      { countryJa: { contains: search } },
      { shortDescJa: { contains: search } },
    ];
  }

  if (importance) {
    where.examImportance = { gte: parseInt(importance) };
  }

  const heritages = await prisma.heritage.findMany({
    where,
    orderBy: [{ examImportance: "desc" }, { inscriptionYear: "asc" }],
  });

  return NextResponse.json(heritages);
}
