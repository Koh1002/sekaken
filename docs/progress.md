# 実装進捗

## Phase 1: リサーチ ✅ 完了
- 実施内容: データソース調査、画像ポリシー策定、Vercelデプロイ要件調査、検定出題範囲調査
- 作成ファイル: docs/research.md, docs/data-sourcing.md, docs/image-policy.md, docs/deploy-vercel.md
- 確認結果: UNESCO API直接利用不可→手動データ+Webリサーチ戦略に決定

## Phase 2: アーキテクチャ設計 ✅ 完了
- 実施内容: ディレクトリ構成設計、Prisma schema作成、データフロー整理
- 作成ファイル: docs/architecture.md, prisma/schema.prisma
- 確認結果: Next.js 15 + Prisma + SQLite(ローカル) / Postgres(本番) 構成

## Phase 3: データ収集パイプライン ✅ 完了
- 実施内容: UNESCO公式サイトをリサーチし、日本全26件+海外155件=合計181件のデータを収集・整備
- 作成ファイル:
  - data/japan-heritages.ts (日本26件)
  - data/world-heritages-europe.ts (ヨーロッパ・北米54件)
  - data/world-heritages-asia.ts (アジア太平洋40件)
  - data/world-heritages-americas.ts (ラテンアメリカ24件)
  - data/world-heritages-africa.ts (アフリカ17件)
  - data/world-heritages-arab.ts (アラブ諸国20件)
  - data/index.ts (統合エクスポート)
- 確認結果: 全データにid, nameJa, nameEn, country, region, category, inscriptionYear, lat/lon, shortDesc, memoryTip, tags, criteria, urls, examImportance含む
- 日本の全世界遺産26件を網羅（文化20、自然5、複合1）
- 検定2級重要遺産（第1号遺産、負の遺産、抹消遺産、複合遺産等）をカバー

## Phase 4: DB/Prisma/seed ✅ 完了
- 実施内容: Next.js初期化、Prisma設定、migration、seedスクリプト実装
- 作成ファイル: scripts/seed-db.ts, prisma/schema.prisma
- 確認結果: 181件全件DBに投入成功

## Phase 5: 一覧/地図/詳細 ✅ 完了
- 実施内容: 一覧ページ(検索/フィルタ/カード・テーブル切替)、地図ページ(Leafletマーカー/フィルタ/ポップアップ)、詳細ページ(遺産情報/写真/地図/出典/クイズ遷移)
- 作成ファイル: app/heritage/page.tsx, app/map/page.tsx, app/heritage/[id]/page.tsx, components/MapView.tsx, components/HeritageDetail.tsx, components/HeritageCard.tsx, components/DetailMap.tsx
- 確認結果: 全画面遷移正常動作

## Phase 6: 写真学習 ✅ 完了
- 実施内容: フラッシュカードUI、写真→復習追加機能
- 作成ファイル: app/photo/page.tsx
- 確認結果: 写真学習画面動作確認

## Phase 7: クイズ ✅ 完了
- 実施内容: 6種の出題タイプ(ヒント→遺産名, 遺産→国, 写真→遺産名, 説明→遺産名, 地図→遺産, ○×), 設定画面, 結果画面, 間違えた問題だけ復習
- 作成ファイル: app/quiz/page.tsx, app/api/quiz/route.ts
- 確認結果: 全出題タイプ動作、正答率・誤答一覧・間違えた問題だけ復習ボタン実装

## Phase 8: 復習 ✅ 完了
- 実施内容: 復習スコア計算(仕様通り)、復習リスト、フィルタ(すべて/高優先度/苦手/復習登録/間違えた)、全部復習クイズ、写真で復習
- 作成ファイル: app/review/page.tsx, lib/review-score.ts, lib/study-storage.ts
- 復習スコア式: wrong_count*3 + days_since_last*1.5 + weak*5 + manual*4 - streak*2

## Phase 9: ダッシュボード ✅ 完了
- 実施内容: 総学習数、学習済み、苦手、復習対象、正答率、最近間違えた遺産、今日のおすすめ復習
- 作成ファイル: app/dashboard/page.tsx

## Phase 10: Vercel対応 ✅ 完了
- 実施内容: env整理、build確認、デプロイ手順整備
- 作成ファイル: docs/deploy-vercel.md
- 確認結果: `next build` 成功

## Phase 11: README/docs ✅ 完了
- 実施内容: README、各docsファイル整備
- 作成ファイル: README.md, docs/*

## Phase 12: 総合検証と修復 ✅ 完了
- build: ✅ 成功
- typecheck: ✅ 成功 (tsc --noEmit エラーなし)
- seed: ✅ 181件投入成功
- 全ページ構成:
  - / (トップ): 学習開始/地図/写真/クイズ/復習/ダッシュボードリンク ✅
  - /heritage (一覧): 検索/フィルタ/カード・テーブル切替/復習ボタン ✅
  - /map (地図): マーカー/フィルタ/詳細遷移/クイズ遷移 ✅
  - /heritage/[id] (詳細): 遺産情報/写真/埋込み地図/出典/復習/苦手/覚えた/クイズ ✅
  - /photo (写真学習): フラッシュカード/復習追加 ✅
  - /quiz (クイズ): 6タイプ/正答率/誤答一覧/間違えた問題復習 ✅
  - /review (復習): リスト/高優先度フィルタ/優先度表示/全部復習/写真復習 ✅
  - /dashboard (ダッシュボード): 統計/間違えた遺産/おすすめ復習 ✅
