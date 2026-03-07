import { StudyRecord, getEmptyRecord } from "./review-score";

const STORAGE_KEY = "sekaken-study-records";

export function getAllRecords(): Record<number, StudyRecord> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function getRecord(heritageId: number): StudyRecord {
  const records = getAllRecords();
  return records[heritageId] || getEmptyRecord(heritageId);
}

export function saveRecord(record: StudyRecord): void {
  const records = getAllRecords();
  records[record.heritageId] = record;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function markCorrect(heritageId: number): void {
  const record = getRecord(heritageId);
  record.correctCount++;
  record.correctStreak++;
  record.lastStudiedAt = new Date().toISOString();
  saveRecord(record);
}

export function markWrong(heritageId: number): void {
  const record = getRecord(heritageId);
  record.wrongCount++;
  record.correctStreak = 0;
  record.lastStudiedAt = new Date().toISOString();
  saveRecord(record);
}

export function toggleWeak(heritageId: number): void {
  const record = getRecord(heritageId);
  record.isWeak = !record.isWeak;
  saveRecord(record);
}

export function toggleManualReview(heritageId: number): void {
  const record = getRecord(heritageId);
  record.isManualReview = !record.isManualReview;
  saveRecord(record);
}

export function toggleLearned(heritageId: number): void {
  const record = getRecord(heritageId);
  record.isLearned = !record.isLearned;
  saveRecord(record);
}
