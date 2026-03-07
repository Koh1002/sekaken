"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const { user, signIn, signUp, signOut } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  if (user) {
    return (
      <div className="max-w-md mx-auto space-y-6 py-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">👤</span>
          </div>
          <h1 className="text-xl font-bold mb-1">ログイン中</h1>
          <p className="text-sm text-[var(--muted)]">{user.email}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
          <p className="font-semibold text-green-700 mb-1">学習データはクラウドに同期中</p>
          <p className="text-green-600">
            別のデバイスからも同じアカウントでログインすれば学習記録が引き継がれます。
          </p>
        </div>

        <button
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
          className="w-full border border-red-300 text-red-600 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
        >
          ログアウト
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === "login") {
      const err = await signIn(email, password);
      if (err) {
        setError(err);
      } else {
        router.push("/");
      }
    } else {
      const err = await signUp(email, password);
      if (err) {
        setError(err);
      } else {
        setSuccess("確認メールを送信しました。メールのリンクをクリックしてください。");
      }
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 py-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">
          {mode === "login" ? "ログイン" : "アカウント作成"}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          ログインすると学習データがクラウドに保存され、
          デバイス間で同期できます
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold mb-1">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-base"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full border border-[var(--border)] rounded-lg px-3 py-2.5 text-base"
            placeholder="6文字以上"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-600">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[var(--primary)] text-white py-3 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 text-base"
        >
          {loading ? "処理中..." : mode === "login" ? "ログイン" : "アカウント作成"}
        </button>
      </form>

      <div className="text-center">
        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setSuccess(null);
          }}
          className="text-sm text-[var(--primary)] hover:underline"
        >
          {mode === "login"
            ? "アカウントをお持ちでない方はこちら"
            : "すでにアカウントをお持ちの方はこちら"}
        </button>
      </div>

      <div className="bg-gray-50 border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--muted)]">
        <p className="font-semibold text-[var(--foreground)] mb-1">ログインしなくても使えます</p>
        <p>
          ログインなしでもアプリは利用可能です。その場合、学習データはこのブラウザにのみ保存されます。
        </p>
      </div>
    </div>
  );
}
