// src/lib/api-client.ts
// Shared fetch helper that calls Workers API directly with credentials
// NEXT_PUBLIC_API_URL is baked in at build time via Dockerfile ARG + ENV.

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.API_URL ||
  "http://localhost:8787";

/**
 * Fetch wrapper that automatically prepends the hono-api base URL.
 * Usage: apiFetch('/api/kanban/columns')
 */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  // Always use absolute URL to call Workers API directly
  const url = path.startsWith("http") ? path : `${BASE_URL}${path}`;
  
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && typeof init?.body === "string") {
    headers.set("Content-Type", "application/json");
  }

  return fetch(url, {
    credentials: "include",
    ...init,
    headers,
  });
}
