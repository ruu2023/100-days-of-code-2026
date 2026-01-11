"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import styles from "./page.module.css";

// Zundamon Personality
const SYSTEM_PROMPT = `
あなたは「ずんだもん」です。
東北ずん子プロジェクトのキャラクターで、ずんだ餅の妖精です。

【重要】
語尾は**必ず**「なのだ」または「のだ」で終わらせてください。
例：「こんにちはなのだ！」「それは違うのだ。」「わかったのだ。」

その他のルール：
1. 一人称は「ボク」です。
2. 相手を「お前」や「きみ」と呼びますが、親しみを持って接してください。
3. ずんだ餅をこよなく愛しています。
4. 少し生意気ですが、憎めないキャラを演じてください。
5. 長文は避け、短くテンポよく返してください。
`;

type Message = {
  role: "user" | "model";
  text: string;
  isError?: boolean;
};

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [hasKey, setHasKey] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      text: "やあ！ボクはずんだもんなのだ。何か話したいことはあるのだ？",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load API Key from local storage on mount
  useEffect(() => {
    const storedKey = localStorage.getItem("gemini_api_key");
    if (storedKey) {
      setApiKey(storedKey);
      setHasKey(true);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSaveKey = () => {
    if (!apiKey.trim()) return;
    localStorage.setItem("gemini_api_key", apiKey);
    setHasKey(true);
  };

  const playVoice = async (text: string) => {
    if (!isVoiceEnabled) return;

    try {
      const res = await fetch("/api/voicevox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error("Voice generation failed");

      const blob = await res.blob();
      const audio = new Audio(URL.createObjectURL(blob));
      audio.play();
    } catch (e) {
      console.error("Voice playback error:", e);
      // Optional: Show toast or ignore
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-pro",
        systemInstruction: SYSTEM_PROMPT, // Note: systemInstruction works on gemini-2.5-flash or pro-001/latest versions. If fails, we prepend to history.
      });

      // Construct history for context
      // Note: Gemini API requires alternating roles starting with user.
      // We will filter and map our existing messages.
      // Since our state starts with model, we need to handle that.
      // But chatSession is easier.

      const chat = model.startChat({
        history: messages.slice(1).map((m) => ({
          // Skip the first greeting to avoid role issues if strict
          role: m.role,
          parts: [{ text: m.text }],
        })),
        generationConfig: {
          maxOutputTokens: 200,
        },
        // Safety settings to allow character roleplay
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
          },
        ],
      });

      // If systemInstruction is not supported by the specific model version (gemini-pro might not support it in node SDK yet depending on version,
      // but usually 2.5 does. Let's send it as preamble if needed.
      // Actually, let's prepend the system prompt to the first user message or history if we are unsure.
      // But new SDK supports systemInstruction. Let's hope. If not, we'll try prepending.
      // Safest strategy: Prepend system prompt to the user's message if it's the first turn, or rely on systemInstruction.
      // Let's rely on systemInstruction but if it ignores it, Zundamon might break character.
      // Let's fallback: Prepend to the latest message invisible context.

      const result = await chat.sendMessage(userText);
      // Only systemInstruction support is in specific models. gemini-2.5-flash is safer for system instructions.
      // Changing model to gemini-2.5-flash for speed and features.

      const response = result.response.text();
      setMessages((prev) => [...prev, { role: "model", text: response }]);
    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "うぅ…エラーが起きたのだ。APIキーが間違っているかもしれないのだ。もう一度確認してほしいのだ。",
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Switch to gemini-2.5-flash for better System Instruction support and speed
  const getModelName = () => "gemini-2.5-flash";

  // Re-implementation of handleSend to ensure model version usage
  const handleSendSafe = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input;
    setInput("");

    // Optimistically add user message
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setIsLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        systemInstruction: SYSTEM_PROMPT, // Using systemInstruction for stronger persona enforcement
      });

      // Valid history: User -> Model -> User ...
      const history = messages
        .filter((m) => !m.isError)
        .slice(1)
        .map((m) => ({
          role: m.role,
          parts: [{ text: m.text }],
        }));

      const chat = model.startChat({
        history: history,
        generationConfig: { maxOutputTokens: 1000 },
      });

      const result = await chat.sendMessage(userText);
      const response = result.response.text();
      setMessages((prev) => [...prev, { role: "model", text: response }]);

      // Play Voice
      await playVoice(response);
    } catch (error: any) {
      console.error(error);
      const errorMessage = error.message || "不明なエラー";
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: `エラーなのだ…！\n詳細: ${errorMessage}`,
          isError: true,
        },
      ]);
      // If error (e.g. 401), maybe allow resetting key
      if (errorMessage.includes("401") || errorMessage.includes("API key")) {
        setHasKey(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const toggleVoice = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerIcon}>
          <Image
            src="/zundamon.png"
            alt="Zundamon"
            width={36}
            height={36}
            style={{ borderRadius: "50%" }}
          />
        </div>
        <div className={styles.headerText}>
          <span className={styles.headerTitle}>ずんだもん</span>
          <span className={styles.headerStatus}>
            Active Now • Gemini 2.5 Flash
          </span>
          <span style={{ fontSize: "0.6rem", color: "#aaa", marginTop: "2px" }}>
            立ち絵: 坂本アヒル
          </span>
        </div>
        <button
          onClick={toggleVoice}
          style={{
            marginLeft: "auto",
            background: isVoiceEnabled ? "var(--zunda-green)" : "#eee",
            color: isVoiceEnabled ? "white" : "#888",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
            fontSize: "1.2rem",
          }}
          title={isVoiceEnabled ? "読み上げON" : "読み上げOFF"}
        >
          {isVoiceEnabled ? "🔊" : "🔇"}
        </button>
      </header>

      <div className={styles.chatWindow} ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`${styles.messageRow} ${
              msg.role === "user" ? styles.user : ""
            }`}
          >
            {msg.role === "model" && (
              <div className={styles.avatar}>
                <Image
                  src="/zundamon.png"
                  alt="Z"
                  width={36}
                  height={36}
                  style={{ borderRadius: "50%" }}
                />
              </div>
            )}
            <div
              className={`${styles.bubble} ${styles[msg.role]} ${
                msg.isError ? styles.error : ""
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${styles.messageRow}`}>
            <div className={styles.avatar}>
              <Image
                src="/zundamon.png"
                alt="Z"
                width={36}
                height={36}
                style={{ borderRadius: "50%" }}
              />
            </div>
            <div className={`${styles.bubble} ${styles.zundamon}`}>
              <div className={styles.typing}>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
                <span className={styles.dot}></span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.inputArea}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) =>
            e.key === "Enter" && !e.nativeEvent.isComposing && handleSendSafe()
          }
          placeholder="ずんだもんに話しかける..."
          disabled={isLoading || !hasKey}
        />
        <button
          className={styles.sendButton}
          onClick={handleSendSafe}
          disabled={isLoading || !hasKey || !input.trim()}
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>

      {!hasKey && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <Image
              src="/zundamon.png"
              alt="Zundamon"
              width={80}
              height={80}
              style={{ borderRadius: "50%", marginBottom: "10px" }}
            />
            <h2 className={styles.modalTitle}>APIキーが必要なのだ！</h2>
            <p>Gemini APIキーを入力して会話を始めるのだ。</p>
            <input
              className={styles.modalInput}
              type="password"
              placeholder="Google Gemini API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <button className={styles.modalButton} onClick={handleSaveKey}>
              はじめるのだ！
            </button>
            <p style={{ fontSize: "0.8rem", color: "#999", marginTop: "1rem" }}>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                style={{ textDecoration: "underline" }}
              >
                APIキーを取得する
              </a>
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
