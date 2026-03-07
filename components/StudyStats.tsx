"use client";

import { useEffect, useState } from "react";
import { getRecentActivities, getTotalStats, DailyActivity } from "@/lib/study-activity";
import { getAllRecords } from "@/lib/study-storage";

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}分`;
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}時間${remMins > 0 ? `${remMins}分` : ""}`;
}

function MiniChart({ data, dataKey }: { data: DailyActivity[]; dataKey: "studySeconds" | "answers" }) {
  const values = data.map((d) =>
    dataKey === "studySeconds" ? d.studySeconds : d.correctCount + d.wrongCount
  );
  const max = Math.max(...values, 1);

  return (
    <div className="flex items-end gap-[3px] h-14">
      {values.map((v, i) => {
        const height = Math.max((v / max) * 100, v > 0 ? 8 : 3);
        const isToday = i === values.length - 1;
        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all"
            style={{
              height: `${height}%`,
              background: v > 0
                ? isToday
                  ? "var(--primary)"
                  : "rgba(79,125,243,0.3)"
                : "var(--unknown)",
              minWidth: "4px",
              borderRadius: "3px 3px 0 0",
            }}
            title={`${data[i].date}: ${dataKey === "studySeconds" ? formatTime(v) : `${v}問`}`}
          />
        );
      })}
    </div>
  );
}

export function StudyStats() {
  const [recent, setRecent] = useState<DailyActivity[]>([]);
  const [stats, setStats] = useState({ totalSeconds: 0, totalCorrect: 0, totalWrong: 0, totalDays: 0 });
  const [studyCount, setStudyCount] = useState({ studied: 0, learned: 0, weak: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setRecent(getRecentActivities(14));
    setStats(getTotalStats());

    const records = getAllRecords();
    const vals = Object.values(records);
    setStudyCount({
      studied: vals.length,
      learned: vals.filter((r) => r.isLearned).length,
      weak: vals.filter((r) => r.isWeak).length,
    });
  }, []);

  if (!mounted) return null;

  const todayActivity = recent[recent.length - 1];
  const todayAnswers = todayActivity
    ? todayActivity.correctCount + todayActivity.wrongCount
    : 0;
  const todayTime = todayActivity?.studySeconds || 0;

  return (
    <div className="space-y-4">
      {/* Today's stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4">
          <p className="text-xs text-[var(--muted)] mb-1">今日の学習</p>
          <p className="text-xl font-bold" style={{ color: "var(--primary)" }}>
            {formatTime(todayTime)}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[var(--muted)] mb-1">今日の回答数</p>
          <p className="text-xl font-bold" style={{ color: "var(--primary)" }}>
            {todayAnswers}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-[var(--muted)] mb-1">学習日数</p>
          <p className="text-xl font-bold" style={{ color: "var(--primary)" }}>
            {stats.totalDays}
          </p>
        </div>
      </div>

      {/* Memory status bar */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">記憶度</h3>
          <span className="text-xs text-[var(--muted)]">{studyCount.studied}件学習済み</span>
        </div>
        <div className="flex gap-0.5 h-2.5 rounded-full overflow-hidden" style={{ background: "var(--unknown)" }}>
          {studyCount.learned > 0 && (
            <div
              className="rounded-full"
              style={{
                width: `${(studyCount.learned / Math.max(studyCount.studied, 1)) * 100}%`,
                background: "var(--memorized)",
              }}
            />
          )}
          {studyCount.studied - studyCount.learned - studyCount.weak > 0 && (
            <div
              className="rounded-full"
              style={{
                width: `${((studyCount.studied - studyCount.learned - studyCount.weak) / Math.max(studyCount.studied, 1)) * 100}%`,
                background: "var(--in-progress)",
              }}
            />
          )}
          {studyCount.weak > 0 && (
            <div
              className="rounded-full"
              style={{
                width: `${(studyCount.weak / Math.max(studyCount.studied, 1)) * 100}%`,
                background: "var(--weak)",
              }}
            />
          )}
        </div>
        <div className="flex gap-5 mt-2.5 text-xs text-[var(--muted)]">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "var(--memorized)" }} />
            記憶済 {studyCount.learned}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "var(--in-progress)" }} />
            記憶中 {studyCount.studied - studyCount.learned - studyCount.weak}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: "var(--weak)" }} />
            弱点 {studyCount.weak}
          </span>
        </div>
      </div>

      {/* Activity charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">学習時間</h3>
            <span className="text-xs text-[var(--muted)]">過去14日間</span>
          </div>
          <MiniChart data={recent} dataKey="studySeconds" />
          <p className="text-xs text-[var(--muted)] mt-2">
            累計: {formatTime(stats.totalSeconds)}
          </p>
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold">回答数</h3>
            <span className="text-xs text-[var(--muted)]">過去14日間</span>
          </div>
          <MiniChart data={recent} dataKey="answers" />
          <p className="text-xs text-[var(--muted)] mt-2">
            累計: {stats.totalCorrect + stats.totalWrong}問（正答率{stats.totalCorrect + stats.totalWrong > 0 ? Math.round((stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100) : 0}%）
          </p>
        </div>
      </div>
    </div>
  );
}
