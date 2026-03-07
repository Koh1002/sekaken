import { createClient } from "@supabase/supabase-js";
import { Heritage } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Supabase is always enabled now
export const supabaseEnabled = true;

// Convert snake_case DB row to camelCase Heritage
export function toHeritage(row: Record<string, unknown>): Heritage {
  return {
    id: row.id as number,
    nameJa: row.name_ja as string,
    nameEn: row.name_en as string,
    countryJa: row.country_ja as string,
    countryEn: row.country_en as string,
    region: row.region as string,
    category: row.category as string,
    inscriptionYear: row.inscription_year as number,
    latitude: row.latitude as number,
    longitude: row.longitude as number,
    shortDescJa: row.short_description_ja as string | null,
    memoryTipJa: row.memory_tip_ja as string | null,
    tags: row.tags as string | null,
    unescoCriteria: row.unesco_criteria as string | null,
    officialUrl: row.official_url as string | null,
    unescoUrl: row.unesco_url as string,
    sourceUrls: row.source_urls as string | null,
    imageUrl: row.image_url as string | null,
    imageAttribution: row.image_attribution as string | null,
    examImportance: row.exam_importance as number,
  };
}
