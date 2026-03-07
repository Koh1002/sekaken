export interface StudyRecord {
  heritageId: number;
  wrongCount: number;
  correctCount: number;
  correctStreak: number;
  lastStudiedAt: string | null;
  isWeak: boolean;
  isManualReview: boolean;
  isLearned: boolean;
}

export function calculateReviewScore(record: StudyRecord): number {
  const daysSinceLastStudy = record.lastStudiedAt
    ? (Date.now() - new Date(record.lastStudiedAt).getTime()) / (1000 * 60 * 60 * 24)
    : 30;

  return (
    record.wrongCount * 3 +
    daysSinceLastStudy * 1.5 +
    (record.isWeak ? 5 : 0) +
    (record.isManualReview ? 4 : 0) -
    record.correctStreak * 2
  );
}

export function getEmptyRecord(heritageId: number): StudyRecord {
  return {
    heritageId,
    wrongCount: 0,
    correctCount: 0,
    correctStreak: 0,
    lastStudiedAt: null,
    isWeak: false,
    isManualReview: false,
    isLearned: false,
  };
}
