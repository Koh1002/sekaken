import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { StudyStats } from "@/components/StudyStats";
import { HomeIcon, ListIcon, MapIcon, CameraIcon, QuizIcon, ReviewIcon, ChartIcon } from "@/components/NavIcons";

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
      gradient: "from-emerald-400 to-teal-500",
    },
    {
      href: "/heritage",
      IconComp: ListIcon,
      title: "遺産一覧",
      desc: "世界遺産を閲覧・検索",
      gradient: "from-blue-400 to-indigo-500",
    },
    {
      href: "/photo",
      IconComp: CameraIcon,
      title: "写真で学ぶ",
      desc: "フラッシュカードで写真学習",
      gradient: "from-purple-400 to-pink-500",
    },
    {
      href: "/map",
      IconComp: MapIcon,
      title: "地図で学ぶ",
      desc: "世界地図で遺産の位置を確認",
      gradient: "from-cyan-400 to-blue-500",
    },
    {
      href: "/review",
      IconComp: ReviewIcon,
      title: "復習する",
      desc: "苦手・間違えた遺産を復習",
      gradient: "from-amber-400 to-orange-500",
    },
    {
      href: "/dashboard",
      IconComp: ChartIcon,
      title: "学習進捗",
      desc: "学習状況をダッシュボードで確認",
      gradient: "from-rose-400 to-red-500",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="text-center py-8 px-4 rounded-2xl" style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-dark))" }}>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
          🌍 世界遺産検定2級
        </h1>
        <p className="text-white/80 text-sm sm:text-base">
          {totalCount}件の世界遺産（日本{japanCount}件）で学習しよう
        </p>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="card p-4 sm:p-5 flex flex-col items-start gap-2 group"
          >
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center text-white shadow-sm`}>
              <f.IconComp size={22} />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base group-hover:text-[var(--primary)] transition-colors">{f.title}</h2>
              <p className="text-xs text-[var(--muted)] mt-0.5 hidden sm:block">{f.desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Study Stats */}
      <StudyStats />

      {/* Quick Start */}
      <div className="card p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4" style={{ borderColor: "var(--primary)", borderWidth: "1px" }}>
        <div className="flex-1">
          <h2 className="font-bold text-base mb-1">今すぐ学習を始めよう</h2>
          <p className="text-sm text-[var(--muted)]">
            苦手な遺産や間違えた問題を効率的に復習しましょう
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Link href="/quiz" className="btn-primary text-center text-sm flex-1 sm:flex-none">
            クイズ開始
          </Link>
          <Link href="/review" className="text-center text-sm flex-1 sm:flex-none px-4 py-3 rounded-xl font-semibold border border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)] transition-all">
            復習する
          </Link>
        </div>
      </div>

      <div className="text-center text-xs text-[var(--muted)] py-4">
        <p>データ出典: UNESCO World Heritage Centre, 文化庁, Wikipedia</p>
        <p>画像: Wikimedia Commons (CC BY-SA)</p>
      </div>
    </div>
  );
}
