# アーキテクチャ設計

## 技術スタック

| レイヤー | 技術 |
|---|---|
| フレームワーク | Next.js 15 (App Router) |
| 言語 | TypeScript |
| ORM | Prisma |
| DB (本番) | PostgreSQL (Vercel Postgres / Neon) |
| DB (開発) | SQLite |
| スタイリング | Tailwind CSS |
| 地図 | Leaflet + react-leaflet (dynamic import) |
| 状態管理 | localStorage (認証なし個人学習用) |
| デプロイ | Vercel |

## データフロー

```
[データ収集スクリプト] → [data/*.json] → [seed] → [DB]
                                                      ↓
[ブラウザ] ←→ [Next.js App Router] ←→ [Prisma] ←→ [DB]
                                                      ↑
[localStorage] ←→ [学習状態管理] ←→ [API Routes] ←→ [DB]
```

## 学習状態管理

認証なしの個人学習ツールのため:
- 学習状態は localStorage に保存
- API Routes はデータ取得のみ (GET)
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

## API Routes

| パス | メソッド | 機能 |
|---|---|---|
| /api/heritages | GET | 遺産一覧取得 |
| /api/heritages/[id] | GET | 遺産詳細取得 |
| /api/heritages/random | GET | ランダム取得 |
| /api/quiz/generate | GET | クイズ問題生成 |

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
