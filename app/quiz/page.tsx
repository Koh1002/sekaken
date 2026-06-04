"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { QuizQuestion, QuizResult, Heritage } from "@/lib/types";
import { markCorrect, markWrong, getAllRecords } from "@/lib/study-storage";
import { calculateReviewScore } from "@/lib/review-score";
import { recordCorrectAnswer, recordWrongAnswer, addStudyTime } from "@/lib/study-activity";
import { HeritageImage } from "@/components/HeritageImage";

const QuizMapView = dynamic(() => import("@/components/QuizMapView"), { ssr: false });

type QuizState = "setup" | "playing" | "result";

// 遺産ベースの出題形式(重み付け対象)。固定バンク系(concept/serial/criteria-meaning)は対象外。
const HERITAGE_BASED_TYPES = ["name", "country", "photo", "description", "map", "truefalse", "criteria", "year"];

// 学習記録と重要度から重み付けし、count件の遺産IDを非復元抽出する
function pickWeightedIds(pool: Heritage[], count: number): number[] {
  const records = getAllRecords();
  const items = pool.map((h) => {
    const rec = records[h.id];
    const reviewScore = rec ? calculateReviewScore(rec) : 0;
    // 重要度 + 復習優先度(苦手/誤答/放置を含む) + 未学習ボーナス
    const weight = Math.max(0.1, h.examImportance + Math.max(0, reviewScore) * 0.5 + (rec ? 0 : 2));
    return { id: h.id, weight };
  });

  const chosen: number[] = [];
  const arr = [...items];
  while (chosen.length < count && arr.length > 0) {
    const total = arr.reduce((s, i) => s + i.weight, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < arr.length; idx++) {
      r -= arr[idx].weight;
      if (r <= 0) break;
    }
    if (idx >= arr.length) idx = arr.length - 1;
    chosen.push(arr[idx].id);
    arr.splice(idx, 1);
  }
  return chosen;
}

