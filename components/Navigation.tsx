"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="font-bold text-lg text-[var(--primary)]">
            世界遺産検定2級
          </Link>
          <div className="flex gap-1 overflow-x-auto">
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
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
