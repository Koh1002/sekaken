import { supabase, toHeritage } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const region = searchParams.get("region");
  const search = searchParams.get("search");
  const importance = searchParams.get("importance");

  let query = supabase.from("heritages").select("*");

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  if (region && region !== "all") {
    if (region === "japan") {
      query = query.eq("country_en", "Japan");
    } else {
      const regionMap: Record<string, string> = {
        europe: "Europe and North America",
        asia: "Asia and the Pacific",
        americas: "Latin America and the Caribbean",
        africa: "Africa",
        arab: "Arab States",
      };
      if (regionMap[region]) {
        query = query.eq("region", regionMap[region]);
      }
    }
  }

  if (search) {
    query = query.or(
      `name_ja.ilike.%${search}%,name_en.ilike.%${search}%,country_ja.ilike.%${search}%,short_description_ja.ilike.%${search}%`
    );
  }

  if (importance) {
    query = query.gte("exam_importance", parseInt(importance));
  }

  query = query.order("exam_importance", { ascending: false }).order("inscription_year", { ascending: true });

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json((data || []).map(toHeritage));
}
