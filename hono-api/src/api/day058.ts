// src/api/day058.ts
// NOTE: This endpoint uses @google/genai. In production, GEMINI_API_KEY must be set
// via `wrangler secret put GEMINI_API_KEY`. Until then, requests will return an error.
import { Hono } from "hono";
import { GoogleGenAI } from "@google/genai";
import type { Env } from "@/lib/auth";

export const day058App = new Hono<{ Bindings: Env }>();

day058App.post("/generate", async (ctx) => {
  try {
    const body = await ctx.req.json();
    const prompt = body.prompt;
    const sketch = body.sketch; // Base64 image from canvas
    const additionalImage = body.additionalImage; // Optional Base64 uploaded image

    const apiKey = ctx.env.GEMINI_API_KEY;
    if (!apiKey) {
      return ctx.json({ error: "GEMINI_API_KEY is not configured" }, 500);
    }
    const ai = new GoogleGenAI({ apiKey });

    const contents: unknown[] = [];
    let hasImage = false;

    if (sketch) {
      const base64Data = sketch.includes(",") ? sketch.split(",")[1] : sketch;
      contents.push({
        inlineData: { data: base64Data, mimeType: "image/png" },
      });
      hasImage = true;
    }

    if (additionalImage) {
      const base64Data = additionalImage.includes(",")
        ? additionalImage.split(",")[1]
        : additionalImage;
      contents.push({
        inlineData: { data: base64Data, mimeType: "image/png" },
      });
      hasImage = true;
    }

    if (hasImage) {
      contents.push({
        text: `これらの画像を元にして、次の指示に従って高品質な画像を生成してください: ${prompt}`,
      });
    } else {
      contents.push({ text: prompt });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: contents as Parameters<typeof ai.models.generateContent>[0]["contents"],
    });

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData) {
        const imageData = part.inlineData.data;
        return ctx.json({ image: `data:image/png;base64,${imageData}` });
      }
    }

    return ctx.json({ error: "画像生成に失敗しました" }, 500);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return ctx.json({ error: "内部サーバーエラーが発生しました" }, 500);
  }
});
