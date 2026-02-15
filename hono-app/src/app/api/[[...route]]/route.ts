// app/api/[[...route]]/route.ts
import { getAuth } from '@/lib/auth';
import { getCloudflareContext } from '@opennextjs/cloudflare';
import { Hono } from 'hono';

const app = new Hono<{ Bindings: CloudflareEnv }>().basePath('/api')

app.on(["POST", "GET"], "/auth/**", async (ctx) => {
  const auth = getAuth(ctx.env);
  return auth.handler(ctx.req.raw);
});

app.get('/me', async (ctx) => {
  const auth = getAuth(ctx.env);
  const session = await auth.api.getSession({ headers: ctx.req.raw.headers });

  return ctx.json(session?.user ?? { message: "Not logged in" });
});

// api 以下のすべてのリクエストを Hono アプリケーションに転送する
const toHono = async (req: Request) => {
  const { env } = await getCloudflareContext();
  return app.fetch(req, env)
}

// Next.js が認識できるように名前付きで export する
export const GET = toHono
export const POST = toHono