"use client";

import { useState } from "react";
import { QuizQuestion, QuizResult } from "@/lib/types";
import { markCorrect, markWrong } from "@/lib/study-storage";
import { recordCorrectAnswer, recordWrongAnswer, addStudyTime } from "@/lib/study-activity";

type QuizState = "setup" | "playing" | "result";

export default function QuizPage() {
  const [state, setState] = useState<QuizState>("setup");
  const [startTime, setStartTime] = useState<number>(0);
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
        setStartTime(Date.now());
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
      recordCorrectAnswer();
    } else {
      markWrong(q.heritageId);
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
              <option value="map">地図(座標)から遺産を当てる</option>
              <option value="truefalse">○×問題</option>
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
            <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">出題範囲</label>
            <select value={region} onChange={(e) => setRegion(e.target.value)} className="form-input">
              <option value="all">すべて</option>
              <option value="japan">日本のみ</option>
            </select>
          </div>

          <button onClick={startQuiz} disabled={loading} className="w-full btn-primary py-3 text-center disabled:opacity-50">
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
                <div key={r.questionId} className="card p-3.5 text-sm space-y-1" style={{ borderColor: "rgba(239,68,68,0.3)" }}>
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
          {wrongResults.length > 0 && (
            <button
              onClick={() => { const wrongIds = wrongResults.map((r) => r.heritageId).join(","); window.location.href = `/quiz?ids=${wrongIds}`; }}
              className="w-full py-3 rounded-xl font-semibold text-white text-center"
              style={{ background: "var(--danger)" }}
            >
              間違えた問題だけ復習 ({wrongResults.length}問)
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
        <span className="badge" style={{ background: "rgba(79,125,243,0.1)", color: "var(--primary)" }}>
          正答: {results.filter((r) => r.isCorrect).length}
        </span>
      </div>

      <div className="progress-bar">
        <div className="progress-bar-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
      </div>

      {q.imageUrl && (
        <div className="rounded-xl overflow-hidden h-48" style={{ boxShadow: "var(--shadow-sm)" }}>
          <img src={q.imageUrl} alt="クイズ画像" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="card p-4">
        <p className="text-base font-medium leading-relaxed">{q.question}</p>
      </div>

      <div className="space-y-2">
        {q.options.map((option, idx) => {
          let style: React.CSSProperties = { borderColor: "var(--border)" };
          let extraClass = "hover:border-[var(--primary)]";
          if (selected !== null) {
            extraClass = "";
            if (idx === q.correctIndex) {
              style = { borderColor: "var(--success)", background: "rgba(34,197,94,0.06)", color: "var(--success)" };
            } else if (idx === selected && idx !== q.correctIndex) {
              style = { borderColor: "var(--danger)", background: "rgba(239,68,68,0.06)", color: "var(--danger)" };
            }
          }
          return (
            <button key={idx} onClick={() => handleAnswer(idx)} disabled={selected !== null}
              className={`w-full text-left p-3.5 rounded-xl border font-medium transition-all ${extraClass}`} style={style}>
              {option}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <button onClick={nextQuestion} className="w-full btn-primary py-3 text-center">
          {currentQ + 1 >= questions.length ? "結果を見る" : "次の問題"}
        </button>
      )}
    </div>
  );
}
