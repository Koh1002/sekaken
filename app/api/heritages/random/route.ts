import { supabase, toHeritage } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const count = Math.min(parseInt(request.nextUrl.searchParams.get("count") || "5"), 30);

  // Get total count
  const { count: total } = await supabase
    .from("heritages")
    .select("*", { count: "exact", head: true });

  if (!total) {
    return NextResponse.json([]);
  }

  // Random offset
  const skip = Math.max(0, Math.floor(Math.random() * (total - count)));

  const { data, error } = await supabase
    .from("heritages")
    .select("*")
    .range(skip, skip + count - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data || []).map(toHeritage));
}
