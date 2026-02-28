"use server";

import { GoogleGenAI } from "@google/genai";

export async function generateImage(prompt: string) {

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: prompt,
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      return `data:image/png;base64,${imageData}`;
      // const buffer = Buffer.from(imageData, "base64");
      // fs.writeFileSync("gemini-native-image.png", buffer);
      console.log("Image saved as gemini-native-image.png");
    }
  }
}

export async function refineSketch(fromData: FormData) {

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  const prompt = fromData.get("prompt") as string;
  const sketches = fromData.getAll("sketch") as string[]

  const imageParts = sketches.map(base64 => ({
    inlineData: {
      data: base64.split(",")[1], // "data:image/png;base64," を除去
      mimeType: "image/png",
    },
  }));

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-image-preview",
    contents: [
      ...imageParts,
      { text: `このラフ画を元にして、次の指示に従って高品質な画像を生成してください: ${prompt}` },
    ],
  });
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.text) {
      console.log(part.text);
    } else if (part.inlineData) {
      const imageData = part.inlineData.data;
      return `data:image/png;base64,${imageData}`;
    }
  }
}