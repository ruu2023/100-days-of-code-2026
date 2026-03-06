"use server";

export async function sendChatMessage(
  messages: { role: string; content: string }[]
): Promise<ReadableStream<Uint8Array>> {
  const ollamaUrl = process.env.OLLAMA_URL || 'http://localhost:11434';
  const model = process.env.OLLAMA_MODEL || 'lfm2.5';

  const response = await fetch(`${ollamaUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
    }),
  });

  if (!response.body) {
    throw new Error("Response body is null");
  }

  return response.body;
}
