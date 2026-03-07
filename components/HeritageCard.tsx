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
  const categoryStyle =
    heritage.category === "Cultural"
      ? { bg: "rgba(79,125,243,0.1)", color: "#4f7df3" }
      : heritage.category === "Natural"
      ? { bg: "rgba(34,197,94,0.1)", color: "#22c55e" }
      : { bg: "rgba(168,85,247,0.1)", color: "#a855f7" };

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
          className="absolute top-2.5 left-2.5 badge"
          style={{ background: categoryStyle.bg, color: categoryStyle.color }}
        >
          {categoryLabel}
        </span>
        <span className="absolute top-2.5 right-2.5 badge" style={{ background: "rgba(255,255,255,0.92)", color: "#f59e42" }}>
          {"★".repeat(heritage.examImportance)}
        </span>
      </div>

      <div className="p-3.5 space-y-2">
        <Link
          href={`/heritage/${heritage.id}`}
          className="block font-semibold text-sm hover:text-[var(--primary)] transition-colors leading-snug"
        >
          {heritage.nameJa}
        </Link>
        <p className="text-xs text-[var(--muted)]">
          {heritage.countryJa} ・ {heritage.inscriptionYear}年
        </p>
        {heritage.shortDescJa && (
          <p className="text-xs text-[var(--muted)] line-clamp-2 leading-relaxed">
            {heritage.shortDescJa}
          </p>
        )}
        <StudyButtons heritageId={heritage.id} compact />
      </div>
    </div>
  );
}
