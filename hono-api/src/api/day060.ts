// src/api/day060.ts
// Twitter-like app API: tweets with video/image upload to R2
import { Hono } from "hono";
import { drizzle } from "drizzle-orm/d1";
import { eq, desc, sql } from "drizzle-orm";
import { getAuth, type Env } from "@/lib/auth";
import { tweets } from "@/db/schema";

const day060App = new Hono<{ Bindings: Env }>();

// ---------------------------------------------------------------------------
// Helper: Generate R2 public URL
// ---------------------------------------------------------------------------
function getPublicUrl(key: string, req: Request): string {
  const url = new URL(req.url);
  // ローカル開発環境の場合はlocalhostにフォールバック（ポートはwrangler devのもの）
  if (url.hostname === "localhost" || url.hostname === "127.0.0.1") {
    // ローカルの場合、Next.js側から表示するにはひとまずこのAPIサーバー自体経由などでバイパスする必要があるか、
    // wrangler local環境の場合はデフォルトで直接アクセスできるURLがありません。
    // ※ 簡便のため、ここではlocalhost:8787の特定パスをリソースURLとして返す構成にするか、
    // ダミーURLを返す形にします。ここではAPIに配信用エンドポイント `/api/day060/r2` を作ってプロキシする前提のURLにします。
    return `${url.protocol}//${url.host}/api/day060/r2/${key}`;
  }
  return `https://pub-9592d65a5ae84a76bea4d7c469e8cc79.r2.dev/${key}`;
}

// ---------------------------------------------------------------------------
// GET /api/day060/tweets - 全ユーザーの投稿を取得（ユーザー情報付き）
// ---------------------------------------------------------------------------
day060App.get("/tweets", async (ctx) => {
  const db = drizzle(ctx.env.hono_db);

  // Use raw SQL for LEFT JOIN with user table
  const result = await db.all(
    sql`
      SELECT
        t.id,
        t.content,
        t."videoUrl",
        t."thumbnailUrl",
        t."createdAt",
        t."userId",
        u.name as "userName",
        u.image as "userImage"
      FROM tweets t
      LEFT JOIN user u ON t."userId" = u.id
      ORDER BY t."createdAt" DESC
      LIMIT 100
    `
  );

  const tweetsWithUser = result.map((row: any) => ({
    id: row.id,
    content: row.content,
    videoUrl: row.videoUrl,
    thumbnailUrl: row.thumbnailUrl,
    createdAt: row.createdAt,
    userId: row.userId,
    user: {
      name: row.userName || 'Anonymous',
      image: row.userImage || null,
    },
  }));

  return ctx.json({ tweets: tweetsWithUser });
});

// ---------------------------------------------------------------------------
// GET /api/day060/r2/* - 開発用のローカルR2配信用エンドポイント
// ---------------------------------------------------------------------------
day060App.get("/r2/*", async (ctx) => {
  // e.g. /api/day060/r2/videos/uuid/file.mp4 -> videos/uuid/file.mp4
  const key = ctx.req.path.replace("/api/day060/r2/", "");
  const object = await ctx.env.ANIME_STORAGE.get(key);

  if (!object) {
    return ctx.text("Not found", 404);
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);
  
  return new Response(object.body, {
    headers,
  });
});

// ---------------------------------------------------------------------------
// POST /api/day060/tweets - 新規投稿（テキストのみ、または動画付き）
// ---------------------------------------------------------------------------
day060App.post("/tweets", async (ctx) => {
  const auth = getAuth(ctx.env);
  const session = await auth.api.getSession({ headers: ctx.req.raw.headers });

  if (!session?.user) {
    return ctx.json({ error: "Unauthorized" }, 401);
  }

  const formData = await ctx.req.parseBody({ all: true });
  const content = formData["content"] as string;
  const videoFile = formData["video"] as File | undefined;
  const thumbnailFile = formData["thumbnail"] as File | undefined;

  if (!content || content.length > 140) {
    return ctx.json({ error: "Content must be 1-140 characters" }, 400);
  }

  const tweetId = crypto.randomUUID();
  let videoUrl: string | undefined;
  let thumbnailUrl: string | undefined;

  // Upload video to R2
  if (videoFile && videoFile.size > 0) {
    const videoKey = `videos/${tweetId}/${videoFile.name}`;
    await ctx.env.ANIME_STORAGE.put(videoKey, videoFile.stream(), {
      httpMetadata: {
        contentType: videoFile.type || "video/mp4",
      },
    });
    videoUrl = getPublicUrl(videoKey, ctx.req.raw);
  }

  // Upload thumbnail to R2
  if (thumbnailFile && thumbnailFile.size > 0) {
    const thumbKey = `thumbnails/${tweetId}/${thumbnailFile.name}`;
    await ctx.env.ANIME_STORAGE.put(thumbKey, thumbnailFile.stream(), {
      httpMetadata: {
        contentType: thumbnailFile.type || "image/jpeg",
      },
    });
    thumbnailUrl = getPublicUrl(thumbKey, ctx.req.raw);
  }

  const db = drizzle(ctx.env.hono_db);
  await db.insert(tweets).values({
    id: tweetId,
    userId: session.user.id,
    content,
    videoUrl,
    thumbnailUrl,
    createdAt: new Date(),
  });

  return ctx.json({
    tweet: {
      id: tweetId,
      content,
      videoUrl,
      thumbnailUrl,
      createdAt: new Date().toISOString(),
    },
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/day060/tweets/:id - 投稿を削除
// ---------------------------------------------------------------------------
day060App.delete("/tweets/:id", async (ctx) => {
  const auth = getAuth(ctx.env);
  const session = await auth.api.getSession({ headers: ctx.req.raw.headers });

  if (!session?.user) {
    return ctx.json({ error: "Unauthorized" }, 401);
  }

  const tweetId = ctx.req.param("id");
  const db = drizzle(ctx.env.hono_db);

  // Check if tweet exists and belongs to the user
  const [tweet] = await db
    .select()
    .from(tweets)
    .where(eq(tweets.id, tweetId))
    .limit(1);

  if (!tweet) {
    return ctx.json({ error: "Tweet not found" }, 404);
  }

  if (tweet.userId !== session.user.id) {
    return ctx.json({ error: "Forbidden" }, 403);
  }

  // Delete R2 objects if exists
  if (tweet.videoUrl) {
    // Extract key from URL
    const videoKey = tweet.videoUrl.replace("https://anime-storage.pages.dev/", "");
    await ctx.env.ANIME_STORAGE.delete(videoKey);
  }
  if (tweet.thumbnailUrl) {
    const thumbKey = tweet.thumbnailUrl.replace("https://anime-storage.pages.dev/", "");
    await ctx.env.ANIME_STORAGE.delete(thumbKey);
  }

  // Delete from DB
  await db.delete(tweets).where(eq(tweets.id, tweetId));

  return ctx.json({ success: true });
});

// ---------------------------------------------------------------------------
// GET /api/day060/tweets/me - 自分の投稿を取得
// ---------------------------------------------------------------------------
day060App.get("/tweets/me", async (ctx) => {
  const auth = getAuth(ctx.env);
  const session = await auth.api.getSession({ headers: ctx.req.raw.headers });

  if (!session?.user) {
    return ctx.json({ error: "Unauthorized" }, 401);
  }

  const db = drizzle(ctx.env.hono_db);
  const result = await db
    .select()
    .from(tweets)
    .where(eq(tweets.userId, session.user.id))
    .orderBy(desc(tweets.createdAt));

  return ctx.json({ tweets: result });
});

export { day060App };
