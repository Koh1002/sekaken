import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { StudyStats } from "@/components/StudyStats";
import { ListIcon, MapIcon, CameraIcon, QuizIcon, ReviewIcon, ChartIcon } from "@/components/NavIcons";

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
      href: "/quiz",
      IconComp: QuizIcon,
      title: "クイズ",
      desc: "4択問題で知識をテスト",
      color: "#4f7df3",
      bg: "rgba(79,125,243,0.08)",
    },
    {
      href: "/heritage",
      IconComp: ListIcon,
      title: "遺産一覧",
      desc: "世界遺産を閲覧・検索",
      color: "#6366f1",
      bg: "rgba(99,102,241,0.08)",
    },
    {
      href: "/photo",
      IconComp: CameraIcon,
      title: "写真で学ぶ",
      desc: "フラッシュカードで写真学習",
      color: "#a855f7",
      bg: "rgba(168,85,247,0.08)",
    },
    {
      href: "/map",
      IconComp: MapIcon,
      title: "地図で学ぶ",
      desc: "世界地図で遺産の位置を確認",
      color: "#06b6d4",
      bg: "rgba(6,182,212,0.08)",
    },
    {
      href: "/review",
      IconComp: ReviewIcon,
      title: "復習する",
      desc: "苦手・間違えた遺産を復習",
      color: "#f59e42",
      bg: "rgba(245,158,66,0.08)",
    },
    {
      href: "/dashboard",
      IconComp: ChartIcon,
      title: "学習進捗",
      desc: "学習状況をダッシュボードで確認",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.08)",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight">世界遺産検定2級</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          {totalCount}件の世界遺産（日本{japanCount}件）で学習しよう
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link href="/quiz" className="btn-primary text-sm text-center flex-1 md:flex-none">
          クイズ開始
        </Link>
        <Link href="/review" className="btn-secondary text-sm text-center flex-1 md:flex-none">
          復習する
        </Link>
      </div>

      {/* Study Stats */}
      <StudyStats />

      {/* Feature Grid */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wider mb-3">学習メニュー</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="card p-4 flex items-start gap-3 group"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: f.bg, color: f.color }}
              >
                <f.IconComp size={20} />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm group-hover:text-[var(--primary)] transition-colors">{f.title}</h3>
                <p className="text-xs text-[var(--muted)] mt-0.5 hidden md:block">{f.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="text-center text-xs text-[var(--muted)] pt-4 border-t border-[var(--border)]">
        <p>データ出典: UNESCO World Heritage Centre, 文化庁, Wikipedia</p>
        <p>画像: Wikimedia Commons (CC BY-SA)</p>
      </div>
    </div>
  );
}
