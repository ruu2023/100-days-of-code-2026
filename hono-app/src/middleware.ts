// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getServerAuth } from "@/lib/auth";

export async function middleware(request: NextRequest) {

  const { pathname, origin } = request.nextUrl;

  // 1. ガードしたいパスの判定（matcherに合わせる）
  const isProtected = pathname.includes("dashboard")

  if (isProtected) {

    const auth = await getServerAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      // 2. リファラを取得
      const referer = request.headers.get("referer");

      // 3. 【重要】リファラが自分自身（無限ループ）になるのを防ぐ
      // リファラがない、またはリファラが今アクセスしようとしている場所と同じなら、トップへ帰す
      if (!referer || referer.includes(pathname)) {
        return NextResponse.redirect(new URL("/", origin));
      }

      // 4. それ以外（例：Homeから来た）なら、その元いた場所へ帰す
      return NextResponse.redirect(referer);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard',
    '/day(\\d+)/:path'
  ],
};