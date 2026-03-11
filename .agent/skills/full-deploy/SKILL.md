---
name: full-deploy
description: Full Stack Deployment skill for deploying Hono API, Next.js frontend, and Rails/Go APIs to Hetzner VPS.
---

# Skill: Monorepo Deployment (Hono & Next.js + VPS API)

## Goal
バックエンド（Hono/Cloudflare）を先にデプロイし、その完了を待ってからフロントエンド（Next.js/Cloud Run）をデプロイする。
また、RailsおよびGoのエンドポイントをVPSへデプロイする。

## Instructions
When executing this skill, follow these steps sequentially:

1. **Deploy Hono (Cloudflare)**:
   - Change directory to `hono-api`.
   - Run `npm run deploy` to complete the deployment to Cloudflare Workers/Pages.

2. **Deploy Next.js (Google Cloud Run)**:
   - Change directory to `hono-next`.
   - Run `gcloud run deploy hono-next-app --source . --region asia-northeast1`.

3. **Deploy Ruby (Hetzner VPS)**:
   - Change directory to `rails8`.
   - Run `source .env && kamal deploy`.

4. **Deploy Go API (Hetzner VPS)**:
   - Change directory to `go-api`.
   - Run `source .env && kamal deploy`.

## Error Handling
- If the `hono-api` deployment fails, **STOP** immediately. Do NOT proceed to deploy `hono-next` as it depends on the API. Report the error to the user and halt execution.
- If any other step fails, report the error before attempting to continue or halt based on the severity.
