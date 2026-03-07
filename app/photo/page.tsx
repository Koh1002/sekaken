"use client";

import { useState, useEffect } from "react";
import { Heritage } from "@/lib/types";
import { StudyButtons } from "@/components/StudyButtons";
import { HeritageImage } from "@/components/HeritageImage";
import { addStudyTime } from "@/lib/study-activity";

export default function PhotoPage() {
  const [heritages, setHeritages] = useState<Heritage[]>([]);
  const [current, setCurrent] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  // Track study time
  useEffect(() => {
    const start = Date.now();
    return () => {
      const elapsed = Math.round((Date.now() - start) / 1000);
      if (elapsed > 3) addStudyTime(elapsed);
    };
  }, []);

  useEffect(() => {
    fetch("/api/heritages")
      .then((res) => res.json())
      .then((data: Heritage[]) => {
        const shuffled = data.sort(() => Math.random() - 0.5);
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
        <p className="text-[var(--muted)]">遺産データがありません</p>
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
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">写真で学ぶ</h1>
        <span className="text-sm text-[var(--muted)] px-3 py-1 rounded-full" style={{ background: "rgba(0,184,148,0.1)", color: "var(--primary)" }}>
          {current + 1} / {heritages.length}
        </span>
      </div>

      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${((current + 1) / heritages.length) * 100}%` }} />
      </div>

      <div className="card overflow-hidden">
        <div className="h-72">
          <HeritageImage
            imageUrl={h.imageUrl}
            nameEn={h.nameEn}
            nameJa={showAnswer ? h.nameJa : "世界遺産の写真"}
            category={h.category}
            className="w-full h-full"
          />
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
                <div className="card p-3" style={{ borderColor: "var(--accent)" }}>
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

      <div className="flex justify-between gap-2">
        <button
          onClick={prev}
          className="px-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
        >
          ← 前へ
        </button>

        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="btn-primary text-sm flex-1 text-center"
          >
            答えを見る
          </button>
        ) : (
          <button
            onClick={next}
            className="btn-primary text-sm flex-1 text-center"
          >
            次へ →
          </button>
        )}

        <button
          onClick={next}
          className="px-4 py-2.5 rounded-xl text-sm font-medium border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all"
        >
          スキップ
        </button>
      </div>
    </div>
  );
}
