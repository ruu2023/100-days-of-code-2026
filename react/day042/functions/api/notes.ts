interface Env {
  DB: D1Database;
}

// GET: 自分のノートだけを取得する
export async function onRequestGet({ request, env }: { request: Request; env: Env }) {
  const userId = request.headers.get('X-User-Id');

  if (!userId) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { results } = await env.DB.prepare(
    "SELECT id, body, created_at FROM notes WHERE google_user_id = ? ORDER BY id DESC LIMIT 50"
  )
  .bind(userId)
  .all();

  return Response.json({ ok: true, notes: results });
}

// POST: 自分の ID を紐付けて保存する
export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const userId = request.headers.get('X-User-Id');

  if (!userId) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const data = (await request.json().catch(() => null)) as { body?: string } | null;
  const body = data?.body?.toString()?.trim();

  if (!body) {
    return Response.json({ ok: false, error: "body required" }, { status: 400 });
  }

  await env.DB.prepare(
    "INSERT INTO notes (body, created_at, google_user_id) VALUES (?, ?, ?)"
  )
  .bind(body, new Date().toISOString(), userId)
  .run();

  return Response.json({ ok: true });
}