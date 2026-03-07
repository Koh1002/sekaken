"use client";

import { useState, useEffect } from "react";
import { Heritage } from "@/lib/types";
import { StudyButtons } from "@/components/StudyButtons";

export default function PhotoPage() {
  const [heritages, setHeritages] = useState<Heritage[]>([]);
  const [current, setCurrent] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/heritages")
      .then((res) => res.json())
      .then((data: Heritage[]) => {
        const withImages = data.filter((h) => h.imageUrl);
        const shuffled = withImages.sort(() => Math.random() - 0.5);
        setHeritages(shuffled);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12 text-[var(--muted)]">読込中...</div>
    );
  }

  if (heritages.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--muted)]">画像付きの遺産データがありません</p>
      </div>
    );
  }

  const h = heritages[current];

  const next = () => {
    setShowAnswer(false);
    setCurrent((prev) => (prev + 1) % heritages.length);
  };

  const prev = () => {
    setShowAnswer(false);
    setCurrent(
      (prev) => (prev - 1 + heritages.length) % heritages.length
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">写真で学ぶ</h1>
      <p className="text-sm text-[var(--muted)]">
        {current + 1} / {heritages.length}
      </p>

      <div className="bg-white rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="h-72 bg-gray-100">
          {h.imageUrl && (
            <img
              src={h.imageUrl}
              alt={showAnswer ? h.nameJa : "世界遺産の写真"}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="p-4 space-y-3">
          {showAnswer ? (
            <>
              <h2 className="text-xl font-bold">{h.nameJa}</h2>
              <p className="text-sm text-[var(--muted)]">{h.nameEn}</p>
              <p className="text-sm">
                {h.countryJa} ・ {h.inscriptionYear}年 ・{" "}
                {h.category === "Cultural"
                  ? "文化遺産"
                  : h.category === "Natural"
                  ? "自然遺産"
                  : "複合遺産"}
              </p>
              {h.shortDescJa && (
                <p className="text-sm text-[var(--muted)]">{h.shortDescJa}</p>
              )}
              {h.memoryTipJa && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm">💡 {h.memoryTipJa}</p>
                </div>
              )}
              <StudyButtons heritageId={h.id} />
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-lg text-[var(--muted)]">
                この世界遺産は何でしょう？
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={prev}
          className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm hover:bg-gray-50"
        >
          ← 前へ
        </button>

        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="px-6 py-2 bg-[var(--primary)] text-white rounded-lg text-sm font-semibold hover:opacity-90"
          >
            答えを見る
          </button>
        ) : (
          <button
            onClick={next}
            className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:opacity-90"
          >
            次へ →
          </button>
        )}

        <button
          onClick={next}
          className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm hover:bg-gray-50"
        >
          スキップ →
        </button>
      </div>
    </div>
  );
}
