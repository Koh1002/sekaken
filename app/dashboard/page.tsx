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
    <div className="max-w-4xl space-y-6">
      <h1 className="page-header">学習ダッシュボード</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="総遺産数" value={stats.total} icon="📊" />
        <StatCard label="学習済み" value={stats.studied} icon="📚" />
        <StatCard label="覚えた" value={stats.learned} color="var(--success)" icon="✓" />
        <StatCard label="苦手" value={stats.weak} color="var(--danger)" icon="!" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="復習対象" value={stats.reviewCount} color="var(--warning)" icon="↻" />
        <StatCard label="正答率" value={`${rate}%`} icon="%" />
        <StatCard label="解答数" value={stats.totalCorrect + stats.totalWrong} icon="#" />
      </div>

      {stats.recommended.length > 0 && (
        <div className="card p-5 space-y-3" style={{ borderColor: "rgba(196,163,90,0.25)" }}>
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs" style={{ background: "rgba(196,163,90,0.12)", color: "var(--warning)" }}>★</span>
            今日のおすすめ復習
          </h2>
          <div className="space-y-1.5">
            {stats.recommended.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                href={`/heritage/${item.id}`}
                className="block rounded-xl p-3 text-sm hover:bg-[var(--background)] transition-colors border border-[var(--border)]"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-xs text-[var(--muted)] ml-2">
                  優先度: {item.score.toFixed(1)}
                </span>
              </Link>
            ))}
          </div>
          <Link href="/review" className="btn-primary inline-block text-sm">
            復習を始める
          </Link>
        </div>
      )}

      {stats.recentWrong.length > 0 && (
        <div className="card p-5 space-y-3" style={{ borderColor: "rgba(192,57,43,0.3)" }}>
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs" style={{ background: "rgba(192,57,43,0.1)", color: "var(--danger)" }}>×</span>
            最近間違えた遺産
          </h2>
          <div className="space-y-1.5">
            {stats.recentWrong.map((item) => (
              <Link
                key={item.id}
                href={`/heritage/${item.id}`}
                className="block rounded-xl p-3 text-sm hover:bg-[var(--background)] transition-colors border border-[var(--border)]"
              >
                <span className="font-medium">{item.name}</span>
                <span className="text-xs ml-2" style={{ color: "var(--danger)" }}>
                  {item.wrongCount}回間違い
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link href="/quiz" className="flex-1 btn-primary text-center py-3">
          クイズに挑戦
        </Link>
        <Link href="/heritage" className="flex-1 btn-secondary text-center py-3">
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
  icon,
}: {
  label: string;
  value: number | string;
  color?: string;
  icon?: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-[var(--muted)] font-medium">{label}</p>
        {icon && (
          <span className="w-6 h-6 rounded-md flex items-center justify-center text-xs"
            style={{ background: color ? `${color}15` : "var(--background)", color: color || "var(--muted)" }}>
            {icon}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold" style={{ color: color || "var(--foreground)" }}>{value}</p>
    </div>
  );
}
