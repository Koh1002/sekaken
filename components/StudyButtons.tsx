"use client";

import { useState, useEffect } from "react";
import {
  getRecord,
  toggleWeak,
  toggleManualReview,
  toggleLearned,
} from "@/lib/study-storage";
import { StudyRecord } from "@/lib/review-score";

export function StudyButtons({
  heritageId,
  compact = false,
}: {
  heritageId: number;
  compact?: boolean;
}) {
  const [record, setRecord] = useState<StudyRecord | null>(null);

  useEffect(() => {
    setRecord(getRecord(heritageId));
  }, [heritageId]);

  if (!record) return null;

  const refresh = () => setRecord(getRecord(heritageId));

  const btnBase = compact
    ? "px-2.5 py-1 rounded-lg text-xs font-medium border transition-all"
    : "px-3 py-1.5 rounded-lg text-sm font-medium border transition-all";

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        onClick={() => {
          toggleManualReview(heritageId);
          refresh();
        }}
        className={btnBase}
        style={
          record.isManualReview
            ? { background: "rgba(196,163,90,0.12)", borderColor: "rgba(196,163,90,0.25)", color: "#b8963e" }
            : { borderColor: "var(--border)", color: "var(--muted)" }
        }
      >
        {record.isManualReview ? "↻ 復習中" : "↻ 復習"}
      </button>
      <button
        onClick={() => {
          toggleWeak(heritageId);
          refresh();
        }}
        className={btnBase}
        style={
          record.isWeak
            ? { background: "rgba(192,57,43,0.1)", borderColor: "rgba(192,57,43,0.3)", color: "var(--danger)" }
            : { borderColor: "var(--border)", color: "var(--muted)" }
        }
      >
        {record.isWeak ? "! 苦手" : "! 苦手"}
      </button>
      <button
        onClick={() => {
          toggleLearned(heritageId);
          refresh();
        }}
        className={btnBase}
        style={
          record.isLearned
            ? { background: "rgba(46,139,87,0.1)", borderColor: "rgba(46,139,87,0.3)", color: "var(--success)" }
            : { borderColor: "var(--border)", color: "var(--muted)" }
        }
      >
        {record.isLearned ? "✓ 覚えた" : "✓ 覚えた"}
      </button>
    </div>
  );
}
