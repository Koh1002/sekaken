import { StudyRecord, getEmptyRecord } from "./review-score";
import { supabase, supabaseEnabled } from "./supabase";

const STORAGE_KEY = "sekaken-study-records";

// --- localStorage helpers ---

function getLocalRecords(): Record<number, StudyRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalRecord(record: StudyRecord): void {
  const records = getLocalRecords();
  records[record.heritageId] = record;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

// --- Auth helpers ---

async function getCurrentUserId(): Promise<string | null> {
  if (!supabaseEnabled) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data.user?.id || null;
  } catch {
    return null;
  }
}

// --- Supabase DB helpers ---

interface DbRow {
  heritage_id: number;
  wrong_count: number;
  correct_count: number;
  correct_streak: number;
  last_studied_at: string | null;
  is_weak: boolean;
  is_manual_review: boolean;
  is_learned: boolean;
  updated_at?: string;
}

function dbToStudyRecord(row: DbRow): StudyRecord {
  return {
    heritageId: row.heritage_id,
    wrongCount: row.wrong_count,
    correctCount: row.correct_count,
    correctStreak: row.correct_streak,
    lastStudiedAt: row.last_studied_at,
    isWeak: row.is_weak,
    isManualReview: row.is_manual_review,
    isLearned: row.is_learned,
  };
}

async function upsertSupabaseRecord(userId: string, record: StudyRecord): Promise<void> {
  await supabase.from("study_records").upsert(
    {
      user_id: userId,
      heritage_id: record.heritageId,
      wrong_count: record.wrongCount,
      correct_count: record.correctCount,
      correct_streak: record.correctStreak,
      last_studied_at: record.lastStudiedAt,
      is_weak: record.isWeak,
      is_manual_review: record.isManualReview,
      is_learned: record.isLearned,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,heritage_id" }
  );
}

// --- Public API (hybrid: localStorage + Supabase) ---

export async function getAllRecordsAsync(): Promise<Record<number, StudyRecord>> {
  const userId = await getCurrentUserId();
  if (userId) {
    try {
      const { data } = await supabase
        .from("study_records")
        .select("*")
        .eq("user_id", userId);
      if (data && data.length > 0) {
        const records: Record<number, StudyRecord> = {};
        for (const row of data as DbRow[]) {
          records[row.heritage_id] = dbToStudyRecord(row);
        }
        return records;
      }
    } catch {
      // Supabase未設定の場合はfallback
    }
  }
  return getLocalRecords();
}

export function getAllRecords(): Record<number, StudyRecord> {
  return getLocalRecords();
}

export function getRecord(heritageId: number): StudyRecord {
  const records = getLocalRecords();
  return records[heritageId] || getEmptyRecord(heritageId);
}

async function saveRecordHybrid(record: StudyRecord): Promise<void> {
  saveLocalRecord(record);
  const userId = await getCurrentUserId();
  if (userId) {
    try {
      await upsertSupabaseRecord(userId, record);
    } catch {
      // Supabase未設定の場合は無視
    }
  }
}

export function markCorrect(heritageId: number): void {
  const record = getRecord(heritageId);
  record.correctCount++;
  record.correctStreak++;
  record.lastStudiedAt = new Date().toISOString();
  saveLocalRecord(record);
  saveRecordHybrid(record);
}

export function markWrong(heritageId: number): void {
  const record = getRecord(heritageId);
  record.wrongCount++;
  record.correctStreak = 0;
  record.lastStudiedAt = new Date().toISOString();
  saveLocalRecord(record);
  saveRecordHybrid(record);
}

export function toggleWeak(heritageId: number): void {
  const record = getRecord(heritageId);
  record.isWeak = !record.isWeak;
  saveLocalRecord(record);
  saveRecordHybrid(record);
}

export function toggleManualReview(heritageId: number): void {
  const record = getRecord(heritageId);
  record.isManualReview = !record.isManualReview;
  saveLocalRecord(record);
  saveRecordHybrid(record);
}

export function toggleLearned(heritageId: number): void {
  const record = getRecord(heritageId);
  record.isLearned = !record.isLearned;
  saveLocalRecord(record);
  saveRecordHybrid(record);
}

// --- Sync: localStorage → Supabase (ログイン時に呼ぶ) ---

export async function syncLocalToSupabase(): Promise<number> {
  const userId = await getCurrentUserId();
  if (!userId) return 0;

  const localRecords = getLocalRecords();
  const ids = Object.keys(localRecords).map(Number);
  if (ids.length === 0) return 0;

  let synced = 0;
  for (const id of ids) {
    try {
      await upsertSupabaseRecord(userId, localRecords[id]);
      synced++;
    } catch {
      // continue
    }
  }
  return synced;
}

// --- Sync: Supabase → localStorage (ログイン時に呼ぶ) ---

export async function syncSupabaseToLocal(): Promise<number> {
  const userId = await getCurrentUserId();
  if (!userId) return 0;

  try {
    const { data } = await supabase
      .from("study_records")
      .select("*")
      .eq("user_id", userId);

    if (!data || data.length === 0) return 0;

    let synced = 0;
    for (const row of data as (DbRow & { updated_at?: string })[]) {
      const remote = dbToStudyRecord(row);
      const local = getLocalRecords()[row.heritage_id];

      if (!local || (row.updated_at && (!local.lastStudiedAt || row.updated_at > local.lastStudiedAt))) {
        saveLocalRecord(remote);
        synced++;
      }
    }
    return synced;
  } catch {
    return 0;
  }
}
