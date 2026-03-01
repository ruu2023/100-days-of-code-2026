// src/index.ts
// Cloudflare Workers entry point for hono-api
// Handles: REST API (auth, kanban, tango, day058) + Cron trigger (tango auto-fill)

import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { tangoCards } from "@/db/schema";
import { getAuth, type Env } from "@/lib/auth";
import { kanbanApp } from "@/api/kanban";
import { tangoApp } from "@/api/tango";
import { day058App } from "@/api/day058";
// import { day060App } from "@/api/day060";

// -----------------------------------------------------------------------------
// Hono App
// -----------------------------------------------------------------------------

const app = new Hono<{ Bindings: Env }>().basePath("/api");

// CORS: allow requests from the Next.js frontend
// NOTE: credentials:true + origin:"*" is invalid, so always list origins explicitly.
const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "https://hono-next-app-455056438426.asia-northeast1.run.app",
];

app.use("*", async (ctx, next) => {
  const origin = ctx.req.header("origin") || "";
  const isAllowedOrigin = ALLOWED_ORIGINS.includes(origin);

  // Set CORS headers manually
  ctx.res.headers.set("Access-Control-Allow-Origin", isAllowedOrigin ? origin : ALLOWED_ORIGINS[0]);
  ctx.res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  ctx.res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  ctx.res.headers.set("Access-Control-Allow-Credentials", "true");
  ctx.res.headers.set("Access-Control-Max-Age", "600");

  // Handle preflight
  if (ctx.req.method === "OPTIONS") {
    return ctx.body(null, 204);
  }

  return next();
});

// ① GET-based OAuth initiation — must be BEFORE the wildcard /auth/* route.
// Navigating the browser directly here avoids cross-origin cookie issues.
// better-auth returns JSON { url }, so we convert it to a 302 + copy Set-Cookie.
app.get("/auth/oauth/:provider", async (ctx) => {
  const provider = ctx.req.param("provider");
  const callbackURL = ctx.req.query("callbackURL") || "/";
  const auth = getAuth(ctx.env);

  const workerBase = ctx.env.BETTER_AUTH_URL ?? "http://localhost:8787";
  const syntheticReq = new Request(`${workerBase}/api/auth/sign-in/social`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, callbackURL }),
  });

  const authRes = await auth.handler(syntheticReq);

  // If already a redirect (302), pass through as-is
  if (authRes.status === 302 || authRes.status === 301) {
    return authRes;
  }

  // better-auth returns 200 JSON { url: "https://accounts.google.com/..." }
  const contentType = authRes.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const data = await authRes.json<{ url?: string; redirect?: string }>();
    const googleUrl = data.url ?? data.redirect;
    if (googleUrl) {
      const redirectRes = new Response(null, {
        status: 302,
        headers: { Location: googleUrl },
      });
      authRes.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          redirectRes.headers.append("set-cookie", value);
        }
      });
      return redirectRes;
    }
  }

  return authRes;
});

// ② Explicit callback route with logging (diagnose state validation)
app.on(["GET", "POST"], "/auth/callback/:provider", async (ctx) => {
  const cookies = ctx.req.header("cookie") || "(no cookies)";
  console.log("[oauth-callback] cookies:", cookies.substring(0, 300));
  const auth = getAuth(ctx.env);
  const response = await auth.handler(ctx.req.raw);
  const status = response.status;
  const location = response.headers.get("location");
  console.log("[oauth-callback] status:", status, "loc:", location);

  // When auth succeeds, better-auth returns 302 → Next.js dashboard.
  // But the session cookie is scoped to Workers domain, not Next.js domain.
  // Redirect through a Next.js "session-bridge" so Next.js can set the cookie
  // on its own domain. The middleware can then forward it to Workers for auth checks.
  if (status === 302 && location) {
    let sessionTokenValue: string | null = null;
    let secureSessionTokenValue: string | null = null;

    response.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        if (value.includes("better-auth.session_token=")) {
          const match = value.match(/better-auth\.session_token=([^;]+)/);
          if (match) sessionTokenValue = match[1];
        }
        if (value.includes("__Secure-better-auth.session_token=")) {
          const match = value.match(/__Secure-better-auth\.session_token=([^;]+)/);
          if (match) secureSessionTokenValue = match[1];
        }
      }
    });

    // Use the __Secure- prefixed token if available (more secure)
    const tokenToUse = secureSessionTokenValue || sessionTokenValue;

    if (tokenToUse) {
      const targetUrl = new URL(location);
      const bridgeUrl =
        `${targetUrl.origin}/api/auth/session` +
        `?token=${encodeURIComponent(tokenToUse)}` +
        `&redirect=${encodeURIComponent(targetUrl.pathname + targetUrl.search)}`;

      const bridgeRes = new Response(null, {
        status: 302,
        headers: { Location: bridgeUrl },
      });
      // Only set the secure version of session token with SameSite=None for cross-origin
      if (secureSessionTokenValue) {
        bridgeRes.headers.append(
          "Set-Cookie",
          `__Secure-better-auth.session_token=${secureSessionTokenValue}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=604800`
        );
      }
      return bridgeRes;
    }
  }

  return response;
});

// ③ All other auth endpoints — wildcard catch-all (must be last)
app.on(["POST", "GET"], "/auth/*", async (ctx) => {
  const auth = getAuth(ctx.env);
  return auth.handler(ctx.req.raw);
});

// Current user endpoint
app.get("/me", async (ctx) => {
  const auth = getAuth(ctx.env);
  const session = await auth.api.getSession({ headers: ctx.req.raw.headers });
  return ctx.json(session?.user ?? { message: "Not logged in" });
});

// Sub-routes
app.route("/kanban", kanbanApp);
app.route("/tango", tangoApp);
app.route("/day058", day058App);
// app.route("/day060", day060App);

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
