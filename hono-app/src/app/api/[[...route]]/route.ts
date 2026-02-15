// app/api/[[...route]]/route.ts
import { Hono } from 'hono'
import { getCloudflareContext } from '@opennextjs/cloudflare'

const app = new Hono<{ Bindings: CloudflareEnv }>().basePath('/api')

app.get('/check', async (c) => {
  const { env } = getCloudflareContext();
  const db = env.hono_db;

  if (!db) {
    return c.json({ 
      error: 'D1 binding (hono_db) not found',
      availableEnv: Object.keys(env)
    }, 500)
  }

  try {
    const { success } = await db.prepare('SELECT 1').run()
    return c.json({ 
      status: 'Hono is running!', 
      database: 'hono_db is connected!',
      success 
    })
  } catch (e) {
    return c.json({ error: String(e) }, 500)
  }
})

export const GET = async (req: Request) => {
  const { env } = getCloudflareContext();
  return app.fetch(req, env)
}

export const POST = async (req: Request) => {
  const { env } = getCloudflareContext();
  return app.fetch(req, env)
}