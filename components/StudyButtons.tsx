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

  const btnClass = compact
    ? "px-2 py-1 rounded text-xs border transition-colors"
    : "px-3 py-1.5 rounded-lg text-sm border transition-colors";

  return (
    <div className="flex flex-wrap gap-1">
      <button
        onClick={() => {
          toggleManualReview(heritageId);
          refresh();
        }}
        className={`${btnClass} ${
          record.isManualReview
            ? "bg-amber-100 border-amber-300 text-amber-700"
            : "border-gray-200 text-gray-500 hover:bg-amber-50"
        }`}
      >
        {record.isManualReview ? "🔄 復習中" : "🔄 復習"}
      </button>
      <button
        onClick={() => {
          toggleWeak(heritageId);
          refresh();
        }}
        className={`${btnClass} ${
          record.isWeak
            ? "bg-red-100 border-red-300 text-red-700"
            : "border-gray-200 text-gray-500 hover:bg-red-50"
        }`}
      >
        {record.isWeak ? "😰 苦手" : "😰 苦手"}
      </button>
      <button
        onClick={() => {
          toggleLearned(heritageId);
          refresh();
        }}
        className={`${btnClass} ${
          record.isLearned
            ? "bg-green-100 border-green-300 text-green-700"
            : "border-gray-200 text-gray-500 hover:bg-green-50"
        }`}
      >
        {record.isLearned ? "✅ 覚えた" : "✅ 覚えた"}
      </button>
    </div>
  );
}
