---
name: deploy-nextjs
description: Deploy the Next.js frontend to Google Cloud Run.
---

# Skill: Deploy Next.js Frontend

## Goal
Deploy the Next.js frontend located in the `hono-next` directory to Google Cloud Run.

## Instructions
1. Change directory to `hono-next`.
2. Run `gcloud run deploy hono-next-app --source . --region asia-northeast1`.

## Verification
- Confirm that the deployment was successful by checking the output for the Cloud Run service URL.
- Note: This deployment typically depends on the Hono API being successfully deployed first.
