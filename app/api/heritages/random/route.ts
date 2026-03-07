import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const count = parseInt(request.nextUrl.searchParams.get("count") || "5");

  const total = await prisma.heritage.count();
  const skip = Math.max(0, Math.floor(Math.random() * (total - count)));

  const heritages = await prisma.heritage.findMany({
    take: count,
    skip,
  });

  return NextResponse.json(heritages);
}
