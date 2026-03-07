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
          <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-20 sm:pb-6">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
