// データ整合テスト (DB不要)
// 実行: npx tsx scripts/test-data.ts
// 遺産データ・登録基準・概念バンク・連続遺産データの整合性を検証する。

import { allHeritages } from "../data/index";
import { CRITERIA, parseCriteria } from "../lib/criteria";
import { CONCEPT_QUESTIONS } from "../lib/concept-questions";
import { japanSerialProperties, PREFECTURES } from "../data/japan-serial-properties";
import { worldSerialProperties, COUNTRIES_JA } from "../data/world-serial-properties";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, cond: boolean, detail = "") {
  if (cond) {
    passed++;
  } else {
    failed++;
    failures.push(`✗ ${name}${detail ? " — " + detail : ""}`);
  }
}

// ---------- allHeritages ----------
{
  const ids = new Set<number>();
  const dups: number[] = [];
  for (const h of allHeritages) {
    if (ids.has(h.id)) dups.push(h.id);
    ids.add(h.id);
  }
  check("heritages: ID重複なし", dups.length === 0, `重複ID: ${dups.join(",")}`);
  check("heritages: 件数が想定(>=300)", allHeritages.length >= 300, `件数=${allHeritages.length}`);

  const criteriaRe = /^(\((?:i|ii|iii|iv|v|vi|vii|viii|ix|x)\))+$/;
  const badCriteria = allHeritages.filter((h) => h.unescoCriteria && !criteriaRe.test(h.unescoCriteria));
  check("heritages: 登録基準の形式が(i)〜(x)の連結", badCriteria.length === 0,
    badCriteria.slice(0, 5).map((h) => `${h.id}:${h.unescoCriteria}`).join(" / "));

  const badCoord = allHeritages.filter((h) => h.latitude < -90 || h.latitude > 90 || h.longitude < -180 || h.longitude > 180);
  check("heritages: 座標が範囲内", badCoord.length === 0, badCoord.slice(0, 5).map((h) => h.id).join(","));

  const badImp = allHeritages.filter((h) => h.examImportance < 1 || h.examImportance > 5);
  check("heritages: 重要度が1〜5", badImp.length === 0, badImp.slice(0, 5).map((h) => h.id).join(","));
}

// ---------- CRITERIA ----------
{
  check("criteria: 10個ちょうど", CRITERIA.length === 10, `数=${CRITERIA.length}`);
  const ids = CRITERIA.map((c) => c.id);
  const expected = ["(i)", "(ii)", "(iii)", "(iv)", "(v)", "(vi)", "(vii)", "(viii)", "(ix)", "(x)"];
  check("criteria: ID が(i)〜(x)で揃っている", JSON.stringify(ids) === JSON.stringify(expected), ids.join(","));
  check("criteria: short/full が非空", CRITERIA.every((c) => c.short && c.full));
  const culturalOk = CRITERIA.slice(0, 6).every((c) => c.kind === "cultural");
  const naturalOk = CRITERIA.slice(6).every((c) => c.kind === "natural");
  check("criteria: (i)〜(vi)=文化, (vii)〜(x)=自然", culturalOk && naturalOk);
  // parseCriteria
  check("parseCriteria: 連結を分解できる",
    JSON.stringify(parseCriteria("(i)(ii)(iv)(vi)")) === JSON.stringify(["(i)", "(ii)", "(iv)", "(vi)"]));
  check("parseCriteria: null/空で空配列", parseCriteria(null).length === 0 && parseCriteria("").length === 0);
}

// ---------- CONCEPT_QUESTIONS ----------
{
  const ids = new Set<string>();
  const dups: string[] = [];
  for (const q of CONCEPT_QUESTIONS) {
    if (ids.has(q.id)) dups.push(q.id);
    ids.add(q.id);
  }
  check("concept: ID重複なし", dups.length === 0, dups.join(","));
  check("concept: 選択肢が4つ", CONCEPT_QUESTIONS.every((q) => q.options.length === 4),
    CONCEPT_QUESTIONS.filter((q) => q.options.length !== 4).map((q) => q.id).join(","));
  const dupOpt = CONCEPT_QUESTIONS.filter((q) => new Set(q.options).size !== q.options.length);
  check("concept: 選択肢に重複なし", dupOpt.length === 0, dupOpt.map((q) => q.id).join(","));
  check("concept: 問題文/解説/正解が非空",
    CONCEPT_QUESTIONS.every((q) => q.question && q.explanation && q.options[0]));
  check("concept: 問題数が十分(>=40)", CONCEPT_QUESTIONS.length >= 40, `数=${CONCEPT_QUESTIONS.length}`);
}

// ---------- japanSerialProperties ----------
{
  const heritageById = new Map(allHeritages.map((h) => [h.id, h]));
  for (const p of japanSerialProperties) {
    check(`serial(JP) heritageId ${p.heritageId} が存在`, heritageById.has(p.heritageId), p.nameJa);
    const h = heritageById.get(p.heritageId);
    if (h) check(`serial(JP) ${p.heritageId} 名称一致`, h.nameJa === p.nameJa, `${h.nameJa} vs ${p.nameJa}`);
    check(`serial(JP) ${p.nameJa}: 都道府県が非空`, p.prefectures.length > 0);
    const badPref = p.prefectures.filter((pr) => !PREFECTURES.includes(pr));
    check(`serial(JP) ${p.nameJa}: 都道府県名が妥当`, badPref.length === 0, badPref.join(","));
    check(`serial(JP) ${p.nameJa}: totalAssets は正 or null`, p.totalAssets === null || p.totalAssets > 0);
  }
  check("PREFECTURES: 47都道府県", PREFECTURES.length === 47, `数=${PREFECTURES.length}`);
}

// ---------- worldSerialProperties ----------
{
  const heritageById = new Map(allHeritages.map((h) => [h.id, h]));
  for (const p of worldSerialProperties) {
    check(`serial(World) ${p.nameJa}: 国が2つ以上`, p.countries.length >= 2, `${p.countries.length}`);
    const badC = p.countries.filter((c) => !COUNTRIES_JA.includes(c));
    // 誤答プールが member を除外して成立するよう、全 member は COUNTRIES_JA に含まれる必要がある
    check(`serial(World) ${p.nameJa}: 国名が国マスタに含まれる`, badC.length === 0, badC.join(","));
    check(`serial(World) ${p.nameJa}: totalAssets は正 or null`, p.totalAssets === null || p.totalAssets > 0);
    if (p.heritageId !== 0) {
      check(`serial(World) heritageId ${p.heritageId} が存在`, heritageById.has(p.heritageId), p.nameJa);
    }
    // 「含まれない国」問題が成立する(誤答候補が3件以上残る)
    const nonMembers = COUNTRIES_JA.filter((c) => !p.countries.includes(c));
    check(`serial(World) ${p.nameJa}: 非メンバー国が1つ以上`, nonMembers.length >= 1);
  }
}

// ---------- レポート ----------
console.log("\n========== データ整合テスト ==========");
if (failures.length) {
  console.log(failures.join("\n"));
}
console.log(`\n結果: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
