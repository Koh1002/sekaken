export interface Heritage {
  id: number;
  nameJa: string;
  nameEn: string;
  countryJa: string;
  countryEn: string;
  region: string;
  category: string;
  inscriptionYear: number;
  latitude: number;
  longitude: number;
  shortDescJa: string | null;
  memoryTipJa: string | null;
  tags: string | null;
  unescoCriteria: string | null;
  officialUrl: string | null;
  unescoUrl: string;
  sourceUrls: string | null;
  imageUrl: string | null;
  imageAttribution: string | null;
  examImportance: number;
}

export interface QuizQuestion {
  id: string;
  type: "name" | "country" | "photo" | "description" | "map" | "truefalse" | "criteria" | "year" | "criteria-meaning";
  question: string;
  options: string[];
  correctIndex: number;
  heritageId: number;
  imageUrl?: string | null;
  // photo quiz: fallback image fetch
  nameEn?: string;
  category?: string;
  // map quiz: pin location
  latitude?: number;
  longitude?: number;
}

export interface QuizResult {
  questionId: string;
  heritageId: number;
  isCorrect: boolean;
  selectedIndex: number;
  correctIndex: number;
}

export type FilterCategory = "all" | "Cultural" | "Natural" | "Mixed";
export type FilterRegion = "all" | "japan" | "europe" | "asia" | "americas" | "africa" | "arab";
