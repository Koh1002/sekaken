# Vercel デプロイ手順

## 調査日: 2026-03-07

## 前提

- Next.js 15 (App Router)
- Prisma ORM
- PostgreSQL (Vercel Postgres or Neon)

## 環境変数

| 変数名 | 説明 | 例 |
|---|---|---|
| DATABASE_URL | PostgreSQL接続文字列 | postgresql://user:pass@host:5432/db |
| DIRECT_URL | 直接接続URL (マイグレーション用) | postgresql://user:pass@host:5432/db |

## package.json 設定

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy && next build",
    "seed": "ts-node scripts/seed-db.ts"
  }
}
```

## Prisma 設定

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

## デプロイ手順

1. Vercel にプロジェクトをインポート
2. Vercel Postgres (or Neon) をプロビジョニング
3. 環境変数を設定
4. Build Command: `npm run vercel-build`
5. デプロイ

## 注意事項

### 接続プーリング
- Vercelサーバーレス環境ではPrisma Clientのsingleton pattern必須
- connection_limit パラメータを設定

### キャッシュ問題
- Vercelのキャッシュにより古いPrisma Clientが使われる可能性
- `postinstall: "prisma generate"` で回避

### 開発環境
- ローカルではSQLiteを使用可能(prisma schemaで切替)
- 本番はPostgreSQL前提

## 出典

- [Prisma + Next.js on Vercel](https://www.prisma.io/docs/guides/frameworks/nextjs)
- [Vercel + Prisma Starter](https://vercel.com/templates/next.js/postgres-prisma)
- [Deploy to Vercel](https://www.prisma.io/docs/guides/deployment/serverless/deploy-to-vercel)
