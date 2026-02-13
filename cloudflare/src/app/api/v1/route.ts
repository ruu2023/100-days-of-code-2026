// app/api/v1/route.ts
export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    // @ts-expect-error
    const env = request.ctx?.cloudflare?.env;
    
    const { results } = await env.DB.prepare(
      'SELECT * FROM posts ORDER BY id DESC'
    ).all();
    
    return Response.json(results);
  } catch (error) {
    return Response.json({ 
      error: String(error)
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // @ts-expect-error
    const env = request.ctx?.cloudflare?.env;
    const { title, content } = await request.json() as { title: string; content: string };
    
    const result = await env.DB.prepare(
      'INSERT INTO posts (title, content) VALUES (?, ?)'
    ).bind(title, content).run();
    
    const { results } = await env.DB.prepare(
      'SELECT * FROM posts WHERE id = ?'
    ).bind(result.meta.last_row_id).all();
    
    return Response.json(results[0]);
  } catch (error) {
    return Response.json({ 
      error: String(error)
    }, { status: 500 });
  }
}