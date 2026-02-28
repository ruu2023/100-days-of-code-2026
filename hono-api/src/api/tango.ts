// src/api/tango.ts
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, asc } from "drizzle-orm";
import { tangoCards } from "@/db/schema";
import { getAuth, type Env } from "@/lib/auth";

type Variables = { userId: string };

export const tangoApp = new Hono<{ Bindings: Env; Variables: Variables }>();

// ── 認証ミドルウェア ─────────────────────────────────────
tangoApp.use("*", async (ctx, next) => {
  const auth = getAuth(ctx.env);
  const session = await auth.api.getSession({ headers: ctx.req.raw.headers });
  if (!session?.user) {
    return ctx.json({ error: "Unauthorized" }, 401);
  }
  ctx.set("userId", session.user.id);
  await next();
});

// GET /api/tango/cards  →  自分のカード一覧を返す
tangoApp.get("/cards", async (ctx) => {
  const db = drizzle(ctx.env.hono_db);
  const userId = ctx.get("userId");

  const cards = await db
    .select()
    .from(tangoCards)
    .where(eq(tangoCards.userId, userId))
    .orderBy(asc(tangoCards.createdAt));

  return ctx.json({ cards });
});

// POST /api/tango/cards  →  カード作成
tangoApp.post("/cards", async (ctx) => {
  const db = drizzle(ctx.env.hono_db);
  const userId = ctx.get("userId");
  const { front, back } = await ctx.req.json<{ front: string; back: string }>();

  const id = crypto.randomUUID();
  const createdAt = new Date();
  await db.insert(tangoCards).values({ id, userId, front, back, createdAt });

  return ctx.json({ id, userId, front, back, createdAt });
});

// PATCH /api/tango/cards/:id  →  カード編集
tangoApp.patch("/cards/:id", async (ctx) => {
  const db = drizzle(ctx.env.hono_db);
  const userId = ctx.get("userId");
  const cardId = ctx.req.param("id");
  const body = await ctx.req.json<{ front?: string; back?: string }>();

  await db
    .update(tangoCards)
    .set(body)
    .where(and(eq(tangoCards.id, cardId), eq(tangoCards.userId, userId)));

  return ctx.json({ ok: true });
});

// DELETE /api/tango/cards/:id  →  カード削除
tangoApp.delete("/cards/:id", async (ctx) => {
  const db = drizzle(ctx.env.hono_db);
  const userId = ctx.get("userId");
  const cardId = ctx.req.param("id");

  await db
    .delete(tangoCards)
    .where(and(eq(tangoCards.id, cardId), eq(tangoCards.userId, userId)));

  return ctx.json({ ok: true });
});
