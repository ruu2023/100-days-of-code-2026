"use client";

import { useState } from "react";
import { sendChatMessage } from "./actions";

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input) return;
    setLoading(true);
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);
    setInput("");

    try {
      const stream = await sendChatMessage(newMessages);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = "";

      // 新しいメッセージ枠を確保
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        // Ollamaのストリームは複数行のJSONで返ってくるためパースが必要
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line) continue;
          const json = JSON.parse(line);
          if (json.message?.content) {
            assistantMessage += json.message.content;
            // 逐次更新
            setMessages((prev) => [
              ...prev.slice(0, -1),
              { role: "assistant", content: assistantMessage },
            ]);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`p-3 rounded ${m.role === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100"}`}>
            <strong>{m.role === "user" ? "You" : "LFM 2.5"}:</strong> {m.content}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border p-2 rounded text-black"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />
        <button onClick={sendMessage} className="bg-blue-500 text-white p-2 rounded" disabled={loading}>
          送信
        </button>
      </div>
    </div>
  );
}
