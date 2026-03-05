---
description: Full Stack Deployment
---

# Workflow: Monorepo Deployment (Hono & Next.js)

## Goal
バックエンド（Hono/Cloudflare）を先にデプロイし、その完了を待ってからフロントエンド（Next.js/Cloud Run）をデプロイする。

## Steps

0. ** tweetの更新 **:
  今回のアプリ(今日作成したアプリ)について、それぞれ以下のファイル内へ追記をお願いします。
  不明点は質問ください。

  - hono-app/src/data/posts.md

  - README.md

  - hono-app/src/app/dashboard/page.tsx

  - 追記後にhono-next/src/types/parse-x-posts.ts を実行してください。

1. **Hono (Cloudflare) のデプロイ**:
   - `hono-api` ディレクトリへ移動する。
   - `npm run deploy` を実行し、Cloudflare Workers/Pages へのデプロイを完了させる。

2. **Next.js (Google Cloud Run) のデプロイ**:
   - `hono-next` ディレクトリへ移動する。
   - `gcloud run deploy hono-next-app --source . --region asia-northeast1` を実行する。

## Error Handling
- もし `hono-api` のデプロイが失敗した場合は、依存関係があるため `hono-next` のデプロイは行わず、ユーザーにエラー内容を報告して停止する。