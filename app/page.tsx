import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { count: totalCount } = await supabase
    .from("heritages")
    .select("*", { count: "exact", head: true });
  const { count: japanCount } = await supabase
    .from("heritages")
    .select("*", { count: "exact", head: true })
    .eq("country_en", "Japan");

  const features = [
    {
      href: "/heritage",
      icon: "📋",
      title: "遺産一覧",
      desc: "世界遺産を一覧で閲覧・検索",
      color: "bg-blue-50 border-blue-200",
    },
    {
      href: "/map",
      icon: "🗺️",
      title: "地図で学ぶ",
      desc: "世界地図上で遺産の位置を確認",
      color: "bg-green-50 border-green-200",
    },
    {
      href: "/photo",
      icon: "📷",
      title: "写真で学ぶ",
      desc: "フラッシュカードで写真学習",
      color: "bg-purple-50 border-purple-200",
    },
    {
      href: "/quiz",
      icon: "❓",
      title: "クイズ",
      desc: "4択問題で知識をテスト",
      color: "bg-amber-50 border-amber-200",
    },
    {
      href: "/review",
      icon: "🔄",
      title: "復習する",
      desc: "苦手・間違えた遺産を復習",
      color: "bg-red-50 border-red-200",
    },
    {
      href: "/dashboard",
      icon: "📊",
      title: "学習進捗",
      desc: "学習状況をダッシュボードで確認",
      color: "bg-indigo-50 border-indigo-200",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <h1 className="text-3xl font-bold mb-2">世界遺産検定2級 学習アプリ</h1>
        <p className="text-[var(--muted)]">
          {totalCount}件の世界遺産データ（日本{japanCount}件を含む）で学習
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={`block p-6 rounded-xl border ${f.color} hover:shadow-md transition-shadow`}
          >
            <div className="text-3xl mb-3">{f.icon}</div>
            <h2 className="text-lg font-bold mb-1">{f.title}</h2>
            <p className="text-sm text-[var(--muted)]">{f.desc}</p>
          </Link>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
        <h2 className="font-bold text-lg mb-2">📝 今日のおすすめ復習</h2>
        <p className="text-sm text-[var(--muted)] mb-3">
          苦手な遺産や間違えた問題を効率的に復習しましょう
        </p>
        <Link
          href="/review"
          className="inline-block bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 transition-colors"
        >
          復習を始める
        </Link>
      </div>

      <div className="text-center text-xs text-[var(--muted)] py-4">
        <p>データ出典: UNESCO World Heritage Centre, 文化庁, Wikipedia</p>
        <p>画像: Wikimedia Commons (CC BY-SA)</p>
      </div>
    </div>
  );
}
