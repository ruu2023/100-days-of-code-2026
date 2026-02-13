
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function GET() {
  const { env } = getCloudflareContext();
  const db = env.DB;

  try {
    // DBからデータを取得してみる
    const { results } = await db.prepare("SELECT * FROM users LIMIT 1").all();
    
    return NextResponse.json({ 
      message: "Hello from D1!", 
      data: results 
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Database connection failed" }, 
      { status: 500 }
    );
  }
}