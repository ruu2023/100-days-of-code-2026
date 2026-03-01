// API proxy: forwards client requests to Workers with the session cookie
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://hono-api.ruu2023.workers.dev";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  const { path } = await params;
  const cookie = request.headers.get("cookie") ?? "";

  const res = await fetch(`${API_URL}/api/kanban/${path}`, {
    headers: {
      cookie,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  const { path } = await params;
  const cookie = request.headers.get("cookie") ?? "";
  const body = await request.json();

  const res = await fetch(`${API_URL}/api/kanban/${path}`, {
    method: "POST",
    headers: {
      cookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  const { path } = await params;
  const cookie = request.headers.get("cookie") ?? "";
  const body = await request.json();

  const res = await fetch(`${API_URL}/api/kanban/${path}`, {
    method: "PATCH",
    headers: {
      cookie,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string }> }
) {
  const { path } = await params;
  const cookie = request.headers.get("cookie") ?? "";

  const res = await fetch(`${API_URL}/api/kanban/${path}`, {
    method: "DELETE",
    headers: {
      cookie,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
