import { prisma } from "@/lib/prisma";
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

  const where: Record<string, unknown> = {};
  if (category && category !== "all") where.category = category;
  if (region === "japan") where.countryEn = "Japan";
  if (ids) where.id = { in: ids.split(",").map(Number) };

  const allHeritages = await prisma.heritage.findMany({ where });

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
