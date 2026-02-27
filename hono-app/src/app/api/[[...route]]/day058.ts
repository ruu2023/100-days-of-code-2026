import { Hono } from "hono";
import { GoogleGenAI } from "@google/genai";

export const day058App = new Hono();

day058App.post("/generate", async (ctx) => {
  try {
    const body = await ctx.req.json();
    const prompt = body.prompt;
    const sketch = body.sketch; // Base64 image from canvas

    // Use process.env.GEMINI_API_KEY for standard Next.js environment
    // Note: If using Cloudflare pages, ctx.env.GEMINI_API_KEY might be accessed, relying on process.env fallback.
    const apiKey = (ctx.env as any)?.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    const ai = new GoogleGenAI({ apiKey });

    const contents: any[] = [];
    if (sketch) {
      // Assuming sketch is a Base64 string starting with "data:image/png;base64,"
      const base64Data = sketch.includes(',') ? sketch.split(',')[1] : sketch;
      contents.push({
        inlineData: {
          data: base64Data,
          mimeType: "image/png",
        }
      });
      contents.push({ text: `このラフ画を元にして、次の指示に従って高品質な画像を生成してください: ${prompt}` });
    } else {
      contents.push({ text: prompt });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-image-preview",
      contents: contents,
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
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
