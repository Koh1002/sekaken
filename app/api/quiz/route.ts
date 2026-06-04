import { supabase, toHeritage } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { QuizQuestion } from "@/lib/types";
import { Heritage } from "@/lib/types";
import { CRITERIA } from "@/lib/criteria";
import { CONCEPT_QUESTIONS } from "@/lib/concept-questions";
import { japanSerialProperties, PREFECTURES } from "@/data/japan-serial-properties";
import { worldSerialProperties, COUNTRIES_JA } from "@/data/world-serial-properties";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** 登録基準の意味クイズ: 遺産DBに依存しない固定問題バンクから生成 */
function generateCriteriaMeaningQuestions(count: number): QuizQuestion[] {
  const pool = shuffle(CRITERIA).slice(0, count);
  return pool.map((c, idx) => {
    // 記号→意味 と 意味→記号 を交互に出題
    const askMeaning = idx % 2 === 0;
    if (askMeaning) {
      const distractors = shuffle(CRITERIA.filter((o) => o.id !== c.id)).slice(0, 3);
      const options = shuffle([c.short, ...distractors.map((o) => o.short)]);
      return {
        id: `cm-${idx}-${c.id}`,
        type: "criteria-meaning" as const,
        question: `世界遺産の登録${c.label}が示す内容として正しいものはどれですか？`,
        options,
        correctIndex: options.indexOf(c.short),
        heritageId: 0,
      };
    } else {
      const distractors = shuffle(CRITERIA.filter((o) => o.id !== c.id)).slice(0, 3);
      const options = shuffle([c.id, ...distractors.map((o) => o.id)]);
      return {
        id: `cm-${idx}-${c.id}`,
        type: "criteria-meaning" as const,
        question: `「${c.short}」を示す登録基準はどれですか？`,
        options,
        correctIndex: options.indexOf(c.id),
        heritageId: 0,
      };
    }
  });
}

/** 概念・制度クイズ: 独自作問バンク(CONCEPT_QUESTIONS)から生成。options[0]が正解 */
function generateConceptQuestions(count: number): QuizQuestion[] {
  const pool = shuffle(CONCEPT_QUESTIONS).slice(0, count);
  return pool.map((q, idx) => {
    const correct = q.options[0];
    const options = shuffle(q.options);
    return {
      id: `concept-${idx}-${q.id}`,
      type: "concept" as const,
      question: q.question,
      options,
      correctIndex: options.indexOf(correct),
      heritageId: 0,
    };
  });
}

