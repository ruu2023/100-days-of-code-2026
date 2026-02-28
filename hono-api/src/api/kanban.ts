// src/api/kanban.ts
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, and, asc } from "drizzle-orm";
import { kanbanColumns, kanbanItems } from "@/db/schema";
import { getAuth, type Env } from "@/lib/auth";

type Variables = { userId: string };

export const kanbanApp = new Hono<{ Bindings: Env; Variables: Variables }>();

// ── 認証ミドルウェア ─────────────────────────────────────
kanbanApp.use("*", async (ctx, next) => {
  const auth = getAuth(ctx.env);
  const session = await auth.api.getSession({ headers: ctx.req.raw.headers });
  if (!session?.user) {
    return ctx.json({ error: "Unauthorized" }, 401);
  }
  ctx.set("userId", session.user.id);
  await next();
});

// ── カラム CRUD ──────────────────────────────────────────

// GET /api/kanban/columns  →  自分のカラム＋アイテム一式を返す
kanbanApp.get("/columns", async (ctx) => {
  const db = drizzle(ctx.env.hono_db);
  const userId = ctx.get("userId");

  const cols = await db
    .select()
    .from(kanbanColumns)
    .where(eq(kanbanColumns.userId, userId))
    .orderBy(asc(kanbanColumns.position));

  const items = await db
    .select()
    .from(kanbanItems)
    .where(eq(kanbanItems.userId, userId))
    .orderBy(asc(kanbanItems.position));

  return ctx.json({ columns: cols, items });
});

// POST /api/kanban/columns  →  カラム作成
kanbanApp.post("/columns", async (ctx) => {
  const db = drizzle(ctx.env.hono_db);
  const userId = ctx.get("userId");
  const { title, position } = await ctx.req.json<{ title: string; position: number }>();

  const id = crypto.randomUUID();
  await db.insert(kanbanColumns).values({
    id,
    userId,
    title,
    position,
    createdAt: new Date(),
  });

  return ctx.json({ id, userId, title, position });
});

// PATCH /api/kanban/columns/:id  →  カラム名/順序を更新
kanbanApp.patch("/columns/:id", async (ctx) => {
  const db = drizzle(ctx.env.hono_db);
  const userId = ctx.get("userId");
  const colId = ctx.req.param("id");
  const body = await ctx.req.json<{ title?: string; position?: number }>();

  await db
    .update(kanbanColumns)
    .set(body)
    .where(and(eq(kanbanColumns.id, colId), eq(kanbanColumns.userId, userId)));

  return ctx.json({ ok: true });
});

// DELETE /api/kanban/columns/:id  →  カラム削除（アイテムはCASCADE）
kanbanApp.delete("/columns/:id", async (ctx) => {
  const db = drizzle(ctx.env.hono_db);
  const userId = ctx.get("userId");
  const colId = ctx.req.param("id");

  await db
    .delete(kanbanColumns)
    .where(and(eq(kanbanColumns.id, colId), eq(kanbanColumns.userId, userId)));

  return ctx.json({ ok: true });
});

// ── アイテム CRUD ────────────────────────────────────────

// POST /api/kanban/items  →  アイテム作成
kanbanApp.post("/items", async (ctx) => {
  const db = drizzle(ctx.env.hono_db);
  const userId = ctx.get("userId");
  const { columnId, content, position } = await ctx.req.json<{
    columnId: string;
    content: string;
    position: number;
  }>();

  const id = crypto.randomUUID();
  await db.insert(kanbanItems).values({
    id,
    columnId,
    userId,
    content,
    position,
    createdAt: new Date(),
  });

  return ctx.json({ id, columnId, userId, content, position });
});

// PATCH /api/kanban/items/:id  →  コンテンツ/カラム/順序を更新
kanbanApp.patch("/items/:id", async (ctx) => {
  const db = drizzle(ctx.env.hono_db);
  const userId = ctx.get("userId");
  const itemId = ctx.req.param("id");
  const body = await ctx.req.json<{
    content?: string;
    columnId?: string;
    position?: number;
  }>();

  await db
    .update(kanbanItems)
    .set(body)
    .where(and(eq(kanbanItems.id, itemId), eq(kanbanItems.userId, userId)));

  return ctx.json({ ok: true });
});

// DELETE /api/kanban/items/:id  →  アイテム削除
kanbanApp.delete("/items/:id", async (ctx) => {
  const db = drizzle(ctx.env.hono_db);
  const userId = ctx.get("userId");
  const itemId = ctx.req.param("id");

  await db
    .delete(kanbanItems)
    .where(and(eq(kanbanItems.id, itemId), eq(kanbanItems.userId, userId)));

  return ctx.json({ ok: true });
});
