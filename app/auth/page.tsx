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
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: "rgba(46,139,87,0.1)", color: "var(--success)" }}>
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <h1 className="text-lg font-bold mb-1">ログイン中</h1>
          <p className="text-sm text-[var(--muted)]">{user.email}</p>
        </div>

        <div className="card p-4 text-sm" style={{ borderColor: "rgba(46,139,87,0.3)" }}>
          <p className="font-semibold mb-1" style={{ color: "var(--success)" }}>学習データはクラウドに同期中</p>
          <p className="text-[var(--muted)]">
            別のデバイスからも同じアカウントでログインすれば学習記録が引き継がれます。
          </p>
        </div>

        <button
          onClick={async () => {
            await signOut();
            router.push("/");
          }}
          className="w-full py-3 rounded-xl font-semibold border transition-colors"
          style={{ borderColor: "rgba(192,57,43,0.3)", color: "var(--danger)" }}
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
        <h1 className="text-xl font-bold mb-2">
          {mode === "login" ? "ログイン" : "アカウント作成"}
        </h1>
        <p className="text-sm text-[var(--muted)]">
          ログインすると学習データがクラウドに保存され、
          デバイス間で同期できます
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">メールアドレス</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-input"
            placeholder="email@example.com"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[var(--muted)] uppercase tracking-wider mb-2">パスワード</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="form-input"
            placeholder="6文字以上"
          />
        </div>

        {error && (
          <div className="rounded-xl p-3 text-sm" style={{ background: "rgba(192,57,43,0.06)", color: "var(--danger)", border: "1px solid rgba(192,57,43,0.2)" }}>
            {error}
          </div>
        )}
        {success && (
          <div className="rounded-xl p-3 text-sm" style={{ background: "rgba(46,139,87,0.06)", color: "var(--success)", border: "1px solid rgba(46,139,87,0.2)" }}>
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-3 text-center disabled:opacity-50"
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
          className="text-sm hover:underline"
          style={{ color: "var(--primary)" }}
        >
          {mode === "login"
            ? "アカウントをお持ちでない方はこちら"
            : "すでにアカウントをお持ちの方はこちら"}
        </button>
      </div>

      <div className="card p-4 text-sm">
        <p className="font-semibold mb-1">ログインしなくても使えます</p>
        <p className="text-[var(--muted)]">
          ログインなしでもアプリは利用可能です。その場合、学習データはこのブラウザにのみ保存されます。
        </p>
      </div>
    </div>
  );
}
