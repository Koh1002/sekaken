import { PrismaClient } from "@prisma/client";
import { allHeritages } from "../data/index";

const prisma = new PrismaClient();

async function main() {
  console.log(`Seeding ${allHeritages.length} heritage sites...`);

  // 既存データを削除
  await prisma.heritage.deleteMany();

  // バッチでインサート
  let count = 0;
  for (const h of allHeritages) {
    await prisma.heritage.create({
      data: {
        id: h.id,
        nameJa: h.nameJa,
        nameEn: h.nameEn,
        countryJa: h.countryJa,
        countryEn: h.countryEn,
        region: h.region,
        category: h.category,
        inscriptionYear: h.inscriptionYear,
        latitude: h.latitude,
        longitude: h.longitude,
        shortDescJa: h.shortDescJa,
        memoryTipJa: h.memoryTipJa,
        tags: h.tags,
        unescoCriteria: h.unescoCriteria,
        officialUrl: h.officialUrl,
        unescoUrl: h.unescoUrl,
        sourceUrls: null,
        imageUrl: h.imageUrl ?? null,
        imageAttribution: h.imageAttribution ?? null,
        examImportance: h.examImportance,
      },
    });
    count++;
    if (count % 50 === 0) {
      console.log(`  ...${count} sites inserted`);
    }
  }

  console.log(`Done! ${count} heritage sites seeded.`);

  // 統計表示
  const stats = await prisma.heritage.groupBy({
    by: ["region"],
    _count: { id: true },
  });
  console.log("\nBy region:");
  for (const s of stats) {
    console.log(`  ${s.region}: ${s._count.id} sites`);
  }

  const catStats = await prisma.heritage.groupBy({
    by: ["category"],
    _count: { id: true },
  });
  console.log("\nBy category:");
  for (const s of catStats) {
    console.log(`  ${s.category}: ${s._count.id} sites`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
