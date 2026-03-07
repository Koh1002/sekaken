# リサーチ結果

## 調査日: 2026-03-07

## 1. 世界遺産データの現状

- 世界遺産総数: 1,248件 (2025年7月時点)
  - 文化遺産: 972件
  - 自然遺産: 235件
  - 複合遺産: 41件
  - 登録国数: 170ヶ国
- 日本の世界遺産: 26件 (文化遺産21件 + 自然遺産5件)

## 2. データソース調査結果

### UNESCO DataHub (whc001)
- URL: https://data.unesco.org/explore/dataset/whc001/
- フォーマット: CSV/JSON (APIあり)
- 状況: APIは403で直接取得不可。CSV手動ダウンロード可能。
- フィールド: サイト名、座標、国、登録基準、登録年、カテゴリ等

### UNESCO IHP-WINS
- URL: https://ihp-wins.unesco.org/dataset/unesco-world-heritage-sites
- 最新の47thセッション反映版CSV

### UNESCO WHC 公式サイト
- URL: https://whc.unesco.org/en/list/
- XML syndication: https://whc.unesco.org/en/syndication (403)
- 各遺産の詳細ページは https://whc.unesco.org/en/list/{id} 形式

### 文化庁
- URL: https://www.bunka.go.jp/seisaku/bunkazai/shokai/sekai_isan/ichiran/
- 日本の全26件の公式リスト
- 日本語名・登録年・概要が確認可能

### Wikipedia
- 日本語名の補完に使用
- API: MediaWiki API で各遺産の概要取得可能

### Kaggle
- URL: https://www.kaggle.com/datasets/thedevastator/unesco-world-heritage-sites-dataset
- 構造化されたCSVデータ

## 3. 世界遺産検定2級の出題範囲

- 日本の全26件 (必須)
- 世界の代表的な遺産約300件
- 出題分野:
  - 基礎知識 (世界遺産条約、登録基準等)
  - 日本の遺産 (全件)
  - 世界の文化遺産 (配点35%)
  - 世界の自然遺産 (約55件)
  - 時事問題
- 合格率: 40-50%
- 問題数: 60問 (マークシート)
- 合格基準: 60%以上

### テーマ別出題
- 世界で最初の世界遺産
- 文化的景観
- 絶滅危惧種
- 危機遺産
- 登録基準ごとの代表遺産

## 4. 技術スタック調査

### Next.js 15 + App Router
- 最新安定版
- Server Components / Client Components
- Route Groups / Dynamic Routes

### Prisma + PostgreSQL
- Vercel Postgres or Neon (本番)
- SQLite (開発)
- postinstall: `prisma generate`
- vercel-build: `prisma generate && prisma migrate deploy && next build`
- Singleton pattern for connection pooling

### Vercel
- サーバーレス環境
- 環境変数: DATABASE_URL 等
- プレビュー環境対応

## 5. 出典

- [UNESCO DataHub](https://data.unesco.org/explore/dataset/whc001/)
- [UNESCO WHC](https://whc.unesco.org/en/list/)
- [文化庁 世界遺産一覧](https://www.bunka.go.jp/seisaku/bunkazai/shokai/sekai_isan/ichiran/)
- [世界遺産検定 2級概要](https://www.sekaken.jp/each_grade/ex_class2/)
- [Wikimedia Commons API](https://commons.wikimedia.org/wiki/Commons:API)
- [Prisma + Vercel ガイド](https://www.prisma.io/docs/guides/frameworks/nextjs)
