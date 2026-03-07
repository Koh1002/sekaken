import { allHeritages } from "../data/index";

interface ValidationIssue {
  id: number;
  nameJa: string;
  field: string;
  issue: string;
  severity: "error" | "warning";
}

function validate() {
  const issues: ValidationIssue[] = [];
  const ids = new Set<number>();

  for (const h of allHeritages) {
    // ID重複チェック
    if (ids.has(h.id)) {
      issues.push({ id: h.id, nameJa: h.nameJa, field: "id", issue: `ID ${h.id} が重複`, severity: "error" });
    }
    ids.add(h.id);

    // 必須フィールドチェック
    if (!h.nameJa) issues.push({ id: h.id, nameJa: h.nameJa, field: "nameJa", issue: "名前(日本語)が空", severity: "error" });
    if (!h.nameEn) issues.push({ id: h.id, nameJa: h.nameJa, field: "nameEn", issue: "名前(英語)が空", severity: "error" });
    if (!h.countryJa) issues.push({ id: h.id, nameJa: h.nameJa, field: "countryJa", issue: "国名(日本語)が空", severity: "error" });
    if (!h.countryEn) issues.push({ id: h.id, nameJa: h.nameJa, field: "countryEn", issue: "国名(英語)が空", severity: "error" });
    if (!h.region) issues.push({ id: h.id, nameJa: h.nameJa, field: "region", issue: "地域が空", severity: "error" });
    if (!h.category) issues.push({ id: h.id, nameJa: h.nameJa, field: "category", issue: "カテゴリが空", severity: "error" });
    if (!h.inscriptionYear) issues.push({ id: h.id, nameJa: h.nameJa, field: "inscriptionYear", issue: "登録年が空", severity: "error" });

    // カテゴリ値チェック
    if (!["Cultural", "Natural", "Mixed"].includes(h.category)) {
      issues.push({ id: h.id, nameJa: h.nameJa, field: "category", issue: `不正なカテゴリ: ${h.category}`, severity: "error" });
    }

    // 地域値チェック
    const validRegions = ["Asia and the Pacific", "Europe and North America", "Latin America and the Caribbean", "Africa", "Arab States"];
    if (!validRegions.includes(h.region)) {
      issues.push({ id: h.id, nameJa: h.nameJa, field: "region", issue: `不正な地域: ${h.region}`, severity: "error" });
    }

    // 座標チェック
    if (h.latitude < -90 || h.latitude > 90) {
      issues.push({ id: h.id, nameJa: h.nameJa, field: "latitude", issue: `緯度が範囲外: ${h.latitude}`, severity: "error" });
    }
    if (h.longitude < -180 || h.longitude > 180) {
      issues.push({ id: h.id, nameJa: h.nameJa, field: "longitude", issue: `経度が範囲外: ${h.longitude}`, severity: "error" });
    }

    // 登録年チェック
    if (h.inscriptionYear < 1978 || h.inscriptionYear > 2025) {
      issues.push({ id: h.id, nameJa: h.nameJa, field: "inscriptionYear", issue: `登録年が範囲外: ${h.inscriptionYear}`, severity: "warning" });
    }

    // 検定重要度チェック
    if (h.examImportance < 1 || h.examImportance > 5) {
      issues.push({ id: h.id, nameJa: h.nameJa, field: "examImportance", issue: `重要度が範囲外: ${h.examImportance}`, severity: "error" });
    }

    // オプショナルフィールドの欠損警告
    if (!h.shortDescJa) issues.push({ id: h.id, nameJa: h.nameJa, field: "shortDescJa", issue: "概要が空", severity: "warning" });
    if (!h.memoryTipJa) issues.push({ id: h.id, nameJa: h.nameJa, field: "memoryTipJa", issue: "暗記ポイントが空", severity: "warning" });
    if (!h.tags) issues.push({ id: h.id, nameJa: h.nameJa, field: "tags", issue: "タグが空", severity: "warning" });
    if (!h.unescoCriteria) issues.push({ id: h.id, nameJa: h.nameJa, field: "unescoCriteria", issue: "登録基準が空", severity: "warning" });
    if (!h.unescoUrl) issues.push({ id: h.id, nameJa: h.nameJa, field: "unescoUrl", issue: "UNESCO URLが空", severity: "warning" });
  }

  // 統計
  const regionCounts: Record<string, number> = {};
  const categoryCounts: Record<string, number> = {};
  const japanCount = allHeritages.filter((h) => h.countryEn === "Japan").length;

  for (const h of allHeritages) {
    regionCounts[h.region] = (regionCounts[h.region] || 0) + 1;
    categoryCounts[h.category] = (categoryCounts[h.category] || 0) + 1;
  }

  // レポート出力
  console.log("# データバリデーションレポート\n");
  console.log(`生成日時: ${new Date().toISOString()}\n`);
  console.log(`## 概要\n`);
  console.log(`- 総件数: ${allHeritages.length}`);
  console.log(`- 日本の遺産: ${japanCount}件`);
  console.log(`- エラー: ${issues.filter((i) => i.severity === "error").length}件`);
  console.log(`- 警告: ${issues.filter((i) => i.severity === "warning").length}件\n`);

  console.log(`## 地域別件数\n`);
  for (const [region, count] of Object.entries(regionCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`- ${region}: ${count}件`);
  }

  console.log(`\n## カテゴリ別件数\n`);
  for (const [cat, count] of Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`- ${cat}: ${count}件`);
  }

  if (issues.filter((i) => i.severity === "error").length > 0) {
    console.log(`\n## エラー\n`);
    for (const issue of issues.filter((i) => i.severity === "error")) {
      console.log(`- [${issue.id}] ${issue.nameJa}: ${issue.field} - ${issue.issue}`);
    }
  }

  if (issues.filter((i) => i.severity === "warning").length > 0) {
    console.log(`\n## 警告\n`);
    for (const issue of issues.filter((i) => i.severity === "warning")) {
      console.log(`- [${issue.id}] ${issue.nameJa}: ${issue.field} - ${issue.issue}`);
    }
  }

  if (issues.filter((i) => i.severity === "error").length === 0) {
    console.log(`\n## 結論\n`);
    console.log(`データに重大なエラーはありません。${issues.filter((i) => i.severity === "warning").length}件の軽微な警告があります。`);
  }

  return issues;
}

validate();
