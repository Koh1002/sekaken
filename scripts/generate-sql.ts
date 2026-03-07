// Generate Supabase INSERT SQL for all heritage data
// Usage: npx tsx scripts/generate-sql.ts > supabase-seed.sql

import { allHeritages } from "../data";

function escapeSQL(str: string | null | undefined): string {
  if (!str) return "NULL";
  return `'${str.replace(/'/g, "''")}'`;
}

console.log("-- World Heritage data seed for Supabase");
console.log("-- Generated: " + new Date().toISOString());
console.log(`-- Total entries: ${allHeritages.length}`);
console.log("");
console.log("-- Drop existing table and recreate");
console.log("DROP TABLE IF EXISTS heritages;");
console.log("");
console.log(`CREATE TABLE heritages (
  id INTEGER PRIMARY KEY,
  name_ja TEXT NOT NULL,
  name_en TEXT NOT NULL,
  country_ja TEXT NOT NULL,
  country_en TEXT NOT NULL,
  region TEXT NOT NULL,
  category TEXT NOT NULL,
  inscription_year INTEGER NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  short_description_ja TEXT,
  memory_tip_ja TEXT,
  tags TEXT,
  unesco_criteria TEXT,
  official_url TEXT,
  unesco_url TEXT,
  source_urls TEXT,
  image_url TEXT,
  image_attribution TEXT,
  exam_importance INTEGER NOT NULL DEFAULT 3
);`);
console.log("");
console.log("-- Insert all heritage data");

for (const h of allHeritages) {
  console.log(`INSERT INTO heritages (id, name_ja, name_en, country_ja, country_en, region, category, inscription_year, latitude, longitude, short_description_ja, memory_tip_ja, tags, unesco_criteria, official_url, unesco_url, source_urls, image_url, image_attribution, exam_importance) VALUES (${h.id}, ${escapeSQL(h.nameJa)}, ${escapeSQL(h.nameEn)}, ${escapeSQL(h.countryJa)}, ${escapeSQL(h.countryEn)}, ${escapeSQL(h.region)}, ${escapeSQL(h.category)}, ${h.inscriptionYear}, ${h.latitude}, ${h.longitude}, ${escapeSQL(h.shortDescJa)}, ${escapeSQL(h.memoryTipJa)}, ${escapeSQL(h.tags)}, ${escapeSQL(h.unescoCriteria)}, ${escapeSQL(h.officialUrl)}, ${escapeSQL(h.unescoUrl)}, ${escapeSQL(h.sourceUrls)}, ${escapeSQL(h.imageUrl)}, ${escapeSQL(h.imageAttribution)}, ${h.examImportance});`);
}

console.log("");
console.log("-- Done!");
