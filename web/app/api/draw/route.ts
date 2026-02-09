import { NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.NEXT_PUBLIC_PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.NEXT_PUBLIC_PUSHER_APP_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  // フロントエンドから送られてきた描画データを受け取る
  const data = await req.json();

  // "board-channel" というチャンネルに "draw-event" を送出
  // これにより、他の全ユーザーのブラウザで useEffect 内の bind が発火します
  await pusher.trigger("board-channel", "draw-event", data);

  return NextResponse.json({ success: true });
}
