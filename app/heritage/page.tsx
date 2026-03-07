"use client";

import { useState, useEffect } from "react";
import { Heritage } from "@/lib/types";
import { HeritageCard } from "@/components/HeritageCard";

export default function HeritageListPage() {
  const [heritages, setHeritages] = useState<Heritage[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [region, setRegion] = useState("all");
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (region !== "all") params.set("region", region);
    if (search) params.set("search", search);

    setLoading(true);
    fetch(`/api/heritages?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setHeritages(data);
        setLoading(false);
      });
  }, [category, region, search]);

  return (
    <div className="space-y-5">
      <h1 className="page-header">世界遺産一覧</h1>

      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="遺産名・国名で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input flex-1 min-w-[200px]"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-input w-auto">
          <option value="all">全カテゴリ</option>
          <option value="Cultural">文化遺産</option>
          <option value="Natural">自然遺産</option>
          <option value="Mixed">複合遺産</option>
        </select>
        <select value={region} onChange={(e) => setRegion(e.target.value)} className="form-input w-auto">
          <option value="all">全地域</option>
          <option value="japan">日本</option>
          <option value="asia">アジア太平洋</option>
          <option value="europe">ヨーロッパ・北米</option>
          <option value="americas">中南米・カリブ海</option>
          <option value="africa">アフリカ</option>
          <option value="arab">アラブ諸国</option>
        </select>
        <div className="flex rounded-xl overflow-hidden border border-[var(--border)]">
          <button onClick={() => setViewMode("card")}
            className={`px-3 py-2 text-sm transition-colors ${viewMode === "card" ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}>
            カード
          </button>
          <button onClick={() => setViewMode("table")}
            className={`px-3 py-2 text-sm transition-colors ${viewMode === "table" ? "bg-[var(--primary)] text-white" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}>
            テーブル
          </button>
        </div>
      </div>

      <p className="text-sm text-[var(--muted)]">{loading ? "読込中..." : `${heritages.length}件`}</p>

      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">読込中...</div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {heritages.map((h) => (
            <HeritageCard key={h.id} heritage={h} />
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]" style={{ background: "var(--background)" }}>
                  <th className="text-left p-3 font-semibold text-xs text-[var(--muted)] uppercase tracking-wider">名称</th>
                  <th className="text-left p-3 font-semibold text-xs text-[var(--muted)] uppercase tracking-wider">国</th>
                  <th className="text-left p-3 font-semibold text-xs text-[var(--muted)] uppercase tracking-wider">カテゴリ</th>
                  <th className="text-left p-3 font-semibold text-xs text-[var(--muted)] uppercase tracking-wider">登録年</th>
                  <th className="text-left p-3 font-semibold text-xs text-[var(--muted)] uppercase tracking-wider">重要度</th>
                </tr>
              </thead>
              <tbody>
                {heritages.map((h) => {
                  const catStyle = h.category === "Cultural"
                    ? { bg: "rgba(79,125,243,0.1)", color: "#4f7df3" }
                    : h.category === "Natural"
                    ? { bg: "rgba(34,197,94,0.1)", color: "#22c55e" }
                    : { bg: "rgba(168,85,247,0.1)", color: "#a855f7" };
                  return (
                    <tr key={h.id} className="border-b border-[var(--border)] hover:bg-[var(--background)] cursor-pointer transition-colors"
                      onClick={() => (window.location.href = `/heritage/${h.id}`)}>
                      <td className="p-3 font-medium">{h.nameJa}</td>
                      <td className="p-3 text-[var(--muted)]">{h.countryJa}</td>
                      <td className="p-3">
                        <span className="badge" style={{ background: catStyle.bg, color: catStyle.color }}>
                          {h.category === "Cultural" ? "文化" : h.category === "Natural" ? "自然" : "複合"}
                        </span>
                      </td>
                      <td className="p-3 text-[var(--muted)]">{h.inscriptionYear}</td>
                      <td className="p-3" style={{ color: "#f59e42" }}>{"★".repeat(h.examImportance)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