export default function QuizPage() {
  const [state, setState] = useState<QuizState>("setup");
  const [startTime, setStartTime] = useState<number>(0);
  const [quizType, setQuizType] = useState("name");
  const [count, setCount] = useState(10);
  const [region, setRegion] = useState("all");
  const [category, setCategory] = useState("all");
  const [importance, setImportance] = useState("all");
  const [weighted, setWeighted] = useState(true);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    const params = new URLSearchParams({
      type: quizType,
      count: count.toString(),
    });
    if (region !== "all") params.set("region", region);
    if (category !== "all") params.set("category", category);
    if (importance !== "all") params.set("importance", importance);

    const idsParam = new URLSearchParams(window.location.search).get("ids");
    if (idsParam) params.set("ids", idsParam);

    // 重み付け出題: 遺産ベースの形式かつ復習モード(ids)でない場合のみ。
    // 学習記録(苦手/誤答/放置)と重要度から優先する遺産IDを決め、priorityで渡す。
    if (weighted && HERITAGE_BASED_TYPES.includes(quizType) && !idsParam) {
      try {
        const poolParams = new URLSearchParams();
        if (region !== "all") poolParams.set("region", region);
        if (category !== "all") poolParams.set("category", category);
        if (importance !== "all") poolParams.set("importance", importance);
        const pool: Heritage[] = await fetch(`/api/heritages?${poolParams}`).then((r) => r.json());
        if (Array.isArray(pool) && pool.length > 0) {
          const priorityIds = pickWeightedIds(pool, count);
          if (priorityIds.length > 0) params.set("priority", priorityIds.join(","));
        }
      } catch {
        // プール取得失敗時は重み付けなしで続行
      }
    }

    fetch(`/api/quiz?${params}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          setLoading(false);
          return;
        }
        setQuestions(data);
        setCurrentQ(0);
        setResults([]);
        setSelected(null);
        setState("playing");
        setStartTime(Date.now());
        setLoading(false);
      });
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const q = questions[currentQ];
    const isCorrect = idx === q.correctIndex;

    // heritageId が 0 の問題（登録基準の意味クイズ等）は遺産別の学習記録に紐づけない
    if (isCorrect) {
      if (q.heritageId > 0) markCorrect(q.heritageId);
      recordCorrectAnswer();
    } else {
      if (q.heritageId > 0) markWrong(q.heritageId);
      recordWrongAnswer();
    }

    setResults((prev) => [
      ...prev,
      {
        questionId: q.id,
        heritageId: q.heritageId,
        isCorrect,
        selectedIndex: idx,
        correctIndex: q.correctIndex,
      },
    ]);
  };

  const nextQuestion = () => {
    if (currentQ + 1 >= questions.length) {
      if (startTime > 0) {
        addStudyTime(Math.round((Date.now() - startTime) / 1000));
      }
      setState("result");
    } else {
      setCurrentQ((prev) => prev + 1);
      setSelected(null);
    }
  };

  if (state === "setup") {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="page-header">クイズ設定</h1>

        <div className="card p-5 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">出題形式</label>
            <select value={quizType} onChange={(e) => setQuizType(e.target.value)} className="form-input">
              <option value="name">ヒントから遺産名を当てる</option>
              <option value="country">遺産から国を当てる</option>
              <option value="photo">写真から遺産名を当てる</option>
              <option value="description">説明から遺産名を当てる</option>
              <option value="map">地図から遺産を当てる</option>
              <option value="truefalse">○×問題</option>
              <option value="criteria">登録基準を当てる（遺産→基準）</option>
              <option value="criteria-meaning">登録基準の意味を覚える（基準⇔意味）</option>
              <option value="year">登録年を当てる（遺産→年）</option>
              <option value="concept">概念・制度（基礎知識）</option>
              <option value="serial">構成資産・所在地（日本の連続遺産）</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">問題数</label>
            <select value={count} onChange={(e) => setCount(parseInt(e.target.value))} className="form-input">
              <option value={5}>5問</option>
              <option value={10}>10問</option>
              <option value={20}>20問</option>
              <option value={30}>30問</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">出題範囲（地域）</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="form-input">
              <option value="all">全地域</option>
              <option value="japan">日本</option>
              <option value="asia">アジア太平洋</option>
              <option value="europe">ヨーロッパ・北米</option>
              <option value="americas">中南米・カリブ海</option>
              <option value="africa">アフリカ</option>
              <option value="arab">アラブ諸国</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">カテゴリ</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input">
              <option value="all">全カテゴリ</option>
              <option value="Cultural">文化遺産</option>
              <option value="Natural">自然遺産</option>
              <option value="Mixed">複合遺産</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">重要度</label>
            <select value={importance} onChange={(e) => setImportance(e.target.value)} className="form-input">
              <option value="all">すべて</option>
              <option value="3">★3以上</option>
              <option value="4">★4以上</option>
              <option value="5">★5のみ</option>
            </select>
          </div>

          {HERITAGE_BASED_TYPES.includes(quizType) && (
            <label className="flex items-start gap-3 cursor-pointer rounded-xl border border-[var(--border)] p-3.5">
              <input
                type="checkbox"
                checked={weighted}
                onChange={(e) => setWeighted(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
              />
              <span className="text-sm">
                <span className="font-semibold">苦手・重要度を優先して出題</span>
                <span className="block text-xs text-[var(--muted)] mt-0.5">
                  間違えた・苦手登録・しばらく学習していない遺産や、出題重要度の高い遺産を優先します。
                </span>
              </span>
            </label>
          )}

          <button data-testid="quiz-start" onClick={startQuiz} disabled={loading} className="w-full btn-primary py-3 text-center disabled:opacity-50">
            {loading ? "読込中..." : "クイズ開始"}
          </button>
        </div>
      </div>
    );
  }

  if (state === "result") {
    const correct = results.filter((r) => r.isCorrect).length;
    const total = results.length;
    const rate = Math.round((correct / total) * 100);
    const wrongResults = results.filter((r) => !r.isCorrect);
    // 遺産に紐づく誤答のみ「間違えた問題だけ復習」の対象（基準の意味クイズ等は対象外）
    const wrongHeritageIds = wrongResults.map((r) => r.heritageId).filter((id) => id > 0);

    return (
      <div className="max-w-lg mx-auto space-y-5">
        <h1 className="page-header">結果</h1>

        <div className="card text-center py-8 px-6">
          <p className="text-5xl font-bold mb-3" style={{ color: rate >= 80 ? "var(--success)" : rate >= 60 ? "var(--accent-dark)" : "var(--danger)" }}>
            {correct} / {total}
          </p>
          <div className="progress-bar mt-4 mx-auto max-w-xs">
            <div className="progress-bar-fill" style={{ width: `${rate}%`, background: rate >= 80 ? "var(--success)" : rate >= 60 ? "var(--warning)" : "var(--danger)" }} />
          </div>
          <p className="text-base text-[var(--muted)] mt-3">正答率 {rate}%</p>
          <div className="mt-2">
            {rate >= 80 ? (
              <p className="font-bold" style={{ color: "var(--success)" }}>素晴らしい！</p>
            ) : rate >= 60 ? (
              <p className="font-bold" style={{ color: "var(--accent-dark)" }}>もう少し！</p>
            ) : (
              <p className="font-bold" style={{ color: "var(--danger)" }}>復習しましょう</p>
            )}
          </div>
        </div>

        {wrongResults.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold">間違えた問題</h2>
            {wrongResults.map((r) => {
              const q = questions.find((q) => q.id === r.questionId)!;
              return (
                <div key={r.questionId} className="card p-3.5 text-sm space-y-1" style={{ borderColor: "rgba(192,57,43,0.3)" }}>
                  <p className="font-medium">{q.question}</p>
                  <p style={{ color: "var(--danger)" }}>あなたの回答: {q.options[r.selectedIndex]}</p>
                  <p style={{ color: "var(--success)" }}>正解: {q.options[r.correctIndex]}</p>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setState("setup"); setSelected(null); }} className="flex-1 btn-primary py-3 text-center">
            もう一度
          </button>
          <button onClick={() => (window.location.href = "/review")} className="flex-1 btn-secondary py-3 text-center">
            復習する
          </button>
          {wrongHeritageIds.length > 0 && (
            <button
              onClick={() => { window.location.href = `/quiz?ids=${wrongHeritageIds.join(",")}`; }}
              className="w-full py-3 rounded-xl font-semibold text-white text-center"
              style={{ background: "var(--danger)" }}
            >
              間違えた問題だけ復習 ({wrongHeritageIds.length}問)
            </button>
          )}
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-base font-bold">問題 {currentQ + 1} / {questions.length}</h1>
        <span className="badge" style={{ background: "rgba(196,163,90,0.12)", color: "var(--accent-dark)" }}>
          正答: {results.filter((r) => r.isCorrect).length}
        </span>
      </div>

      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>

      {/* 写真クイズ: HeritageImageコンポーネントで確実に写真表示 */}
      {q.type === "photo" && (
        <div className="rounded-xl overflow-hidden h-48" style={{ boxShadow: "var(--shadow-sm)" }}>
          <HeritageImage
            imageUrl={q.imageUrl || null}
            nameEn={q.nameEn || ""}
            nameJa="クイズ画像"
            category={q.category || "Cultural"}
            className="w-full h-full"
          />
        </div>
      )}

      {/* 地図クイズ: Leafletマップにピンを表示 */}
      {q.type === "map" && q.latitude !== undefined && q.longitude !== undefined && (
        <div className="rounded-xl overflow-hidden h-56" style={{ boxShadow: "var(--shadow-sm)" }}>
          <QuizMapView latitude={q.latitude} longitude={q.longitude} />
        </div>
      )}

      <div className="card p-4">
        <p className="text-base font-medium leading-relaxed whitespace-pre-line">{q.question}</p>
      </div>

      <div className="space-y-2">
        {q.options.map((option, idx) => {
          let style: React.CSSProperties = { borderColor: "var(--border)" };
          let extraClass = "hover:border-[var(--primary)]";
          if (selected !== null) {
            extraClass = "";
            if (idx === q.correctIndex) {
              style = { borderColor: "var(--success)", background: "rgba(46,139,87,0.06)", color: "var(--success)" };
            } else if (idx === selected && idx !== q.correctIndex) {
              style = { borderColor: "var(--danger)", background: "rgba(192,57,43,0.06)", color: "var(--danger)" };
            }
          }
          return (
            <button key={idx} data-testid="quiz-option" onClick={() => handleAnswer(idx)} disabled={selected !== null}
              className={`w-full text-left p-3.5 rounded-xl border font-medium transition-all ${extraClass}`} style={style}>
              {option}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <button data-testid="quiz-next" onClick={nextQuestion} className="w-full btn-primary py-3 text-center">
          {currentQ + 1 >= questions.length ? "結果を見る" : "次の問題"}
        </button>
      )}
    </div>
  );
}
