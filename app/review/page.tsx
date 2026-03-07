"use client";

import { useState, useEffect } from "react";
import { Heritage } from "@/lib/types";
import { getAllRecords } from "@/lib/study-storage";
import { calculateReviewScore, StudyRecord, getEmptyRecord } from "@/lib/review-score";
import { StudyButtons } from "@/components/StudyButtons";
import Link from "next/link";

interface ReviewItem {
  heritage: Heritage;
  record: StudyRecord;
  score: number;
}

export default function ReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "weak" | "manual" | "wrong">(
    "all"
  );

  useEffect(() => {
    loadReviewItems();
  }, []);

  const loadReviewItems = async () => {
    setLoading(true);
    const records = getAllRecords();
    const res = await fetch("/api/heritages");
    const heritages: Heritage[] = await res.json();

    const reviewItems: ReviewItem[] = [];

    for (const h of heritages) {
      const record = records[h.id] || getEmptyRecord(h.id);
      const score = calculateReviewScore(record);

      if (
        record.isManualReview ||
        record.isWeak ||
        record.wrongCount > 0 ||
        score > 10
      ) {
        reviewItems.push({ heritage: h, record, score });
      }
    }

    reviewItems.sort((a, b) => b.score - a.score);
    setItems(reviewItems);
    setLoading(false);
  };

  const filtered = items.filter((item) => {
    if (filter === "weak") return item.record.isWeak;
    if (filter === "manual") return item.record.isManualReview;
    if (filter === "wrong") return item.record.wrongCount > 0;
    return true;
  });

  if (loading) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">読込中...</div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">復習リスト</h1>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "すべて"],
            ["weak", "苦手"],
            ["manual", "復習登録"],
            ["wrong", "間違えた"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm border ${
              filter === key
                ? "bg-blue-100 border-blue-300 text-blue-700"
                : "border-gray-200 text-gray-500"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-[var(--muted)] mb-4">
            復習対象の遺産がありません
          </p>
          <p className="text-sm text-[var(--muted)]">
            クイズで間違えたり、苦手登録・復習登録をすると表示されます
          </p>
          <Link
            href="/quiz"
            className="inline-block mt-4 bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm"
          >
            クイズに挑戦する
          </Link>
        </div>
      ) : (
        <>
          <p className="text-sm text-[var(--muted)]">
            {filtered.length}件の復習対象
          </p>

          <div className="flex gap-2 mb-2">
            <Link
              href="/quiz"
              className="bg-[var(--primary)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
            >
              全部復習クイズ
            </Link>
            <Link
              href="/photo"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
            >
              写真で復習
            </Link>
          </div>

          <div className="space-y-3">
            {filtered.map((item) => (
              <div
                key={item.heritage.id}
                className="border border-[var(--border)] rounded-xl p-4 space-y-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      href={`/heritage/${item.heritage.id}`}
                      className="font-bold hover:text-[var(--primary)]"
                    >
                      {item.heritage.nameJa}
                    </Link>
                    <p className="text-xs text-[var(--muted)]">
                      {item.heritage.countryJa} ・{" "}
                      {item.heritage.inscriptionYear}年
                    </p>
                  </div>
                  <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                    優先度: {item.score.toFixed(1)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs text-[var(--muted)]">
                  {item.record.isWeak && (
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">
                      苦手
                    </span>
                  )}
                  {item.record.isManualReview && (
                    <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                      復習登録
                    </span>
                  )}
                  {item.record.wrongCount > 0 && (
                    <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">
                      誤答{item.record.wrongCount}回
                    </span>
                  )}
                  {item.record.correctStreak > 0 && (
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                      連続正解{item.record.correctStreak}
                    </span>
                  )}
                </div>

                <StudyButtons heritageId={item.heritage.id} compact />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
