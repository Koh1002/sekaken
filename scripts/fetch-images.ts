/**
 * Wikipedia APIを使って画像URLがnullの世界遺産の画像を取得し、
 * Supabaseに保存するスクリプト
 *
 * 使い方: npx tsx scripts/fetch-images.ts
 */

import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function fetchWikipediaImage(nameEn: string): Promise<string | null> {
  try {
    // Step 1: Search for the Wikipedia page
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&list=search&srsearch=${encodeURIComponent(nameEn)}&srlimit=1`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();

    const results = searchData?.query?.search;
    if (!results || results.length === 0) return null;

    const pageTitle = results[0].title;

    // Step 2: Get the main image (pageimages API)
    const imageUrl = `https://en.wikipedia.org/w/api.php?action=query&format=json&titles=${encodeURIComponent(pageTitle)}&prop=pageimages&pithumbsize=640`;
    const imageRes = await fetch(imageUrl);
    const imageData = await imageRes.json();

    const pages = imageData?.query?.pages;
    if (!pages) return null;

    const page = Object.values(pages)[0] as { thumbnail?: { source: string } };
    return page?.thumbnail?.source || null;
  } catch (e) {
    console.error(`  Error fetching image for "${nameEn}":`, e);
    return null;
  }
}

async function main() {
  // Get all heritages without images
  const { data: heritages, error } = await supabase
    .from("heritages")
    .select("id, name_en, name_ja")
    .is("image_url", null)
    .order("id");

  if (error) {
    console.error("Error fetching heritages:", error);
    return;
  }

  console.log(`Found ${heritages.length} heritages without images`);

  let updated = 0;
  let failed = 0;

  for (const h of heritages) {
    const imageUrl = await fetchWikipediaImage(h.name_en);

    if (imageUrl) {
      const { error: updateError } = await supabase
        .from("heritages")
        .update({
          image_url: imageUrl,
          image_attribution: "Wikipedia / Wikimedia Commons",
        })
        .eq("id", h.id);

      if (updateError) {
        console.error(`  Failed to update ${h.id}: ${updateError.message}`);
        failed++;
      } else {
        console.log(`  ✓ ${h.id}: ${h.name_ja} -> ${imageUrl.substring(0, 60)}...`);
        updated++;
      }
    } else {
      console.log(`  ✗ ${h.id}: ${h.name_ja} - no image found`);
      failed++;
    }

    // Rate limiting - 100ms between requests
    await new Promise((r) => setTimeout(r, 100));
  }

  console.log(`\nDone! Updated: ${updated}, Failed: ${failed}`);
}

main();