/** 構成資産・所在地クイズ: 日本の主要連続遺産データから生成 */
function generateSerialQuestions(count: number): QuizQuestion[] {
  const candidates: QuizQuestion[] = [];
  const allCounts = Array.from(
    new Set(
      japanSerialProperties
        .map((p) => p.totalAssets)
        .filter((n): n is number => n != null)
    )
  );

  for (const p of japanSerialProperties) {
    // A: 構成資産数
    if (p.totalAssets != null) {
      const nums = [p.totalAssets, ...shuffle(allCounts.filter((c) => c !== p.totalAssets)).slice(0, 3)];
      let off = 1;
      while (nums.length < 4) {
        const cand = p.totalAssets + off;
        if (cand > 0 && !nums.includes(cand)) nums.push(cand);
        off = off > 0 ? -off : -off + 1;
      }
      const opts = shuffle(nums);
      candidates.push({
        id: `serial-count-${p.heritageId}`,
        type: "serial",
        question: `「${p.nameJa}」の構成資産はいくつですか？`,
        options: opts.map((n) => `${n}件`),
        correctIndex: opts.indexOf(p.totalAssets),
        heritageId: p.heritageId,
      });
    }

    // B: 所在都道府県(正しいものを選ぶ)
    {
      const nonMembers = shuffle(PREFECTURES.filter((pr) => !p.prefectures.includes(pr))).slice(0, 3);
      const correct = shuffle(p.prefectures)[0];
      const opts = shuffle([correct, ...nonMembers]);
      candidates.push({
        id: `serial-pref-${p.heritageId}`,
        type: "serial",
        question: `「${p.nameJa}」の構成資産がある都道府県はどれですか？`,
        options: opts,
        correctIndex: opts.indexOf(correct),
        heritageId: p.heritageId,
      });
    }

    // C: 構成資産が無い都道府県(3県以上にまたがる遺産のみ)
    if (p.prefectures.length >= 3) {
      const correct = shuffle(PREFECTURES.filter((pr) => !p.prefectures.includes(pr)))[0];
      const members = shuffle(p.prefectures).slice(0, 3);
      const opts = shuffle([correct, ...members]);
      candidates.push({
        id: `serial-nopref-${p.heritageId}`,
        type: "serial",
        question: `「${p.nameJa}」の構成資産が無い都道府県はどれですか？`,
        options: opts,
        correctIndex: opts.indexOf(correct),
        heritageId: p.heritageId,
      });
    }
  }

  // --- 海外(複数国にまたがる)連続遺産 ---
  const allCountryCounts = Array.from(new Set(worldSerialProperties.map((p) => p.countries.length)));
  for (const p of worldSerialProperties) {
    // 構成資産数
    if (p.totalAssets != null) {
      const nums = [p.totalAssets, ...shuffle(allCounts.filter((c) => c !== p.totalAssets)).slice(0, 3)];
      let off = 1;
      while (nums.length < 4) {
        const cand = p.totalAssets + off;
        if (cand > 0 && !nums.includes(cand)) nums.push(cand);
        off = off > 0 ? -off : -off + 1;
      }
      const opts = shuffle(nums);
      candidates.push({
        id: `wserial-count-${p.heritageId}-${p.inscriptionYear}`,
        type: "serial",
        question: `「${p.nameJa}」の構成資産はいくつですか？`,
        options: opts.map((n) => `${n}件`),
        correctIndex: opts.indexOf(p.totalAssets),
        heritageId: p.heritageId,
      });
    }

    // またがる国の数
    {
      const correctN = p.countries.length;
      const nums = [correctN, ...shuffle(allCountryCounts.filter((c) => c !== correctN)).slice(0, 3)];
      let off = 1;
      while (nums.length < 4) {
        const cand = correctN + off;
        if (cand > 0 && !nums.includes(cand)) nums.push(cand);
        off = off > 0 ? -off : -off + 1;
      }
      const opts = shuffle(nums);
      candidates.push({
        id: `wserial-numcountries-${p.heritageId}-${p.inscriptionYear}`,
        type: "serial",
        question: `「${p.nameJa}」は何か国にまたがる世界遺産ですか？`,
        options: opts.map((n) => `${n}か国`),
        correctIndex: opts.indexOf(correctN),
        heritageId: p.heritageId,
      });
    }

    // またがる国に含まれない国
    {
      const correct = shuffle(COUNTRIES_JA.filter((c) => !p.countries.includes(c)))[0];
      const members = shuffle(p.countries).slice(0, 3);
      const opts = shuffle([correct, ...members]);
      candidates.push({
        id: `wserial-nocountry-${p.heritageId}-${p.inscriptionYear}`,
        type: "serial",
        question: `「${p.nameJa}」がまたがる国に含まれないのはどれですか？`,
        options: opts,
        correctIndex: opts.indexOf(correct),
        heritageId: p.heritageId,
      });
    }
  }

  return shuffle(candidates).slice(0, count);
}

