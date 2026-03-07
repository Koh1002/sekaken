"use client";

import Link from "next/link";
import { Heritage } from "@/lib/types";
import { StudyButtons } from "@/components/StudyButtons";

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
    <div className="border border-[var(--border)] rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-40 bg-gray-100 relative">
        {heritage.imageUrl ? (
          <img
            src={heritage.imageUrl}
            alt={heritage.nameJa}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl text-gray-300">
            {heritage.category === "Natural" ? "🌿" : heritage.category === "Mixed" ? "🌍" : "🏛️"}
          </div>
        )}
        <span
          className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-semibold ${categoryColor}`}
        >
          {categoryLabel}
        </span>
        <span className="absolute top-2 right-2 bg-white/90 px-2 py-0.5 rounded text-xs">
          {"★".repeat(heritage.examImportance)}
        </span>
      </div>

      <div className="p-3 space-y-2">
        <Link
          href={`/heritage/${heritage.id}`}
          className="block font-bold text-sm hover:text-[var(--primary)]"
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
