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

  const catStyle =
    heritage.category === "Cultural"
      ? { bg: "rgba(26,45,80,0.1)", color: "#1a2d50" }
      : heritage.category === "Natural"
      ? { bg: "rgba(46,139,87,0.1)", color: "#2e8b57" }
      : { bg: "rgba(124,109,171,0.1)", color: "#7c6dab" };

  return (
    <div className="max-w-3xl space-y-5">
      <Link
        href="/heritage"
        className="text-sm hover:underline inline-flex items-center gap-1"
        style={{ color: "var(--primary)" }}
      >
        ← 一覧に戻る
      </Link>

      <div className="card overflow-hidden">
        <HeritageImage
          imageUrl={heritage.imageUrl}
          nameEn={heritage.nameEn}
          nameJa={heritage.nameJa}
          category={heritage.category}
          className="w-full h-64"
        />
        {heritage.imageAttribution && (
          <p className="text-xs text-[var(--muted)] px-4 py-2 border-t border-[var(--border)]">
            📷 {heritage.imageAttribution}
          </p>
        )}
      </div>

      <div>
        <h1 className="text-xl font-bold">{heritage.nameJa}</h1>
        <p className="text-sm text-[var(--muted)] mt-0.5">{heritage.nameEn}</p>
      </div>

      <StudyButtons heritageId={heritage.id} />

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
        <InfoItem label="国" value={heritage.countryJa} />
        <InfoItem label="地域" value={heritage.region} />
        <InfoItem label="カテゴリ" value={categoryLabel} badgeStyle={catStyle} />
        <InfoItem label="登録年" value={`${heritage.inscriptionYear}年`} />
        <InfoItem label="登録基準" value={heritage.unescoCriteria || "—"} />
        <InfoItem
          label="検定重要度"
          value={"★".repeat(heritage.examImportance)}
          valueColor="#c4a35a"
        />
      </div>

      {heritage.shortDescJa && (
        <div className="card p-4" style={{ borderColor: "rgba(26,45,80,0.2)" }}>
          <h2 className="font-semibold text-sm mb-1.5" style={{ color: "var(--primary)" }}>概要</h2>
          <p className="text-sm leading-relaxed">{heritage.shortDescJa}</p>
        </div>
      )}

      {heritage.memoryTipJa && (
        <div className="card p-4" style={{ borderColor: "rgba(196,163,90,0.25)" }}>
          <h2 className="font-semibold text-sm mb-1.5" style={{ color: "var(--accent-dark)" }}>覚え方のポイント</h2>
          <p className="text-sm leading-relaxed">{heritage.memoryTipJa}</p>
        </div>
      )}

      {heritage.tags && (
        <div className="flex flex-wrap gap-1.5">
          {heritage.tags.split(",").map((tag) => (
            <span
              key={tag}
              className="badge"
              style={{ background: "var(--background)", color: "var(--muted)" }}
            >
              {tag.trim()}
            </span>
          ))}
        </div>
      )}

      <div className="card overflow-hidden h-48">
        <DetailMap latitude={heritage.latitude} longitude={heritage.longitude} name={heritage.nameJa} />
      </div>

      <div className="card p-4 space-y-2 text-xs text-[var(--muted)]">
        <h3 className="font-semibold text-sm text-[var(--foreground)]">出典・リンク</h3>
        {heritage.unescoUrl && (
          <p>
            UNESCO:{" "}
            <a
              href={heritage.unescoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--primary)" }}
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
              className="hover:underline"
              style={{ color: "var(--primary)" }}
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
          className="btn-secondary text-sm text-center"
        >
          写真で学ぶ
        </Link>
      </div>
    </div>
  );
}

function InfoItem({ label, value, badgeStyle, valueColor }: { label: string; value: string; badgeStyle?: { bg: string; color: string }; valueColor?: string }) {
  return (
    <div className="card p-3">
      <p className="text-xs text-[var(--muted)] mb-0.5">{label}</p>
      {badgeStyle ? (
        <span className="badge" style={{ background: badgeStyle.bg, color: badgeStyle.color }}>{value}</span>
      ) : (
        <p className="font-semibold" style={valueColor ? { color: valueColor } : {}}>{value}</p>
      )}
    </div>
  );
}
