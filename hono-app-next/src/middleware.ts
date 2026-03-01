// middleware.ts
// Cloud Run / Next.js middleware: verify session against hono-api Workers
import { NextResponse, type NextRequest } from "next/server";

// Use server-only env var (API_URL) so it can be set as a Cloud Run runtime env var.
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8787";

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // /dayXXX/dashboard にマッチするパスを保護
  const isProtected = /\/day\d+\/dashboard/.test(pathname);

  if (isProtected) {
    // セッションを hono-api に問い合わせて確認
    const res = await fetch(`${API_URL}/api/me`, {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
      },
    });

    let session = null;
    if (res.ok) {
      const data = await res.json();
      if (!data?.message) {
        session = data; // has user object
      }
    }

    if (!session) {
      const loginUrl = new URL("/login", origin);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/:day*/dashboard",
    "/:day*/dashboard/:path*",
  ],
};
