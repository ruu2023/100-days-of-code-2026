import { getRequestContext } from '@cloudflare/next-on-pages';

export const runtime = 'edge'; // Cloudflare で動かすために必須です

export async function GET() {
  // getRequestContext() を使って環境変数（bindings）を取得
  const { env } = getRequestContext();
  
  try {
    // wrangler.jsonc で設定した名前 "DB" でアクセス
    const results = await env.DB.prepare("SELECT * FROM users").all();
    return Response.json(results);
  } catch (e) {
    return Response.json({ error: "DB への接続に失敗しました" }, { status: 500 });
  }
}