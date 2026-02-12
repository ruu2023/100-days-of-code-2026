// functions/api/get-notes.js
export async function onRequest(context) {
  // フロントエンドから送られてきた X-User-Id (sub) を取得
  const userId = context.request.headers.get('X-User-Id');

  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // D1 から、そのユーザーのノートだけを取得
  const { results } = await context.env.D1.prepare(
    "SELECT * FROM notes WHERE google_user_id = ?"
  ).bind(userId).all();

  return Response.json(results);
}