// app/api/v1/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    // OpenNextではrequest.ctxからenvにアクセス
    // @ts-ignore
    const env = request.ctx?.cloudflare?.env;
    
    if (!env?.DB) {
      return Response.json({ 
        error: 'DB not available',
        hasEnv: !!env,
        hasDB: !!env?.DB
      }, { status: 500 });
    }
    
    const { results } = await env.DB.prepare(
      'SELECT * FROM posts ORDER BY id DESC'
    ).all();
    
    return Response.json(results);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ 
      error: 'Failed to fetch posts',
      details: String(error)
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // @ts-ignore
    const env = request.ctx?.cloudflare?.env;
    const { title, content } = await request.json() as { title: string; content: string };
    
    if (!env?.DB) {
      return Response.json({ error: 'DB not available' }, { status: 500 });
    }
    
    const result = await env.DB.prepare(
      'INSERT INTO posts (title, content) VALUES (?, ?)'
    ).bind(title, content).run();
    
    const { results } = await env.DB.prepare(
      'SELECT * FROM posts WHERE id = ?'
    ).bind(result.meta.last_row_id).all();
    
    return Response.json(results[0]);
  } catch (error) {
    console.error('Database error:', error);
    return Response.json({ 
      error: 'Failed to create post',
      details: String(error)
    }, { status: 500 });
  }
}