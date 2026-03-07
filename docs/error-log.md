# エラーログ

## 記録フォーマット
- 発生日時
- フェーズ
- 対象ファイル
- エラー内容
- 原因
- 修正内容
- 再試行結果

---

## 2026-03-07 Phase 1: UNESCO API 403
- フェーズ: Phase 1 リサーチ
- 対象: UNESCO DataHub API, WHC Syndication
- エラー: HTTP 403 Forbidden
- 原因: UNESCO側でBot/自動アクセスをブロック
- 修正: 手動データ収集 + Webリサーチ戦略に変更
- 結果: 問題なし。データ品質は手動の方が高い。
