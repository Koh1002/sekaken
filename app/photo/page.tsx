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
        <h1 className="page-header">写真で学ぶ</h1>
        <span className="badge" style={{ background: "rgba(196,163,90,0.12)", color: "var(--accent-dark)" }}>
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

        <div className="p-5 space-y-3">
          {showAnswer ? (
            <>
              <h2 className="text-lg font-bold">{h.nameJa}</h2>
              <p className="text-sm text-[var(--muted)]">{h.nameEn}</p>
              <div className="flex gap-2 flex-wrap">
                <span className="badge" style={{ background: "var(--background)", color: "var(--foreground)" }}>
                  {h.countryJa}
                </span>
                <span className="badge" style={{ background: "var(--background)", color: "var(--foreground)" }}>
                  {h.inscriptionYear}年
                </span>
                <span className="badge" style={{
                  background: h.category === "Cultural" ? "rgba(196,163,90,0.12)" : h.category === "Natural" ? "rgba(46,139,87,0.1)" : "rgba(124,109,171,0.1)",
                  color: h.category === "Cultural" ? "#1a2d50" : h.category === "Natural" ? "#2e8b57" : "#7c6dab"
                }}>
                  {h.category === "Cultural" ? "文化遺産" : h.category === "Natural" ? "自然遺産" : "複合遺産"}
                </span>
              </div>
              {h.shortDescJa && (
                <p className="text-sm text-[var(--muted)] leading-relaxed">{h.shortDescJa}</p>
              )}
              {h.memoryTipJa && (
                <div className="rounded-xl p-3 text-sm" style={{ background: "rgba(196,163,90,0.1)", border: "1px solid rgba(196,163,90,0.2)" }}>
                  💡 {h.memoryTipJa}
                </div>
              )}
              <StudyButtons heritageId={h.id} />
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-base text-[var(--muted)]">
                この世界遺産は何でしょう？
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between gap-2">
        <button onClick={prev} className="btn-secondary text-sm px-4">
          ← 前へ
        </button>

        {!showAnswer ? (
          <button onClick={() => setShowAnswer(true)} className="btn-primary text-sm flex-1 text-center">
            答えを見る
          </button>
        ) : (
          <button onClick={next} className="btn-primary text-sm flex-1 text-center">
            次へ →
          </button>
        )}

        <button onClick={next} className="btn-secondary text-sm px-4">
          スキップ
        </button>
      </div>
    </div>
  );
}
