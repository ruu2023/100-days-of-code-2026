import { Hono } from "hono";
import { getAuth } from "@/lib/auth";
import type { Env } from "@/lib/auth";
import { kanbanApp } from "@/api/kanban";
import { tangoApp } from "@/api/tango";
import { day058App } from "@/api/day058";
import { day060App } from "@/api/day060";

const apiApp = new Hono<{ Bindings: Env }>();

// ① GET-based OAuth initiation — must be BEFORE the wildcard /auth/* route.
apiApp.get("/auth/oauth/:provider", async (ctx) => {
  const provider = ctx.req.param("provider");
  const callbackURL = ctx.req.query("callbackURL") || "/";
  const auth = getAuth(ctx.env);

  // Use the incoming request's origin if we are behind a proxy,
  // or fallback to BETTER_AUTH_URL for local testing.
  const host = ctx.req.header("x-forwarded-host") || ctx.req.header("host");
  const protocol = ctx.req.header("x-forwarded-proto") || "http";
  const workerBase = host ? `${protocol}://${host}` : (ctx.env.BETTER_AUTH_URL ?? "http://localhost:8787");

  const syntheticReq = new Request(`${workerBase}/api/auth/sign-in/social`, {
    method: "POST",
    headers: { 
      ...ctx.req.raw.headers, // forward original X-Forwarded-* headers too
      "Content-Type": "application/json" 
    },
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
apiApp.on(["GET", "POST"], "/auth/callback/:provider", async (ctx) => {
  const cookies = ctx.req.header("cookie") || "(no cookies)";
  console.log("[oauth-callback] cookies:", cookies.substring(0, 300));
  const auth = getAuth(ctx.env);
  const response = await auth.handler(ctx.req.raw);
  const status = response.status;
  const location = response.headers.get("location");
  console.log("[oauth-callback] status:", status, "loc:", location);

  // When auth succeeds, better-auth returns 302 → Next.js dashboard.
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
      
      if (secureSessionTokenValue) {
        bridgeRes.headers.append(
          "Set-Cookie",
          `__Secure-better-auth.session_token=${secureSessionTokenValue}; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=604800`
        );
      } else if (sessionTokenValue) {
        bridgeRes.headers.append(
          "Set-Cookie",
          `better-auth.session_token=${sessionTokenValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`
        );
      }
      return bridgeRes;
    }
  }

  return response;
});

// ③ All other auth endpoints — wildcard catch-all (must be last)
apiApp.on(["POST", "GET"], "/auth/*", async (ctx) => {
  const auth = getAuth(ctx.env);
  return auth.handler(ctx.req.raw);
});

// Current user endpoint
apiApp.get("/me", async (ctx) => {
  const auth = getAuth(ctx.env);
  
  let urlStr = ctx.req.raw.url;
  const isSecure = ctx.req.header("x-forwarded-proto") === "https" || urlStr.startsWith("https:");
  
  const workerBase = ctx.env.BETTER_AUTH_URL ?? "http://localhost:8787";
  const sessionUrl = new URL("/api/auth/get-session", workerBase);
  
  if (isSecure && sessionUrl.protocol === "http:") {
    sessionUrl.protocol = "https:";
  }

  const syntheticReq = new Request(sessionUrl.toString(), {
    method: "GET",
    headers: ctx.req.raw.headers,
  });

  const res = await auth.handler(syntheticReq);
  
  if (res.ok) {
    const data = await res.json<{ session: any, user: any }>();
    return ctx.json(data?.user ?? { message: "Not logged in" });
  }

  return ctx.json({ message: "Not logged in" });
});

// Sub-routes
apiApp.route("/kanban", kanbanApp);
apiApp.route("/tango", tangoApp);
apiApp.route("/day058", day058App);
apiApp.route("/day060", day060App);

export { apiApp };
