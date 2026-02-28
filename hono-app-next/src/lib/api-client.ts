// src/lib/api-client.ts
// Shared fetch helper that prepends the hono-api base URL.
// NEXT_PUBLIC_API_URL is baked in at build time via Dockerfile ARG + ENV.
// API_URL is a server-side runtime env var (Cloud Run) used as fallback in SSR/Edge.

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:8787";

/**
 * Fetch wrapper that automatically prepends the hono-api base URL.
 * Usage: apiFetch('/api/kanban/columns')
 */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  // If already absolute URL, use as-is
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  return fetch(url, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });
}
