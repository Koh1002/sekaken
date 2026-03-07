"use client";

import { useState, useEffect } from "react";
import { QuizQuestion, QuizResult } from "@/lib/types";
import { markCorrect, markWrong } from "@/lib/study-storage";

type QuizState = "setup" | "playing" | "result";

export default function QuizPage() {
  const [state, setState] = useState<QuizState>("setup");
  const [quizType, setQuizType] = useState("name");
  const [count, setCount] = useState(10);
  const [region, setRegion] = useState("all");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const startQuiz = () => {
    setLoading(true);
    const params = new URLSearchParams({
      type: quizType,
      count: count.toString(),
    });
    if (region !== "all") params.set("region", region);

    const idsParam = new URLSearchParams(window.location.search).get("ids");
    if (idsParam) params.set("ids", idsParam);

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
        setLoading(false);
      });
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const q = questions[currentQ];
    const isCorrect = idx === q.correctIndex;

    if (isCorrect) {
      markCorrect(q.heritageId);
    } else {
      markWrong(q.heritageId);
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
      setState("result");
    } else {
      setCurrentQ((prev) => prev + 1);
      setSelected(null);
    }
  };

  if (state === "setup") {
    return (
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold">クイズ設定</h1>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">出題形式</label>
            <select
              value={quizType}
              onChange={(e) => setQuizType(e.target.value)}
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2"
            >
              <option value="name">ヒントから遺産名を当てる</option>
              <option value="country">遺産から国を当てる</option>
              <option value="photo">写真から遺産名を当てる</option>
              <option value="description">説明から遺産名を当てる</option>
              <option value="truefalse">○×問題</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">問題数</label>
            <select
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value))}
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2"
            >
              <option value={5}>5問</option>
              <option value={10}>10問</option>
              <option value={20}>20問</option>
              <option value={30}>30問</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">出題範囲</label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full border border-[var(--border)] rounded-lg px-3 py-2"
            >
              <option value="all">すべて</option>
              <option value="japan">日本のみ</option>
            </select>
          </div>

          <button
            onClick={startQuiz}
            disabled={loading}
            className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
          >
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

    return (
      <div className="max-w-lg mx-auto space-y-6">
        <h1 className="text-2xl font-bold">結果</h1>

        <div className="text-center py-8 bg-[var(--card-bg)] rounded-xl">
          <p className="text-5xl font-bold mb-2">
            {correct} / {total}
          </p>
          <p className="text-lg text-[var(--muted)]">正答率 {rate}%</p>
          <div className="mt-4">
            {rate >= 80 ? (
              <p className="text-green-600 font-bold">素晴らしい！</p>
            ) : rate >= 60 ? (
              <p className="text-amber-600 font-bold">もう少し！</p>
            ) : (
              <p className="text-red-600 font-bold">復習しましょう</p>
            )}
          </div>
        </div>

        {wrongResults.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-bold">間違えた問題</h2>
            {wrongResults.map((r) => {
              const q = questions.find((q) => q.id === r.questionId)!;
              return (
                <div
                  key={r.questionId}
                  className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm"
                >
                  <p className="font-medium">{q.question}</p>
                  <p className="text-red-600">
                    あなたの回答: {q.options[r.selectedIndex]}
                  </p>
                  <p className="text-green-600">
                    正解: {q.options[r.correctIndex]}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={() => {
              setState("setup");
              setSelected(null);
            }}
            className="flex-1 bg-[var(--primary)] text-white py-3 rounded-lg font-semibold hover:opacity-90"
          >
            もう一度
          </button>
          <button
            onClick={() => (window.location.href = "/review")}
            className="flex-1 bg-amber-500 text-white py-3 rounded-lg font-semibold hover:opacity-90"
          >
            復習する
          </button>
        </div>
      </div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-bold">
          問題 {currentQ + 1} / {questions.length}
        </h1>
        <span className="text-sm text-[var(--muted)]">
          正答: {results.filter((r) => r.isCorrect).length}
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-[var(--primary)] h-2 rounded-full transition-all"
          style={{
            width: `${((currentQ + 1) / questions.length) * 100}%`,
          }}
        />
      </div>

      {q.imageUrl && (
        <div className="rounded-xl overflow-hidden h-48">
          <img
            src={q.imageUrl}
            alt="クイズ画像"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="bg-[var(--card-bg)] rounded-xl p-4">
        <p className="text-lg font-medium">{q.question}</p>
      </div>

      <div className="space-y-2">
        {q.options.map((option, idx) => {
          let btnColor = "border-[var(--border)] hover:bg-gray-50";
          if (selected !== null) {
            if (idx === q.correctIndex) {
              btnColor = "border-green-500 bg-green-50 text-green-700";
            } else if (idx === selected && idx !== q.correctIndex) {
              btnColor = "border-red-500 bg-red-50 text-red-700";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              disabled={selected !== null}
              className={`w-full text-left p-3 rounded-lg border ${btnColor} transition-colors`}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <button
          onClick={nextQuestion}
          className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold hover:opacity-90"
        >
          {currentQ + 1 >= questions.length ? "結果を見る" : "次の問題"}
        </button>
      )}
    </div>
  );
}
