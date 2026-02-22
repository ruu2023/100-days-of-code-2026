// custom-worker.ts
// @ts-ignore `.open-next/worker.js` is generated at build time
import { default as handler } from "./.open-next/worker.js";
import { drizzle } from "drizzle-orm/d1";
import { eq } from "drizzle-orm";
import { tangoCards } from "./src/db/schema";

// Requesty 経由で Gemini にリクエストし、140文字の説明を返す
async function callRequesty(front: string, apiKey: string): Promise<string | null> {
  try {
    const res = await fetch("https://router.requesty.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: `
以下の「単語またはフレーズ」を解説してください。

【制約ルール】
1. 単純な英単語（辞書的なもの）の場合：
   「意味・訳語」のみを簡潔に返してください。余計な解説は不要です。
2. 専門用語や概念（IT用語、慣用句など）の場合：
   その内容を日本語で140文字以内で要約して解説してください。
3. 出力フォーマット：
   解説文のみを出力してください。「はい、承知しました」などの挨拶や、単語の反復は一切不要です。

対象: "${front}"`,
          },
        ],
        max_tokens: 512,

      }),
    });

    if (!res.ok) {
      console.error(`Requesty API error: ${res.status} ${await res.text()}`);
      return null;
    }

    const data = await res.json<{
      choices: { message: { content: string } }[];
    }>();
    const content = data.choices?.[0]?.message?.content ?? null;
    // 140文字を超える場合はスライス
    return content ? content.trim().slice(0, 140) : null;
  } catch (e) {
    console.error("callRequesty error:", e);
    return null;
  }
}

export default {
  // Next.js へのリクエストはそのままOpenNextハンドラに委譲
  fetch: handler.fetch,

  // Cron Trigger: 裏面が空のカードをGemini(Requesty経由)で自動補完
  async scheduled(_controller: ScheduledController, env: CloudflareEnv, _ctx: ExecutionContext) {
    console.log("[cron] tango auto-fill started");
    const db = drizzle(env.hono_db);

    // back が空文字のカードを最大20件取得
    const emptyCards = await db
      .select()
      .from(tangoCards)
      .where(eq(tangoCards.back, ""))
      .limit(20);

    console.log(`[cron] found ${emptyCards.length} empty cards`);

    for (const card of emptyCards) {
      const answer = await callRequesty(card.front, env.REQUESTY_API_KEY);
      if (answer) {
        await db
          .update(tangoCards)
          .set({ back: answer })
          .where(eq(tangoCards.id, card.id));
        console.log(`[cron] updated card ${card.id}: "${card.front}" → "${answer}"`);
      } else {
        console.warn(`[cron] failed to get answer for card: "${card.front}"`);
      }
    }

    console.log("[cron] tango auto-fill done");
  },
} satisfies ExportedHandler<CloudflareEnv>;
