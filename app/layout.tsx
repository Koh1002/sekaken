import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";
import { AuthProvider } from "@/lib/auth-context";

export const metadata: Metadata = {
  title: "世界遺産検定2級 学習アプリ",
  description: "世界遺産検定2級の学習をサポートするWebアプリケーション",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-[var(--background)]">
        <AuthProvider>
          <Navigation />
          {/* Desktop: offset by sidebar width. Mobile: normal flow */}
          <main className="md:ml-[220px] px-4 md:px-8 py-5 md:py-8 pb-24 md:pb-8 max-w-6xl">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