/** 通常クイズ用: 世界遺産ごとにバリエーション豊かな問題文を生成 */
function generateNameQuestion(h: Heritage): string {
  const patterns: (() => string | null)[] = [
    // shortDescJaベース
    () => h.shortDescJa ? `${h.shortDescJa}\nこの世界遺産の名前は？` : null,
    // 覚え方ヒントベース
    () => h.memoryTipJa ? `ヒント: ${h.memoryTipJa}\nこの世界遺産は？` : null,
    // カテゴリ＋地域＋年
    () => {
      const cat = h.category === "Cultural" ? "文化遺産" : h.category === "Natural" ? "自然遺産" : "複合遺産";
      return `${h.countryJa}にある${cat}で、${h.inscriptionYear}年に世界遺産に登録されました。この遺産の名前は？`;
    },
    // UNESCO基準ベース
    () => {
      if (!h.unescoCriteria) return null;
      const cat = h.category === "Cultural" ? "文化遺産" : h.category === "Natural" ? "自然遺産" : "複合遺産";
      return `登録基準「${h.unescoCriteria}」で登録された${h.countryJa}の${cat}は？`;
    },
    // タグベース
    () => {
      if (!h.tags) return null;
      const tagList = h.tags.split(",").map(t => t.trim()).slice(0, 3).join("、");
      return `「${tagList}」に関連する${h.countryJa}の世界遺産は？`;
    },
    // 位置情報ベース
    () => {
      const lat = h.latitude > 0 ? `北緯${Math.abs(h.latitude).toFixed(0)}度` : `南緯${Math.abs(h.latitude).toFixed(0)}度`;
      const lng = h.longitude > 0 ? `東経${Math.abs(h.longitude).toFixed(0)}度` : `西経${Math.abs(h.longitude).toFixed(0)}度`;
      return `${h.countryJa}の${lat}・${lng}付近にある世界遺産は？`;
    },
  ];

  // shortDescJaがあれば優先的に使用
  const shuffled = shuffle(patterns);
  for (const p of shuffled) {
    const result = p();
    if (result) return result;
  }

  // フォールバック
  const cat = h.category === "Cultural" ? "文化遺産" : h.category === "Natural" ? "自然遺産" : "複合遺産";
  return `${h.countryJa}にあり、${h.inscriptionYear}年に登録された${cat}は何ですか？`;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "name";
  const count = Math.min(parseInt(searchParams.get("count") || "10"), 30);
  const category = searchParams.get("category");
  const region = searchParams.get("region");
  const ids = searchParams.get("ids");
  const importance = searchParams.get("importance");
  const priority = searchParams.get("priority"); // 優先出題する遺産ID(重み付け出題)

  // 遺産DBに依存しない固定バンク系は先に処理
  if (type === "criteria-meaning") {
    return NextResponse.json(generateCriteriaMeaningQuestions(count));
  }
  if (type === "concept") {
    return NextResponse.json(generateConceptQuestions(count));
  }
  if (type === "serial") {
    return NextResponse.json(generateSerialQuestions(count));
  }

  let query = supabase.from("heritages").select("*");

  if (ids) {
    // 復習モード: 指定IDのみ出題（地域/カテゴリ/重要度フィルタは無視）
    query = query.in("id", ids.split(",").map(Number));
  } else {
    if (category && category !== "all") query = query.eq("category", category);

    if (region && region !== "all") {
      if (region === "japan") {
        query = query.eq("country_en", "Japan");
      } else {
        const regionMap: Record<string, string> = {
          europe: "Europe and North America",
          asia: "Asia and the Pacific",
          americas: "Latin America and the Caribbean",
          africa: "Africa",
          arab: "Arab States",
        };
        if (regionMap[region]) {
          query = query.eq("region", regionMap[region]);
        }
      }
    }

    if (importance) query = query.gte("exam_importance", parseInt(importance));
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const allHeritages = (data || []).map(toHeritage);

  if (allHeritages.length < 4) {
    return NextResponse.json({ error: "Not enough data" }, { status: 400 });
  }

  // 重み付け出題: priority で指定された遺産を優先的に正答として採用。
  // 不足分は残りからランダム補充。誤答選択肢(others)は常に全プールから取るため質を保つ。
  let selected: Heritage[];
  if (priority) {
    const priorityIds = priority.split(",").map(Number);
    const byId = new Map(allHeritages.map((h) => [h.id, h]));
    const pri = priorityIds
      .map((id) => byId.get(id))
      .filter((h): h is Heritage => !!h);
    const rest = shuffle(allHeritages.filter((h) => !priorityIds.includes(h.id)));
    selected = [...pri, ...rest].slice(0, count);
  } else {
    selected = shuffle(allHeritages).slice(0, count);
  }

  const questions: QuizQuestion[] = selected.map((h, idx) => {
    const others = shuffle(
      allHeritages.filter((o) => o.id !== h.id)
    ).slice(0, 3);

    let question = "";
    let options: string[] = [];
    let correctIndex = 0;

    switch (type) {
      case "country": {
        question = `「${h.nameJa}」がある国はどこですか？`;
        const allOptions = shuffle([
          h.countryJa,
          ...others.map((o) => o.countryJa),
        ]);
        options = allOptions;
        correctIndex = allOptions.indexOf(h.countryJa);
        break;
      }
      case "photo": {
        question = "この写真の世界遺産の名前は？";
        const allOptions = shuffle([
          h.nameJa,
          ...others.map((o) => o.nameJa),
        ]);
        options = allOptions;
        correctIndex = allOptions.indexOf(h.nameJa);
        break;
      }
      case "description": {
        question = h.shortDescJa || `登録年${h.inscriptionYear}年、${h.countryJa}にある${h.category === "Cultural" ? "文化" : h.category === "Natural" ? "自然" : "複合"}遺産は？`;
        const allOptions = shuffle([
          h.nameJa,
          ...others.map((o) => o.nameJa),
        ]);
        options = allOptions;
        correctIndex = allOptions.indexOf(h.nameJa);
        break;
      }
      case "map": {
        question = `地図上のピンが示す世界遺産はどれですか？（${h.countryJa}）`;
        const allOpts = shuffle([
          h.nameJa,
          ...others.map((o) => o.nameJa),
        ]);
        options = allOpts;
        correctIndex = allOpts.indexOf(h.nameJa);
        break;
      }
      case "truefalse": {
        const isTrue = Math.random() > 0.5;
        if (isTrue) {
          question = `「${h.nameJa}」は${h.countryJa}にある。○か×か？`;
          options = ["○", "×"];
          correctIndex = 0;
        } else {
          const wrong = others[0];
          question = `「${h.nameJa}」は${wrong.countryJa}にある。○か×か？`;
          options = ["○", "×"];
          correctIndex = 1;
        }
        break;
      }
      case "criteria": {
        question = `「${h.nameJa}」が世界遺産に登録された登録基準として正しいものはどれですか？`;
        const correct = h.unescoCriteria || "";
        // 正解と異なり、互いに重複しない登録基準を最大3つ集める
        const distractors = new Set<string>();
        for (const o of shuffle(allHeritages)) {
          if (distractors.size >= 3) break;
          const c = o.unescoCriteria || "";
          if (c && c !== correct) distractors.add(c);
        }
        const allOpts = shuffle([correct, ...Array.from(distractors)]);
        options = allOpts;
        correctIndex = allOpts.indexOf(correct);
        break;
      }
      case "year": {
        question = `「${h.nameJa}」が世界遺産に登録されたのはいつですか？`;
        // 正解年を含む4つの異なる年を集める
        const years = new Set<number>([h.inscriptionYear]);
        for (const o of shuffle(allHeritages)) {
          if (years.size >= 4) break;
          years.add(o.inscriptionYear);
        }
        const yearOpts = shuffle(Array.from(years));
        options = yearOpts.map((y) => `${y}年`);
        correctIndex = yearOpts.indexOf(h.inscriptionYear);
        break;
      }
      default: {
        // name type - 充実した問題文を生成
        question = generateNameQuestion(h);
        const allOptions = shuffle([
          h.nameJa,
          ...others.map((o) => o.nameJa),
        ]);
        options = allOptions;
        correctIndex = allOptions.indexOf(h.nameJa);
        break;
      }
    }

    return {
      id: `q-${idx}-${h.id}`,
      type: type as QuizQuestion["type"],
      question,
      options,
      correctIndex,
      heritageId: h.id,
      // photo quiz: image + fallback data
      imageUrl: type === "photo" ? h.imageUrl : null,
      nameEn: type === "photo" ? h.nameEn : undefined,
      category: type === "photo" ? h.category : undefined,
      // map quiz: coordinates
      latitude: type === "map" ? h.latitude : undefined,
      longitude: type === "map" ? h.longitude : undefined,
    };
  });

  return NextResponse.json(questions);
}
