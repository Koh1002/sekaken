"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { HomeIcon, ListIcon, MapIcon, CameraIcon, QuizIcon, ReviewIcon, ChartIcon } from "./NavIcons";
import { ReactNode } from "react";

interface NavItem {
  href: string;
  label: string;
  icon: (props: { size?: number; active?: boolean }) => ReactNode;
}

const navItems: NavItem[] = [
  { href: "/", label: "ホーム", icon: HomeIcon },
  { href: "/heritage", label: "一覧", icon: ListIcon },
  { href: "/map", label: "地図", icon: MapIcon },
  { href: "/photo", label: "写真", icon: CameraIcon },
  { href: "/quiz", label: "クイズ", icon: QuizIcon },
  { href: "/review", label: "復習", icon: ReviewIcon },
  { href: "/dashboard", label: "進捗", icon: ChartIcon },
];

export function Navigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-[220px] z-50 hidden md:flex flex-col border-r border-[var(--border)]" style={{ background: "var(--sidebar-bg)" }}>
        {/* Logo */}
        <div className="px-5 h-16 flex items-center gap-2.5 border-b border-[var(--border)]">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)" }}>
            <MapIcon size={18} />
          </div>
          <span className="font-bold text-base tracking-tight" style={{ color: "var(--primary)" }}>セカケン</span>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "font-semibold"
                    : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
                }`}
                style={isActive ? { background: "var(--sidebar-active)", color: "var(--primary)" } : {}}
              >
                <item.icon size={20} active={isActive} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 py-4 border-t border-[var(--border)]">
          <Link
            href="/auth"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
              user ? "font-medium" : "text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--background)]"
            }`}
            style={user ? { color: "var(--primary)" } : {}}
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: user ? "rgba(79,125,243,0.12)" : "var(--background)" }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span>{user ? "マイページ" : "ログイン"}</span>
          </Link>
        </div>
      </aside>

      {/* Mobile header */}
      <nav className="sticky top-0 z-50 border-b border-[var(--border)] md:hidden" style={{ background: "var(--sidebar-bg)" }}>
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="font-bold text-base flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "var(--primary)" }}>
              <MapIcon size={16} />
            </div>
            <span style={{ color: "var(--primary)" }}>セカケン</span>
          </Link>
          <Link
            href="/auth"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: user ? "var(--primary)" : "var(--muted)", background: user ? "rgba(79,125,243,0.08)" : "transparent" }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] md:hidden" style={{ background: "var(--sidebar-bg)" }}>
        <div className="flex justify-around items-center h-16 px-1 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-colors"
                style={{ color: isActive ? "var(--primary)" : "var(--muted)" }}
              >
                <item.icon size={22} active={isActive} />
                <span className={`text-[10px] mt-1 leading-none ${isActive ? "font-semibold" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
