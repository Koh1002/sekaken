"use client";

import Link from "next/link";
import { Heritage } from "@/lib/types";
import { StudyButtons } from "@/components/StudyButtons";
import { HeritageImage } from "@/components/HeritageImage";

export function HeritageCard({ heritage }: { heritage: Heritage }) {
  const categoryLabel =
    heritage.category === "Cultural"
      ? "文化"
      : heritage.category === "Natural"
      ? "自然"
      : "複合";
  const categoryColor =
    heritage.category === "Cultural"
      ? "bg-blue-100 text-blue-700"
      : heritage.category === "Natural"
      ? "bg-green-100 text-green-700"
      : "bg-purple-100 text-purple-700";

  return (
    <div className="card overflow-hidden">
      <div className="h-40 relative">
        <HeritageImage
          imageUrl={heritage.imageUrl}
          nameEn={heritage.nameEn}
          nameJa={heritage.nameJa}
          category={heritage.category}
          className="w-full h-full"
        />
        <span
          className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-xs font-semibold backdrop-blur-sm ${categoryColor}`}
        >
          {categoryLabel}
        </span>
        <span className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-lg text-xs text-amber-500">
          {"★".repeat(heritage.examImportance)}
        </span>
      </div>

      <div className="p-3 space-y-2">
        <Link
          href={`/heritage/${heritage.id}`}
          className="block font-bold text-sm hover:text-[var(--primary)] transition-colors"
        >
          {heritage.nameJa}
        </Link>
        <p className="text-xs text-[var(--muted)]">
          {heritage.countryJa} ・ {heritage.inscriptionYear}年
        </p>
        {heritage.shortDescJa && (
          <p className="text-xs text-[var(--muted)] line-clamp-2">
            {heritage.shortDescJa}
          </p>
        )}
        <StudyButtons heritageId={heritage.id} compact />
      </div>
    </div>
  );
}
