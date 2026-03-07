import { supabase, toHeritage } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { QuizQuestion } from "@/lib/types";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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
        question = `緯度${h.latitude.toFixed(1)}°, 経度${h.longitude.toFixed(1)}°付近にある世界遺産は？（${h.countryJa}）`;
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
        question = `${h.countryJa}にある${h.category === "Cultural" ? "文化" : h.category === "Natural" ? "自然" : "複合"}遺産で、${h.inscriptionYear}年登録のものは？`;
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
      imageUrl: type === "photo" ? h.imageUrl : null,
    };
  });

  return NextResponse.json(questions);
}
