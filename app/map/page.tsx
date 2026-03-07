"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Heritage } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function MapPage() {
  const [heritages, setHeritages] = useState<Heritage[]>([]);
  const [category, setCategory] = useState("all");
  const [region, setRegion] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (region !== "all") params.set("region", region);

    setLoading(true);
    fetch(`/api/heritages?${params}`)
      .then((res) => res.json())
      .then((data) => {
        setHeritages(data);
        setLoading(false);
      });
  }, [category, region]);

  return (
    <div className="space-y-4">
      <h1 className="page-header">地図で学ぶ</h1>

      <div className="flex flex-wrap gap-2">
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

        <span className="text-sm text-[var(--muted)] self-center">
          {loading ? "読込中..." : `${heritages.length}件表示`}
        </span>
      </div>

      <div className="card overflow-hidden" style={{ height: "70vh" }}>
        {loading ? (
          <div className="h-full flex items-center justify-center text-[var(--muted)]">
            読込中...
          </div>
        ) : (
          <MapView heritages={heritages} />
        )}
      </div>
    </div>
  );
}
