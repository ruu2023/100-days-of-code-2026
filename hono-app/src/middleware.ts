// middleware.ts
import { NextResponse, type NextRequest } from "next/server";
import { getServerAuth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // /dayXXX/dashboard にマッチするパスを保護
  const isProtected = /\/day\d+\/dashboard/.test(pathname);

  if (isProtected) {
    const auth = await getServerAuth();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      // 未認証の場合は /login?redirect=<元のURL> へリダイレクト
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // /day052/dashboard, /day123/dashboard ... にマッチ
    '/:day*/dashboard',
    '/:day*/dashboard/:path*',
  ],
};