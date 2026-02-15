// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getServerAuth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  // 1. ログインチェックをスキップするパス（ログイン画面、公開ページなど）
  const isPublicPage = request.nextUrl.pathname.startsWith("/login") || 
                       request.nextUrl.pathname === "/";

  // 2. 直接関数を呼んで Auth インスタンスを取得
  const auth = await getServerAuth();

  // 3. fetch せずに、API を内部的に呼び出す
  const session = await auth.api.getSession({
    headers: request.headers, // ブラウザから届いた Cookie をそのまま渡す
  });

  // 4. ログインしていない & 公開ページでもない場合はログインへ
  if (!session && !isPublicPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 5. ログイン済みでログイン画面に行こうとしたらダッシュボードへ
  if (session && request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// 適用する範囲を指定
export const config = {
  matcher: [
    "/dashboard/:path*", // dashboard 以下すべて
    "/login",
    "/profile/:path*",
  ],
};