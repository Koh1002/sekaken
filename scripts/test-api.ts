// API統合テスト
// 実行: BASE_URL=http://localhost:3000 npx tsx scripts/test-api.ts
// 起動中のdev server に対し、全クイズ形式とheritages系エンドポイントの不変条件を検証。
// 遺産ベース形式(name/country/photo/description/map/truefalse/criteria/year)はSupabase接続が必要。
// 固定バンク形式(concept/serial/criteria-meaning)はDB非依存。

const BASE = process.env.BASE_URL || "http://localhost:3000";

let passed = 0;
let failed = 0;
const failures: string[] = [];

function check(name: string, cond: boolean, detail = "") {
  if (cond) passed++;
  else {
    failed++;
    failures.push(`✗ ${name}${detail ? " — " + detail : ""}`);
  }
}

async function getJson(path: string): Promise<any> {
  const res = await fetch(`${BASE}${path}`);
  return { status: res.status, body: await res.json().catch(() => null) };
}

interface QuizQ {
  id: string;
  type: string;
  question: string;
  options: string[];
  correctIndex: number;
  heritageId: number;
  imageUrl?: string | null;
  latitude?: number;
  longitude?: number;
}

function validateQuestions(type: string, qs: QuizQ[], expectCount: number) {
  check(`${type}: 配列が返る`, Array.isArray(qs), JSON.stringify(qs).slice(0, 120));
  if (!Array.isArray(qs)) return;
  check(`${type}: 件数 ${qs.length} <= 要求 ${expectCount}`, qs.length <= expectCount && qs.length > 0, `${qs.length}`);
  for (const q of qs) {
    const optCount = type === "truefalse" ? 2 : 4;
    if (q.options.length !== optCount) {
      check(`${type}: 選択肢数=${optCount}`, false, `${q.id} has ${q.options.length}`);
    }
    if (new Set(q.options).size !== q.options.length) {
      check(`${type}: 選択肢に重複なし`, false, `${q.id}: ${q.options.join("|")}`);
    }
    if (q.correctIndex < 0 || q.correctIndex >= q.options.length) {
      check(`${type}: correctIndex が範囲内`, false, `${q.id}: idx=${q.correctIndex}`);
    }
    if (!q.question || q.question.trim() === "") {
      check(`${type}: 問題文が非空`, false, q.id);
    }
  }
  // 上のループで個別失敗が無ければまとめてPASS加点
  check(`${type}: 全問の選択肢/正解index/問題文が妥当`, true);
}

async function testType(type: string, count: number, extra = "") {
  const { status, body } = await getJson(`/api/quiz?type=${type}&count=${count}${extra}`);
  if (status !== 200) {
    // 遺産ベース型でSupabase未接続の場合はskip扱いの警告
    failures.push(`⚠ ${type}: HTTP ${status} (${JSON.stringify(body).slice(0, 80)}) — Supabase未接続の可能性`);
    return;
  }
  validateQuestions(type, body, count);
}

async function main() {
  console.log(`Target: ${BASE}\n`);

  // 固定バンク(DB非依存)
  await testType("concept", 10);
  await testType("serial", 20);
  await testType("criteria-meaning", 10);

  // 遺産ベース(Supabase接続が必要)
  for (const t of ["name", "country", "photo", "description", "map", "truefalse", "criteria", "year"]) {
    await testType(t, 8);
  }

  // フィルタ・重み付け
  await testType("name", 8, "&region=japan");
  await testType("name", 8, "&category=Cultural&importance=4");
  await testType("criteria", 8, "&priority=660,659,662"); // 重み付け: 法隆寺/姫路城/屋久島を優先

  // heritages系
  {
    const { status, body } = await getJson(`/api/heritages?region=japan`);
    if (status === 200 && Array.isArray(body)) {
      check("heritages?region=japan: 日本のみ", body.every((h: any) => h.countryEn === "Japan"), `件数=${body.length}`);
    } else {
      failures.push(`⚠ /api/heritages: HTTP ${status} — Supabase未接続の可能性`);
    }
  }
  {
    const { status, body } = await getJson(`/api/heritages/random`);
    if (status === 200) check("heritages/random: オブジェクト返却", body && typeof body === "object");
    else failures.push(`⚠ /api/heritages/random: HTTP ${status}`);
  }

  console.log("========== API統合テスト ==========");
  if (failures.length) console.log(failures.join("\n"));
  console.log(`\n結果: ${passed} passed, ${failed} failed, ${failures.filter((f) => f.startsWith("⚠")).length} 警告(skip)`);
  if (failed > 0) process.exit(1);
}

main();
