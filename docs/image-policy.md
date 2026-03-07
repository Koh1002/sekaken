# 画像ポリシー

## 調査日: 2026-03-07

## 使用画像の方針

### 1. Wikimedia Commons (推奨)
- ライセンス: CC BY-SA 3.0 / 4.0 または Public Domain
- 使用条件:
  - 著作者名の表示 (Attribution)
  - ライセンスの明記
  - ライセンスURLへのリンク
  - Wikimedia Commonsページへのリンク
- API: MediaWiki API で検索・メタデータ取得可能

### 2. 表示形式
- 各画像の下に以下を表示:
  - 著作者名
  - ライセンス種別
  - 出典リンク

### 3. フォールバック
- 画像が取得できない遺産にはプレースホルダーを表示
- カテゴリに応じたデフォルト画像(文化遺産/自然遺産/複合遺産)

### 4. 画像データ構造

```typescript
interface ImageAsset {
  url: string;           // Wikimedia Commons の画像URL
  attribution: string;   // 著作者名
  license: string;       // CC BY-SA 4.0 等
  license_url: string;   // ライセンスURL
  source_url: string;    // Wikimedia Commons ページURL
}
```

### 5. 技術的実装
- next/image の remotePatterns で Wikimedia ドメインを許可
- 画像URLは upload.wikimedia.org 形式
- サムネイルはWikimedia のリサイズパラメータを使用

### 6. 出典

- [Wikimedia Commons Licensing](https://commons.wikimedia.org/wiki/Commons:Licensing)
- [Simple Media Reuse Guide](https://commons.wikimedia.org/wiki/Commons:Simple_media_reuse_guide)
- [Wikimedia Commons API](https://commons.wikimedia.org/wiki/Commons:API)
