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
