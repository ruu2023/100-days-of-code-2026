// functions/_middleware.ts

export async function onRequest(context) {
  // 1. まずは本来のレスポンスを取得
  const response = await context.next();
  
  // 2. レスポンスをコピーして、CORSヘッダーを注入する
  const newResponse = new Response(response.body, response);
  
  // すべてのドメイン（localhostも含む）からのアクセスを許可
  newResponse.headers.set("Access-Control-Allow-Origin", "*");
  newResponse.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  newResponse.headers.set("Access-Control-Allow-Headers", "Content-Type");

  return newResponse;
}