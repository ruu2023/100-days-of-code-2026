# OpenNext Starter

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

Read the documentation at https://opennext.js.org/cloudflare.

## Develop

Run the Next.js development server:

```bash
npm run dev
# or similar package manager command
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Preview

Preview the application locally on the Cloudflare runtime:

```bash
npm run preview
# or similar package manager command
```

## Deploy

Deploy the application to Cloudflare:

```bash
npm run deploy
# or similar package manager command
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Hono

```bash
npm create cloudflare@latest -- hono-app --framework=next

cd hono-app

npm i hono

npx wrangler d1 create hono-db
# ずっとenter

npm run cf-typegen
```

```ts
// hono-app/src/app/api/[[...route]]/route.ts
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
```

```bash
npm run dev
```
- http://localhost:3000/api/check にアクセスしてみてください

- status:"Hono is running!" と出れば成功
