import { supabase, toHeritage } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { QuizQuestion } from "@/lib/types";
import { Heritage } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

  let query = supabase.from("heritages").select("*");
  if (category && category !== "all") query = query.eq("category", category);
  if (region === "japan") query = query.eq("country_en", "Japan");
  if (ids) query = query.in("id", ids.split(",").map(Number));

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const allHeritages = (data || []).map(toHeritage);

  if (allHeritages.length < 4) {
    return NextResponse.json({ error: "Not enough data" }, { status: 400 });
  }

  const selected = shuffle(allHeritages).slice(0, count);
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
