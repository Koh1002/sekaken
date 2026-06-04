# アーキテクチャ設計

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) |
| 言語 | TypeScript |
| DB / Auth | Supabase (PostgreSQL) — `@supabase/supabase-js` で直接アクセス |
| スタイリング | Tailwind CSS |
| 地図 | Leaflet + react-leaflet (dynamic import) |
| 学習データ | localStorage (未ログイン) + Supabase同期 (ログイン時) |
| デプロイ | Vercel |

> 初期構想ではPrisma + SQLite/PostgreSQLを採用予定だったが、現在はSupabase(supabase-js)直接アクセスに統一。Prismaは使用していない。

## データフロー

```
[data/*.ts] → [scripts/generate-sql.ts] → [supabase-seed.sql] → [Supabase: heritages]
                                                                        ↓
[ブラウザ] ←→ [Next.js App Router / API Routes] ←→ [supabase-js] ←→ [Supabase]
     ↑                                                                  ↑
[localStorage] ←─ 学習データ(主) ─────── 同期(ログイン時) ──→ [Supabase: study_records]
```

## 学習状態管理

個人学習ツールのため、ログインは任意:
- 学習状態は localStorage に保存(未ログインでも全機能利用可)
- ログイン時は `study_records` テーブルにも同期しデバイス間で引き継ぎ
- heritages の取得用 API Routes は読み取り専用 (GET)
- 復習スコア計算はクライアントサイド

## ページ構成

| パス | 機能 |
|---|---|
| / | トップページ |
| /heritage | 遺産一覧 |
| /heritage/[id] | 遺産詳細 |
| /map | 地図で学ぶ |
| /photo | 写真学習 |
| /quiz | クイズ |
| /review | 復習 |
| /dashboard | ダッシュボード |
| /auth | ログイン / アカウント作成 (任意) |

## API Routes

| パス | メソッド | 機能 |
|---|---|---|
| /api/heritages | GET | 遺産一覧取得 (category/region/search/importance フィルタ) |
| /api/heritages/[id] | GET | 遺産詳細取得 |
| /api/heritages/random | GET | ランダム取得 |
| /api/quiz | GET | クイズ問題生成 (type/count/region/category/importance/ids) |

> クイズ生成APIと一覧APIは region(全6地域) / category / importance のフィルタ条件を共通化しており、クイズ設定画面でも同じ絞り込みが可能。

## 復習スコア計算

```
review_score =
  wrong_count * 3
  + days_since_last_study * 1.5
  + weak_flag * 5
  + manual_review_flag * 4
  - correct_streak * 2
```

localStorage に保持する学習データ:
```typescript
interface StudyRecord {
  heritageId: number;
  wrongCount: number;
  correctCount: number;
  correctStreak: number;
  lastStudiedAt: string;
  isWeak: boolean;
  isManualReview: boolean;
  isLearned: boolean;
}
```
