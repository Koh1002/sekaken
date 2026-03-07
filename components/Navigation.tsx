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
      {/* Desktop header */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-[var(--border)] hidden sm:block shadow-sm" style={{ background: "rgba(255,255,255,0.92)" }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="font-bold text-lg flex items-center gap-2">
              <MapIcon size={24} active />
              <span style={{ color: "var(--primary)" }}>セカケン</span>
            </Link>
            <div className="flex gap-0.5 items-center">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
                      isActive
                        ? "font-semibold"
                        : "text-[var(--muted)] hover:text-[var(--foreground)]"
                    }`}
                    style={isActive ? { background: "rgba(0,184,148,0.12)", color: "var(--primary)" } : {}}
                  >
                    <item.icon size={18} active={isActive} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <Link
                href="/auth"
                className={`ml-2 flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm whitespace-nowrap transition-all border ${
                  user ? "border-[var(--primary)]" : "border-[var(--border)] text-[var(--muted)]"
                }`}
                style={user ? { background: "rgba(0,184,148,0.1)", color: "var(--primary)" } : {}}
              >
                <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>{user ? "マイページ" : "ログイン"}</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile header */}
      <nav className="sticky top-0 z-50 backdrop-blur-md border-b border-[var(--border)] sm:hidden shadow-sm" style={{ background: "rgba(255,255,255,0.92)" }}>
        <div className="flex items-center justify-between h-12 px-3">
          <Link href="/" className="font-bold text-base flex items-center gap-1.5">
            <MapIcon size={22} active />
            <span style={{ color: "var(--primary)" }}>セカケン</span>
          </Link>
          <Link
            href="/auth"
            className="p-2 rounded-xl text-sm"
            style={{ color: user ? "var(--primary)" : "var(--muted)" }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-md border-t border-[var(--border)] sm:hidden" style={{ background: "rgba(255,255,255,0.95)" }}>
        <div className="flex justify-around items-center h-14 px-1 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors"
                style={{ color: isActive ? "var(--primary)" : "var(--muted)" }}
              >
                <item.icon size={20} active={isActive} />
                <span className={`text-[10px] mt-0.5 leading-none ${isActive ? "font-semibold" : ""}`}>
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
