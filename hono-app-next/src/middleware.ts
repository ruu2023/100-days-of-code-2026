// middleware.ts
// Cloud Run / Next.js middleware: verify session against hono-api Workers
import { NextResponse, type NextRequest } from "next/server";

// Use server-only env var (API_URL) so it can be set as a Cloud Run runtime env var.
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL;

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  // /dayXXX/dashboard にマッチするパスを保護
  const isProtected = /\/day\d+\/dashboard/.test(pathname);

  if (isProtected) {
    // セッションを hono-api に問い合わせて確認
    const externalOrigin = request.headers.get("x-forwarded-host") 
      ? `https://${request.headers.get("x-forwarded-host")}` 
      : request.nextUrl.origin;
    const baseUrl = API_URL || externalOrigin;
    const protocol = request.nextUrl.protocol === "https:" || baseUrl.startsWith("https") ? "https" : "http";
    const res = await fetch(`${baseUrl}/api/me`, {
      headers: {
        cookie: request.headers.get("cookie") ?? "",
        "x-forwarded-proto": protocol,
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
