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
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">世界遺産一覧</h1>

      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="遺産名・国名で検索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px]"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">全カテゴリ</option>
          <option value="Cultural">文化遺産</option>
          <option value="Natural">自然遺産</option>
          <option value="Mixed">複合遺産</option>
        </select>

        <select
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="border border-[var(--border)] rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">全地域</option>
          <option value="japan">日本</option>
          <option value="asia">アジア太平洋</option>
          <option value="europe">ヨーロッパ・北米</option>
          <option value="americas">中南米・カリブ海</option>
          <option value="africa">アフリカ</option>
          <option value="arab">アラブ諸国</option>
        </select>

        <div className="flex border border-[var(--border)] rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("card")}
            className={`px-3 py-2 text-sm ${
              viewMode === "card" ? "bg-blue-100 text-blue-700" : ""
            }`}
          >
            カード
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-2 text-sm ${
              viewMode === "table" ? "bg-blue-100 text-blue-700" : ""
            }`}
          >
            テーブル
          </button>
        </div>
      </div>

      <p className="text-sm text-[var(--muted)]">
        {loading ? "読込中..." : `${heritages.length}件`}
      </p>

      {loading ? (
        <div className="text-center py-12 text-[var(--muted)]">読込中...</div>
      ) : viewMode === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {heritages.map((h) => (
            <HeritageCard key={h.id} heritage={h} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left p-2 border-b">名称</th>
                <th className="text-left p-2 border-b">国</th>
                <th className="text-left p-2 border-b">カテゴリ</th>
                <th className="text-left p-2 border-b">登録年</th>
                <th className="text-left p-2 border-b">重要度</th>
              </tr>
            </thead>
            <tbody>
              {heritages.map((h) => (
                <tr
                  key={h.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    (window.location.href = `/heritage/${h.id}`)
                  }
                >
                  <td className="p-2 border-b font-medium">{h.nameJa}</td>
                  <td className="p-2 border-b">{h.countryJa}</td>
                  <td className="p-2 border-b">
                    <span
                      className={`px-2 py-0.5 rounded text-xs ${
                        h.category === "Cultural"
                          ? "bg-blue-100 text-blue-700"
                          : h.category === "Natural"
                          ? "bg-green-100 text-green-700"
                          : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {h.category === "Cultural"
                        ? "文化"
                        : h.category === "Natural"
                        ? "自然"
                        : "複合"}
                    </span>
                  </td>
                  <td className="p-2 border-b">{h.inscriptionYear}</td>
                  <td className="p-2 border-b">
                    {"★".repeat(h.examImportance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
