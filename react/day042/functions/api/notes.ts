interface GoogleTokenInfo {
  sub: string;      // ユーザーの一意識別子
  email?: string;   // メールアドレス
  name?: string;    // 名前
  exp: string;      // 有効期限
  // 他にも多くのフィールドがありますが、今回使うのは sub だけなのでこれだけでOK
}

interface Env {
  DB: D1Database;
  // GOOGLE_CLIENT_ID などを入れている場合はここに追加
}// functions/api/notes.ts

export async function onRequest({ request, env }) {
  const authHeader = request.headers.get('Authorization');
  const token = authHeader?.replace('Bearer ', '');

  if (!token) return Response.json({ ok: false }, { status: 401 });

  // Googleの検証用エンドポイントを叩く（ライブラリなしでOK！）
  const googleRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${token}`);
  
  if (!googleRes.ok) {
    return Response.json({ ok: false, error: "Invalid Token" }, { status: 401 });
  }

  // ここで型をアサーション（断定）します
  const payload = (await googleRes.json()) as GoogleTokenInfo;
  
  const userId = payload.sub; // これでエラーが消えます！

  // --- 以降、メソッド別の処理 ---
  if (request.method === "GET") {
    const { results } = await env.DB.prepare(
      "SELECT * FROM notes WHERE google_user_id = ? ORDER BY id DESC"
    ).bind(userId).all();
    return Response.json({ ok: true, notes: results });
  }

  if (request.method === "POST") {
    const { body } = await request.json();
    await env.DB.prepare(
      "INSERT INTO notes (body, created_at, google_user_id) VALUES (?, ?, ?)"
    ).bind(body, new Date().toISOString(), userId).run();
    return Response.json({ ok: true });
  }
}