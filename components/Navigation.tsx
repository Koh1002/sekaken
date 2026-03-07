"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/", label: "ホーム", icon: "🏠" },
  { href: "/heritage", label: "一覧", icon: "📋" },
  { href: "/map", label: "地図", icon: "🗺️" },
  { href: "/photo", label: "写真", icon: "📷" },
  { href: "/quiz", label: "クイズ", icon: "❓" },
  { href: "/review", label: "復習", icon: "🔄" },
  { href: "/dashboard", label: "進捗", icon: "📊" },
];

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {/* Desktop header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--border)] hidden sm:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="font-bold text-lg text-[var(--primary)]">
              世界遺産検定2級
            </Link>
            <div className="flex gap-1 items-center">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                    pathname === item.href
                      ? "bg-blue-100 text-[var(--primary)] font-semibold"
                      : "text-[var(--muted)] hover:bg-gray-100"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
              <Link
                href="/auth"
                className={`ml-2 flex items-center gap-1 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  pathname === "/auth"
                    ? "bg-blue-100 text-[var(--primary)] font-semibold"
                    : user
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "text-[var(--muted)] hover:bg-gray-100 border border-[var(--border)]"
                }`}
              >
                <span>{user ? "👤" : "🔑"}</span>
                <span>{user ? "マイページ" : "ログイン"}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile header */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--border)] sm:hidden">
        <div className="flex items-center justify-between h-12 px-3">
          <Link href="/" className="font-bold text-base text-[var(--primary)]">
            世界遺産検定2級
          </Link>
          <Link
            href="/auth"
            className={`p-2 rounded-lg text-sm ${
              user ? "text-green-700" : "text-[var(--muted)]"
            }`}
          >
            {user ? "👤" : "🔑"}
          </Link>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[var(--border)] sm:hidden">
        <div className="flex justify-around items-center h-14 px-1 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-1 ${
                pathname === item.href
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted)]"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="text-[10px] mt-0.5 leading-none">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
