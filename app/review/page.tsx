"use client";

import { useState, useEffect } from "react";
import { Heritage } from "@/lib/types";
import { getAllRecordsAsync } from "@/lib/study-storage";
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
  const [filter, setFilter] = useState<"all" | "high" | "weak" | "manual" | "wrong">(
    "all"
  );

  useEffect(() => {
    loadReviewItems();
  }, []);

  const loadReviewItems = async () => {
    setLoading(true);
    const records = await getAllRecordsAsync();
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
    if (filter === "high") return item.score >= 15;
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
    <div className="max-w-3xl space-y-5">
      <h1 className="page-header">復習リスト</h1>

      <div className="flex flex-wrap gap-2">
        {(
          [
            ["all", "すべて"],
            ["high", "高優先度"],
            ["weak", "苦手"],
            ["manual", "復習登録"],
            ["wrong", "間違えた"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`filter-btn ${filter === key ? "filter-btn-active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-12 px-6">
          <p className="text-[var(--muted)] mb-2">
            復習対象の遺産がありません
          </p>
          <p className="text-sm text-[var(--muted)] mb-4">
            クイズで間違えたり、苦手登録・復習登録をすると表示されます
          </p>
          <Link href="/quiz" className="btn-primary inline-block text-sm">
            クイズに挑戦する
          </Link>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-[var(--muted)]">
              {filtered.length}件の復習対象
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/quiz?ids=${filtered.map((i) => i.heritage.id).join(",")}`}
              className="btn-primary text-sm"
            >
              全部復習クイズ ({filtered.length}件)
            </Link>
            {items.filter((i) => i.score >= 15).length > 0 && filter !== "high" && (
              <button
                onClick={() => setFilter("high")}
                className="text-sm font-semibold px-4 py-2 rounded-xl text-white"
                style={{ background: "var(--danger)" }}
              >
                高優先度のみ表示
              </button>
            )}
            <Link href="/photo" className="btn-secondary text-sm">
              写真で復習
            </Link>
          </div>

          <div className="space-y-2.5">
            {filtered.map((item) => (
              <div
                key={item.heritage.id}
                className="card p-4 space-y-2.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <Link
                      href={`/heritage/${item.heritage.id}`}
                      className="font-semibold hover:text-[var(--primary)] transition-colors"
                    >
                      {item.heritage.nameJa}
                    </Link>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      {item.heritage.countryJa} ・{" "}
                      {item.heritage.inscriptionYear}年
                    </p>
                  </div>
                  <span className="badge" style={{ background: "rgba(245,158,66,0.1)", color: "#d97b06" }}>
                    優先度: {item.score.toFixed(1)}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {item.record.isWeak && (
                    <span className="badge" style={{ background: "rgba(239,68,68,0.1)", color: "var(--danger)" }}>
                      苦手
                    </span>
                  )}
                  {item.record.isManualReview && (
                    <span className="badge" style={{ background: "rgba(245,158,66,0.1)", color: "#d97b06" }}>
                      復習登録
                    </span>
                  )}
                  {item.record.wrongCount > 0 && (
                    <span className="badge" style={{ background: "rgba(239,68,68,0.1)", color: "var(--danger)" }}>
                      誤答{item.record.wrongCount}回
                    </span>
                  )}
                  {item.record.correctStreak > 0 && (
                    <span className="badge" style={{ background: "rgba(34,197,94,0.1)", color: "var(--success)" }}>
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
