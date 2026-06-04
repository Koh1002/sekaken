// UNESCO世界遺産の登録基準 (i)〜(x)
// 出典: 世界遺産条約履行のための作業指針 (Operational Guidelines) 日本語訳
// ※ 公式テキストの表現と細部が異なる場合があるため、検定対策では公式テキストでの確認を推奨。
//   shortは選択肢表示用に要約した文。fullは作業指針準拠の説明。

export type CriterionKind = "cultural" | "natural";

export interface Criterion {
  id: string; // "(i)" 〜 "(x)"
  label: string; // "基準(i)"
  short: string; // 選択肢・暗記用の短い説明
  full: string; // 作業指針準拠の説明
  kind: CriterionKind;
}

export const CRITERIA: Criterion[] = [
  {
    id: "(i)",
    label: "基準(i)",
    short: "人類の創造的才能を表す傑作",
    full: "人類の創造的才能を表す傑作である。",
    kind: "cultural",
  },
  {
    id: "(ii)",
    label: "基準(ii)",
    short: "建築・技術・芸術などにおける価値観の交流を示す",
    full: "建築や技術、記念碑、都市計画、景観設計の発展に重要な影響を与えた、ある期間にわたる価値観の交流または文化圏内での価値観の交流を示すものである。",
    kind: "cultural",
  },
  {
    id: "(iii)",
    label: "基準(iii)",
    short: "現存・消滅した文化的伝統や文明の証拠",
    full: "現存するか消滅したかにかかわらず、ある文化的伝統または文明の存在を伝承する物証として無二の存在（少なくとも希有な存在）である。",
    kind: "cultural",
  },
  {
    id: "(iv)",
    label: "基準(iv)",
    short: "歴史上の重要な段階を物語る建築・景観の見本",
    full: "歴史上の重要な段階を物語る建築物、その集合体、技術の集積、または景観の優れた見本である。",
    kind: "cultural",
  },
  {
    id: "(v)",
    label: "基準(v)",
    short: "伝統的な集落・土地利用の顕著な見本",
    full: "ある文化（または複数の文化）を特徴づけるような伝統的居住形態、または陸上・海上の土地利用形態を代表する顕著な見本である。または、人類と環境とのふれあいを代表する顕著な見本である（特に不可逆的な変化によりその存続が危ぶまれているもの）。",
    kind: "cultural",
  },
  {
    id: "(vi)",
    label: "基準(vi)",
    short: "顕著な普遍的価値を持つ出来事・信仰・芸術と関連",
    full: "顕著な普遍的価値を有する出来事（行事）、生きた伝統、思想、信仰、芸術的作品、あるいは文学的作品と直接または実質的に関連する（この基準は他の基準とあわせて用いられることが望ましい）。",
    kind: "cultural",
  },
  {
    id: "(vii)",
    label: "基準(vii)",
    short: "ひときわすぐれた自然美・美的価値",
    full: "ひときわすぐれた自然美や美的価値を有する最上級の自然現象、または地域を包含する。",
    kind: "natural",
  },
  {
    id: "(viii)",
    label: "基準(viii)",
    short: "地球の歴史の主要段階を示す地形・地質",
    full: "生命の進化の記録や、地形形成における重要な進行中の地質学的過程、または重要な地形学的・自然地理学的特徴といった、地球の歴史の主要な段階を代表する顕著な見本である。",
    kind: "natural",
  },
  {
    id: "(ix)",
    label: "基準(ix)",
    short: "進行中の生態学的・生物学的過程を示す",
    full: "陸上・淡水域・沿岸・海洋の生態系や動植物群集の進化、発展において、重要な進行中の生態学的過程または生物学的過程を代表する顕著な見本である。",
    kind: "natural",
  },
  {
    id: "(x)",
    label: "基準(x)",
    short: "絶滅危惧種など生物多様性の重要な生息地",
    full: "学術上または保全上、顕著な普遍的価値を有する絶滅のおそれのある種の生息地など、生物多様性の生息域内保全にとって最も重要な自然の生息地を包含する。",
    kind: "natural",
  },
];

export const CRITERIA_BY_ID: Record<string, Criterion> = Object.fromEntries(
  CRITERIA.map((c) => [c.id, c])
);

// "(i)(ii)(iv)(vi)" → ["(i)","(ii)","(iv)","(vi)"]
export function parseCriteria(raw: string | null | undefined): string[] {
  if (!raw) return [];
  const matches = raw.match(/\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x)\)/g);
  return matches ? matches : [];
}
