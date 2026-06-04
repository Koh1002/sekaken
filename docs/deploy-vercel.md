# Vercel デプロイ手順

## 前提

- Next.js 16 (App Router)
- Supabase (PostgreSQL) — DB / Auth / 学習データ同期
- データアクセスは `@supabase/supabase-js` 経由(Prisma不使用)

## 環境変数

| 変数名 | 説明 | 取得元 |
|---|---|---|
| NEXT_PUBLIC_SUPABASE_URL | SupabaseプロジェクトURL | Supabase Dashboard → Project Settings → API → Project URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | anon public キー | 同 → Project API keys → anon public |

いずれも `NEXT_PUBLIC_` 接頭辞付きでクライアントに公開される(anonキーはRLS前提で公開可)。

## Supabase 側の準備

Supabase Dashboard の SQL Editor で以下を実行:

1. `supabase-seed.sql` — `heritages` テーブル作成 + 全301件投入
   （`data/*.ts` 更新時は `npm run seed` で再生成）
2. `supabase/schema.sql` — `study_records` テーブル + RLS ポリシー

Auth はメール+パスワードを使用。Supabase Dashboard → Authentication でメール認証を有効化しておく。

## デプロイ手順

1. Vercel にプロジェクトをインポート
2. Supabase プロジェクトを用意し、上記SQLを実行
3. Vercel の環境変数に `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定
4. Build Command: `npm run build`（デフォルト）
5. デプロイ

## 注意事項

- DBアクセスはサーバーレス関数からHTTP(supabase-js)で行うため、コネクションプーリングの追加設定は不要。
- `study_records` は RLS により `auth.uid() = user_id` のレコードのみ読み書き可能。
- 未ログインユーザーの学習データはブラウザの localStorage のみに保存される。

## 出典

- [Supabase + Next.js](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [Deploy Next.js to Vercel](https://vercel.com/docs/frameworks/nextjs)
