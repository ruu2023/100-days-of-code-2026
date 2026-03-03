import { NextRequest, NextResponse } from "next/server";

// Session bridge: called by Workers after OAuth succeeds.
// Workers sets its session cookie on Workers domain, then redirects here
// so we can set the same session token as a cookie on the Next.js (Cloud Run) domain.
// The middleware then forwards this cookie to Workers for session verification.
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const redirect = req.nextUrl.searchParams.get("redirect") || "/";

  // Reconstruct the actual external base URL from headers, because req.url inside
  // Cloud Run might be the internal container address (e.g. http://0.0.0.0:8080)
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const baseUrl = host ? `${protocol}://${host}` : req.url;

  if (!token) {
    return NextResponse.redirect(new URL("/login", baseUrl));
  }

  const response = NextResponse.redirect(new URL(redirect, baseUrl));

  // Set the cookie on Next.js domain so middleware and server components
  // can read it and forward it to Workers.
  const isHttps = protocol === "https" || baseUrl.startsWith("https://");
  const cookieName = isHttps
    ? "__Secure-better-auth.session_token"
    : "better-auth.session_token";

  response.cookies.set({
    name: cookieName,
    value: token,
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}
