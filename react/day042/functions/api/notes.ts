interface Env {
  DB: D1Database;
}

export async function onRequestGet({ env }: { env: Env }) {
  const { results } = await env.DB.prepare(
    "SELECT id, body, created_at FROM notes ORDER BY id DESC LIMIT 50"
  ).all();
  return Response.json({ ok: true, notes: results });
}

export async function onRequestPost({ request, env }: { request: Request; env: Env }) {
  const data = (await request.json().catch(() => null)) as { body?: string } | null;
  const body = data?.body?.toString()?.trim();
  if (!body) return Response.json({ ok: false, error: "body required" }, { status: 400 });

  await env.DB.prepare("INSERT INTO notes (body, created_at) VALUES (?, ?)")
    .bind(body, new Date().toISOString())
    .run();

  return Response.json({ ok: true });
}
