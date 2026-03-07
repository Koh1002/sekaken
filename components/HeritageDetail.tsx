"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Heritage } from "@/lib/types";
import { StudyButtons } from "./StudyButtons";
import { HeritageImage } from "./HeritageImage";

const DetailMap = dynamic(() => import("./DetailMap"), { ssr: false });

export function HeritageDetail({ heritage }: { heritage: Heritage }) {
  const categoryLabel =
    heritage.category === "Cultural"
      ? "文化遺産"
      : heritage.category === "Natural"
      ? "自然遺産"
      : "複合遺産";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        href="/heritage"
        className="text-sm text-[var(--primary)] hover:underline"
      >
        ← 一覧に戻る
      </Link>

      <div className="rounded-2xl overflow-hidden">
        <HeritageImage
          imageUrl={heritage.imageUrl}
          nameEn={heritage.nameEn}
          nameJa={heritage.nameJa}
          category={heritage.category}
          className="w-full h-64"
        />
        {heritage.imageAttribution && (
          <p className="text-xs text-[var(--muted)] p-2 bg-[var(--card-bg)]">
            📷 {heritage.imageAttribution}
          </p>
        )}
      </div>

      <div>
        <h1 className="text-2xl font-bold">{heritage.nameJa}</h1>
        <p className="text-sm text-[var(--muted)]">{heritage.nameEn}</p>
      </div>

      <StudyButtons heritageId={heritage.id} />

      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoItem label="国" value={heritage.countryJa} />
        <InfoItem label="地域" value={heritage.region} />
        <InfoItem label="カテゴリ" value={categoryLabel} />
        <InfoItem label="登録年" value={`${heritage.inscriptionYear}年`} />
        <InfoItem label="登録基準" value={heritage.unescoCriteria || "—"} />
        <InfoItem
          label="検定重要度"
          value={"★".repeat(heritage.examImportance)}
        />
      </div>

      {heritage.shortDescJa && (
        <div className="card p-4" style={{ borderColor: "var(--primary)", borderWidth: "1px" }}>
          <h2 className="font-bold text-sm mb-1" style={{ color: "var(--primary)" }}>概要</h2>
          <p className="text-sm">{heritage.shortDescJa}</p>
        </div>
      )}

      {heritage.memoryTipJa && (
        <div className="card p-4" style={{ borderColor: "var(--accent)", borderWidth: "1px" }}>
          <h2 className="font-bold text-sm mb-1" style={{ color: "var(--accent-dark)" }}>覚え方のポイント</h2>
          <p className="text-sm">{heritage.memoryTipJa}</p>
        </div>
      )}

      {heritage.tags && (
        <div className="flex flex-wrap gap-1">
          {heritage.tags.split(",").map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-gray-100 rounded text-xs text-[var(--muted)]"
            >
              {tag.trim()}
            </span>
          ))}
        </div>
      )}

      <div className="rounded-xl overflow-hidden h-48">
        <DetailMap latitude={heritage.latitude} longitude={heritage.longitude} name={heritage.nameJa} />
      </div>

      <div className="space-y-2 text-xs text-[var(--muted)]">
        <h3 className="font-bold text-sm text-[var(--foreground)]">出典・リンク</h3>
        {heritage.unescoUrl && (
          <p>
            UNESCO:{" "}
            <a
              href={heritage.unescoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline"
            >
              {heritage.unescoUrl}
            </a>
          </p>
        )}
        {heritage.officialUrl && (
          <p>
            公式:{" "}
            <a
              href={heritage.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] hover:underline"
            >
              {heritage.officialUrl}
            </a>
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Link
          href={`/quiz?ids=${heritage.id}`}
          className="btn-primary text-sm text-center"
        >
          この遺産でクイズ
        </Link>
        <Link
          href={`/photo?id=${heritage.id}`}
          className="px-4 py-3 rounded-xl text-sm font-semibold border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all text-center"
        >
          写真で学ぶ
        </Link>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-3">
      <p className="text-xs text-[var(--muted)]">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}
