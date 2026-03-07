/**
 * 学習アクティビティのトラッキング
 * - 日別の勉強時間（ページ滞在時間）
 * - 日別の問題回答数（正解・不正解）
 * localStorage に保存
 */

const ACTIVITY_KEY = "sekaken-study-activity";

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  studySeconds: number;
  correctCount: number;
  wrongCount: number;
}

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getAllActivities(): DailyActivity[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACTIVITY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveActivities(activities: DailyActivity[]): void {
  localStorage.setItem(ACTIVITY_KEY, JSON.stringify(activities));
}

function getOrCreateToday(activities: DailyActivity[]): DailyActivity {
  const today = getToday();
  let entry = activities.find((a) => a.date === today);
  if (!entry) {
    entry = { date: today, studySeconds: 0, correctCount: 0, wrongCount: 0 };
    activities.push(entry);
  }
  return entry;
}

/** 勉強時間を加算（秒単位） */
export function addStudyTime(seconds: number): void {
  const activities = getAllActivities();
  const today = getOrCreateToday(activities);
  today.studySeconds += seconds;
  saveActivities(activities);
}

/** 問題正解を記録 */
export function recordCorrectAnswer(): void {
  const activities = getAllActivities();
  const today = getOrCreateToday(activities);
  today.correctCount++;
  saveActivities(activities);
}

/** 問題不正解を記録 */
export function recordWrongAnswer(): void {
  const activities = getAllActivities();
  const today = getOrCreateToday(activities);
  today.wrongCount++;
  saveActivities(activities);
}

/** 直近N日間のアクティビティを取得（空の日も含む） */
export function getRecentActivities(days: number = 14): DailyActivity[] {
  const all = getAllActivities();
  const result: DailyActivity[] = [];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const existing = all.find((a) => a.date === dateStr);
    result.push(existing || { date: dateStr, studySeconds: 0, correctCount: 0, wrongCount: 0 });
  }

  return result;
}

/** 合計統計 */
export function getTotalStats(): { totalSeconds: number; totalCorrect: number; totalWrong: number; totalDays: number } {
  const all = getAllActivities();
  return {
    totalSeconds: all.reduce((s, a) => s + a.studySeconds, 0),
    totalCorrect: all.reduce((s, a) => s + a.correctCount, 0),
    totalWrong: all.reduce((s, a) => s + a.wrongCount, 0),
    totalDays: all.filter((a) => a.studySeconds > 0 || a.correctCount > 0).length,
  };
}
