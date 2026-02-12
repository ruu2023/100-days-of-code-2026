// functions/api/create-note.js
export async function onRequestPost(context) {
  const userId = context.request.headers.get('X-User-Id');
  
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // フロントから送られてきた body (title や content) を取得
  const { title, content } = await context.request.json();

  try {
    // D1 に保存。google_user_id カラムに userId を入れるのがポイント
    await context.env.D1.prepare(
      "INSERT INTO notes (title, content, google_user_id) VALUES (?, ?, ?)"
    )
    .bind(title, content, userId)
    .run();

    return Response.json({ success: true }, { status: 201 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}