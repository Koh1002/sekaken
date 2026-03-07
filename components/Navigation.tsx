"use client";

import Link from "next/link";
import Image from "next/image";
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
      {/* Desktop Sidebar - dark navy */}
      <aside className="fixed left-0 top-0 bottom-0 w-[220px] z-50 hidden md:flex flex-col" style={{ background: "var(--sidebar-bg)" }}>
        {/* Logo */}
        <div className="px-4 h-[72px] flex items-center gap-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <Image src="/logo.svg" alt="セカケン" width={40} height={40} className="shrink-0" />
          <div className="flex flex-col">
            <span className="font-bold text-sm" style={{ color: "var(--accent)" }}>セカケン</span>
            <span className="text-[10px]" style={{ color: "var(--sidebar-text)", opacity: 0.7 }}>世界遺産検定2級</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
                style={
                  isActive
                    ? { background: "var(--sidebar-active)", color: "var(--sidebar-active-text)", fontWeight: 600 }
                    : { color: "var(--sidebar-text)" }
                }
              >
                <item.icon size={20} active={isActive} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="px-3 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <Link
            href="/auth"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all"
            style={
              user
                ? { color: "var(--sidebar-active-text)" }
                : { color: "var(--sidebar-text)" }
            }
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ background: user ? "rgba(196,163,90,0.15)" : "rgba(255,255,255,0.06)" }}>
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <span>{user ? "マイページ" : "ログイン"}</span>
          </Link>
        </div>
      </aside>

      {/* Mobile header - dark navy */}
      <nav className="sticky top-0 z-50 md:hidden" style={{ background: "var(--sidebar-bg)" }}>
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/" className="font-bold text-sm flex items-center gap-2.5">
            <Image src="/logo.svg" alt="セカケン" width={32} height={32} />
            <span style={{ color: "var(--accent)" }}>セカケン</span>
          </Link>
          <Link
            href="/auth"
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors"
            style={{ color: user ? "var(--accent)" : "var(--sidebar-text)", background: user ? "rgba(196,163,90,0.12)" : "transparent" }}
          >
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>
      </nav>

      {/* Mobile bottom tab bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden" style={{ background: "var(--sidebar-bg)", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex justify-around items-center h-16 px-1 pb-[env(safe-area-inset-bottom)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center flex-1 py-1.5 rounded-xl transition-colors"
                style={{ color: isActive ? "var(--sidebar-active-text)" : "var(--sidebar-text)" }}
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
