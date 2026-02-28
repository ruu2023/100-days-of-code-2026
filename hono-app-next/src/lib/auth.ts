// src/lib/auth.ts
// Next.js side: auth client that calls the hono-api Workers backend.
// The API_URL must be set via NEXT_PUBLIC_API_URL env var.
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "@/db/schema";

// NOTE: In Next.js on Cloud Run, we don't have Cloudflare bindings.
// Auth-related server actions (session check etc.) go through the
// hono-api Workers backend rather than running locally.
// This file is kept for `better-auth` client-side type compatibility
// and for the Next.js middleware session check via fetch().

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8787";

// Utility to get the current session by forwarding the request headers to hono-api
export async function getSession(headers: Headers) {
  const res = await fetch(`${API_URL}/api/me`, {
    headers: {
      cookie: headers.get("cookie") ?? "",
    },
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (data?.message) return null; // "Not logged in"
  return data;
}

// For middleware: call hono-api to verify session
export async function getServerSession(headers: Headers) {
  return getSession(headers);
}
