# 世界遺産検定2級 学習アプリ (sekaken)

世界遺産検定2級の学習に特化したWebアプリケーションです。世界遺産の一覧・地図・写真・クイズ・復習機能を備え、効率的な試験対策をサポートします。

## 主な機能

| 機能 | 説明 |
|------|------|
| 一覧 | 検索・フィルタ・カード/テーブル切替・苦手/復習登録 |
| 地図 | Leaflet地図上にマーカー表示、カテゴリ・地域フィルタ |
| 詳細 | 遺産情報・写真・埋込み地図・出典・暗記ポイント |
| 写真学習 | フラッシュカード形式で写真から遺産名を覚える |
| クイズ | 6タイプ(ヒント→遺産名, 遺産→国, 写真→遺産名, 説明→遺産名, 地図→遺産, ○×) |
| 復習 | 優先度付き復習リスト、高優先度フィルタ、間違えた問題だけ再挑戦 |
| ダッシュボード | 学習進捗サマリー、正答率、苦手一覧、今日のおすすめ復習 |

## データ

- 合計181件の世界遺産データ
  - 日本: 26件 (全件網羅)
  - ヨーロッパ・北米: 54件
  - アジア・太平洋: 40件
  - ラテンアメリカ: 24件
  - アフリカ: 17件
  - アラブ諸国: 20件
- 検定2級の重要遺産を網羅(第1号遺産12件、負の遺産、抹消遺産、複合遺産等)
- 各遺産に暗記ポイント・出題重要度(1-5)を付与

## 復習ロジック

```
review_score = wrong_count * 3 + days_since_last_study * 1.5 + weak_flag * 5 + manual_review_flag * 4 - correct_streak * 2
```

学習データはlocalStorageに永続化。復習スコアが高いものから優先的に表示。

## 技術スタック

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **DB**: Prisma + SQLite (ローカル) / PostgreSQL (本番)
- **地図**: Leaflet + react-leaflet
- **CSS**: Tailwind CSS 4
- **デプロイ**: Vercel

## セットアップ

```bash
# 依存インストール
npm install

# DB初期化
npx prisma migrate dev

# データ投入
npx tsx scripts/seed-db.ts

# 開発サーバー起動
npm run dev
```

## Vercelデプロイ

詳細は [docs/deploy-vercel.md](docs/deploy-vercel.md) を参照。

```bash
# 環境変数
DATABASE_URL=postgresql://... # Vercel Postgres等

# ビルド
npm run build
```

## ディレクトリ構成

```
app/                    # Next.js App Router
  page.tsx              # トップページ
  heritage/             # 一覧・詳細
  map/                  # 地図
  photo/                # 写真学習
  quiz/                 # クイズ
  review/               # 復習
  dashboard/            # ダッシュボード
  api/                  # API Routes
components/             # UIコンポーネント
data/                   # 世界遺産データ(TypeScript)
lib/                    # ユーティリティ
prisma/                 # Prisma schema & migrations
scripts/                # シードスクリプト
docs/                   # ドキュメント
  research.md           # リサーチ結果
  data-sourcing.md      # データソース方針
  image-policy.md       # 画像ポリシー
  deploy-vercel.md      # デプロイ手順
  architecture.md       # アーキテクチャ
  progress.md           # 実装進捗
  error-log.md          # エラーログ
```

## ドキュメント

- [docs/research.md](docs/research.md) - データソース調査結果
- [docs/data-sourcing.md](docs/data-sourcing.md) - データ取得方針
- [docs/image-policy.md](docs/image-policy.md) - 画像ライセンス方針
- [docs/deploy-vercel.md](docs/deploy-vercel.md) - Vercelデプロイ手順
- [docs/architecture.md](docs/architecture.md) - アーキテクチャ設計
- [docs/progress.md](docs/progress.md) - 実装進捗ログ
- [docs/error-log.md](docs/error-log.md) - エラー対応ログ

## 出典

世界遺産データは以下のソースに基づいて作成:
- UNESCO World Heritage Centre (https://whc.unesco.org/)
- 各遺産のunescoUrlフィールドに個別ページURLを記録
