# データソーシング戦略

## 調査日: 2026-03-07

## 方針

UNESCO APIが直接利用不可(403)のため、以下の複合戦略を採用する。

## データ取得手順

### Step 1: 日本の遺産 (全26件)
- 文化庁公式サイト + Wikipedia日本語版から手動で正確なデータを作成
- 全フィールドを網羅
- 検定での重要度: 最高 (全件出題対象)

### Step 2: 海外重要遺産 (約280件)
- 世界遺産検定2級テキストに準拠した重要遺産をWebリサーチで収集
- UNESCO WHC の個別ページURLを出典として保持
- Wikipedia APIで日本語名・概要を補完

### Step 3: 正規化
- scripts/normalize-data.ts で全データを統一フォーマットに変換
- data/heritages.normalized.json に出力

### Step 4: バリデーション
- scripts/validate-data.ts で欠損チェック
- validation_report.md に結果を出力

## データフィールド

| フィールド | 必須 | ソース |
|---|---|---|
| id | ○ | UNESCO WHC ID |
| name_ja | ○ | 文化庁/Wikipedia |
| name_en | ○ | UNESCO |
| country_ja | ○ | 手動マッピング |
| country_en | ○ | UNESCO |
| region | ○ | UNESCO地域分類 |
| category | ○ | Cultural/Natural/Mixed |
| inscription_year | ○ | UNESCO |
| latitude | ○ | UNESCO |
| longitude | ○ | UNESCO |
| short_description_ja | △ | Wikipedia/手動 |
| memory_tip_ja | △ | 学習用に手動作成 |
| tags | △ | テーマ分類 |
| unesco_criteria | ○ | UNESCO |
| official_url | △ | 公式サイト |
| unesco_url | ○ | WHC URL |
| source_urls | ○ | 参照元URL |
| image_url | △ | Wikimedia Commons |
| image_attribution | △ | CC BY-SA 出典 |
| exam_importance | ○ | 検定重要度(1-5) |

## 再実行方法

> 注: 下記はリサーチ当時の想定フロー。現行のデータ投入は `npm run seed`(scripts/generate-sql.ts) で supabase-seed.sql を生成し、Supabase SQL Editorで実行する方式。`scripts/seed-db.ts`(Prisma)は廃止済み。

```bash
npx tsx scripts/validate-data.ts            # バリデーション
npm run seed                                # supabase-seed.sql を生成
# → 生成された supabase-seed.sql を Supabase SQL Editor で実行
```

## 出典管理

- 各遺産の `source_urls` に参照元URLを配列で保持
- 画像は `image_attribution` にライセンス・著作者を記録
- docs/image-policy.md にライセンス方針を明記
