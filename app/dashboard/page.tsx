"use client";

import { useState, useEffect } from "react";
import { Heritage } from "@/lib/types";
import { getAllRecordsAsync } from "@/lib/study-storage";
import { calculateReviewScore, getEmptyRecord } from "@/lib/review-score";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total: 0,
    studied: 0,
    learned: 0,
    weak: 0,
    reviewCount: 0,
    totalCorrect: 0,
    totalWrong: 0,
    recentWrong: [] as { id: number; name: string; wrongCount: number }[],
    recommended: [] as { id: number; name: string; score: number }[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const records = await getAllRecordsAsync();
    const res = await fetch("/api/heritages");
    const heritages: Heritage[] = await res.json();

    let studied = 0;
    let learned = 0;
    let weak = 0;
    let reviewCount = 0;
    let totalCorrect = 0;
    let totalWrong = 0;
    const recentWrong: { id: number; name: string; wrongCount: number }[] = [];
    const reviewItems: { id: number; name: string; score: number }[] = [];

    for (const h of heritages) {
      const r = records[h.id];
      if (r) {
        if (r.correctCount > 0 || r.wrongCount > 0) studied++;
        if (r.isLearned) learned++;
        if (r.isWeak) weak++;
        if (r.isManualReview) reviewCount++;
        totalCorrect += r.correctCount;
        totalWrong += r.wrongCount;

        if (r.wrongCount > 0) {
          recentWrong.push({
            id: h.id,
            name: h.nameJa,
            wrongCount: r.wrongCount,
          });
        }
      }

      const record = r || getEmptyRecord(h.id);
      const score = calculateReviewScore(record);
      if (score > 5) {
        reviewItems.push({ id: h.id, name: h.nameJa, score });
      }
    }

    recentWrong.sort((a, b) => b.wrongCount - a.wrongCount);
    reviewItems.sort((a, b) => b.score - a.score);

    setStats({
      total: heritages.length,
      studied,
      learned,
      weak,
      reviewCount,
      totalCorrect,
      totalWrong,
      recentWrong: recentWrong.slice(0, 10),
      recommended: reviewItems.slice(0, 10),
    });
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">読込中...</div>
    );
  }

  const rate =
    stats.totalCorrect + stats.totalWrong > 0
      ? Math.round(
          (stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100
        )
      : 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">学習ダッシュボード</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="総遺産数" value={stats.total} />
        <StatCard label="学習済み" value={stats.studied} />
        <StatCard label="覚えた" value={stats.learned} color="green" />
        <StatCard label="苦手" value={stats.weak} color="red" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <StatCard label="復習対象" value={stats.reviewCount} color="amber" />
        <StatCard label="正答率" value={`${rate}%`} />
        <StatCard
          label="解答数"
          value={stats.totalCorrect + stats.totalWrong}
        />
      </div>

      {stats.recommended.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <h2 className="font-bold">今日のおすすめ復習</h2>
          <div className="space-y-2">
            {stats.recommended.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                href={`/heritage/${item.id}`}
                className="block bg-white rounded-lg p-2 text-sm hover:bg-amber-50 border border-amber-100"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-xs text-[var(--muted)] ml-2">
                  優先度: {item.score.toFixed(1)}
                </span>
              </Link>
            ))}
          </div>
          <Link
            href="/review"
            className="inline-block bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            復習を始める
          </Link>
        </div>
      )}

      {stats.recentWrong.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
          <h2 className="font-bold">最近間違えた遺産</h2>
          <div className="space-y-2">
            {stats.recentWrong.map((item) => (
              <Link
                key={item.id}
                href={`/heritage/${item.id}`}
                className="block bg-white rounded-lg p-2 text-sm hover:bg-red-50 border border-red-100"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-xs text-red-600 ml-2">
                  {item.wrongCount}回間違い
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <Link
          href="/quiz"
          className="flex-1 text-center bg-[var(--primary)] text-white py-3 rounded-lg font-semibold"
        >
          クイズに挑戦
        </Link>
        <Link
          href="/heritage"
          className="flex-1 text-center bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold"
        >
          遺産一覧
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color?: string;
}) {
  const colorClasses: Record<string, string> = {
    green: "bg-green-50 border-green-200",
    red: "bg-red-50 border-red-200",
    amber: "bg-amber-50 border-amber-200",
  };

  return (
    <div
      className={`rounded-xl border p-4 ${
        color
          ? colorClasses[color] || "bg-[var(--card-bg)] border-[var(--border)]"
          : "bg-[var(--card-bg)] border-[var(--border)]"
      }`}
    >
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
