// src/index.ts
// Cloudflare Workers entry point for hono-api
// Handles: REST API (auth, kanban, tango, day058) + Cron trigger (tango auto-fill)

import { apiApp } from "@/api/index";
import { tangoCards } from "@/db/schema";
import { type Env } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { Hono } from "hono";
import { cors } from "hono/cors";

// -----------------------------------------------------------------------------
// Hono App
// -----------------------------------------------------------------------------

const app = new Hono<{ Bindings: Env }>();

// CORS: allow requests from the Next.js frontend
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://hono-next-app-455056438426.asia-northeast1.run.app",
  "https://ruu-dev.com",
];

app.use("*", cors({
  origin: (origin) => ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
  credentials: true,
}));

// Mount API routes
app.route("/api", apiApp);

// -----------------------------------------------------------------------------
// VPS (Kamal / Rails 8) へのプロキシ設定
// -----------------------------------------------------------------------------
app.all('/vps/*', async (c) => {
  const url = new URL(c.req.url)
  
  // VPSのドメインまたはIP（Kamalで設定したもの）
  const VPS_ORIGIN = "65.108.219.151"
  
  // パスをそのままRailsに渡す（Rails側でRAILS_RELATIVE_URL_ROOT="/vps"を設定する）
  const targetPath = url.pathname + url.search
  const targetUrl = new URL(targetPath, `http://${VPS_ORIGIN}.nip.io`)

  const headers = new Headers(c.req.raw.headers)
  headers.set('Host', VPS_ORIGIN)
  headers.set('X-Forwarded-Host', url.hostname)
  headers.set('X-Forwarded-Proto', 'https')
  
  // クライアントのIPを伝える（Kamal/Rails側でのログや制限に利用）
  const clientIp = c.req.header('CF-Connecting-IP')
  if (clientIp) headers.set('X-Forwarded-For', clientIp)

  return fetch(targetUrl.toString(), {
    method: c.req.method,
    headers: headers,
    body: c.req.raw.body,
    redirect: 'manual'
  })
})

app.all('*', async (c) => {
  const url = new URL(c.req.url)
  
  // Cloud Run のオリジンURL
  const CLOUD_RUN_ORIGIN = "hono-next-app-455056438426.asia-northeast1.run.app" 
  const targetUrl = new URL(url.pathname + url.search, `https://${CLOUD_RUN_ORIGIN}`)

  // ヘッダーの移し替えと書き換え
  const headers = new Headers(c.req.raw.headers)
  
  // 重要：Cloud Runがリクエストを受け付けるために Host を書き換える
  headers.set('Host', CLOUD_RUN_ORIGIN)
  
  // 重要：Next.js(Auth.js)が本来のドメインを認識するために X-Forwarded を設定
  headers.set('X-Forwarded-Host', url.hostname) // ruu-dev.com
  headers.set('X-Forwarded-Proto', 'https')

  return fetch(targetUrl.toString(), {
    method: c.req.method,
    headers: headers,
    body: c.req.raw.body,
    redirect: 'manual' // リダイレクトはブラウザ側に任せる
  })
})

// -----------------------------------------------------------------------------
// Cron Handler: 毎時0分 — tango カード裏面を Gemini(Requesty経由) で自動補完
// -----------------------------------------------------------------------------

async function callRequesty(front: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch("https://router.requesty.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: `
以下の「単語またはフレーズ」を解説してください。

【制約ルール】
1. 単純な英単語（辞書的なもの）の場合：
   「意味・訳語」のみを簡潔に返してください。余計な解説は不要です。
2. 専門用語や概念（IT用語、慣用句など）の場合：
   その内容を日本語で140文字以内で要約して解説してください。
3. 出力フォーマット：
   解説文のみを出力してください。「はい、承知しました」などの挨拶や、単語の反復は一切不要です。

対象: "${front}"`,
          },
        ],
        max_tokens: 512,
      }),
    });

    if (!res.ok) {
      console.error(`Requesty API error: ${res.status} ${await res.text()}`);
      return null;
    }

    const data = await res.json<{
      choices: { message: { content: string } }[];
    }>();
    const content = data.choices?.[0]?.message?.content ?? null;
    return content ? content.trim().slice(0, 140) : null;
  } catch (e) {
    console.error("callRequesty error:", e);
    return null;
  }
}

// -----------------------------------------------------------------------------
// Export
// -----------------------------------------------------------------------------

export default {
  fetch: app.fetch,

  async scheduled(_controller: ScheduledController, env: Env, _ctx: ExecutionContext) {
    console.log("[cron] tango auto-fill started");
    const db = drizzle(env.hono_db);

    const emptyCards = await db
      .select()
      .from(tangoCards)
      .where(eq(tangoCards.back, ""))
      .limit(20);

    console.log(`[cron] found ${emptyCards.length} empty cards`);

    for (const card of emptyCards) {
      const answer = await callRequesty(card.front, env.REQUESTY_API_KEY);
      if (answer) {
        await db
          .update(tangoCards)
          .set({ back: answer })
          .where(eq(tangoCards.id, card.id));
        console.log(`[cron] updated card ${card.id}: "${card.front}" → "${answer}"`);
      } else {
        console.warn(`[cron] failed to get answer for card: "${card.front}"`);
      }
    }

    console.log("[cron] tango auto-fill done");
  },
} satisfies ExportedHandler<Env>;
