import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET() {
  const { env } = getCloudflareContext();
  const { results } = await env.DB.prepare(
    "SELECT * FROM posts"
  ).all();
  return NextResponse.json(results);
}

export async function POST(request: Request) {
  const { env } = getCloudflareContext();
  const { title, content } = (await request.json()) as { title: string; content: string };

  const result = await env.DB.prepare(
    "INSERT INTO posts (title, content) VALUES (?, ?)"
  ).bind(title, content).run();

  const { results } = await env.DB.prepare(
    'SELECT * FROM posts WHERE id = ?'
  ).bind(result.meta.last_row_id).all();
  
  return NextResponse.json(results[0]);

  // return NextResponse.json({ success: true, id: result.meta.last_row_id });
}