"use client";

import { useState, useRef, useEffect } from "react";
import { sendChatMessage } from "./actions";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Bot, User, Loader2 } from "lucide-react";

interface Message {
  role: string;
  content: string;
}

export default function ChatPage() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const newMessages: Message[] = [...messages, { role: "user", content: input }];
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
          try {
            const json = JSON.parse(line);
            if (json.message?.content) {
              assistantMessage += json.message.content;
              // 逐次更新
              setMessages((prev) => [
                ...prev.slice(0, -1),
                { role: "assistant", content: assistantMessage },
              ]);
            }
          } catch {
            // JSONパースエラーは無視
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
    <div className="h-screen bg-gradient-to-b from-background to-muted/30 p-4 overflow-hidden">
      <div className="max-w-3xl mx-auto flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b">
          <Avatar className="size-10">
            <AvatarImage src="/bot-avatar.png" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              <Bot className="size-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-semibold">LFM 2.5 Chat</h1>
            <p className="text-xs text-muted-foreground">ローカルAIアシスタント</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="h-0 flex-1 py-4">
          <div className="space-y-4 pr-4">
            {messages.length === 0 && (
              <div className="text-center py-12">
                <Bot className="size-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">メッセージを入力して会話を始めましょう</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="size-8 mt-1">
                  {m.role === "user" ? (
                    <>
                      <AvatarImage />
                      <AvatarFallback className="bg-secondary">
                        <User className="size-4" />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src="/bot-avatar.png" />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="size-4" />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                <Card
                  className={`max-w-[80%] ${
                    m.role === "user"
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/50"
                  }`}
                >
                  <CardContent className="p-3">
                    <div className="markdown-content text-sm leading-relaxed">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <p className="mb-2 last:mb-0">{children}</p>
                          ),
                          a: ({ children, href }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-500 underline hover:text-blue-600"
                            >
                              {children}
                            </a>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-4 mb-2">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-4 mb-2">{children}</ol>
                          ),
                          li: ({ children }) => (
                            <li className="mb-1">{children}</li>
                          ),
                          h1: ({ children }) => (
                            <h1 className="text-xl font-bold mb-2">{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-lg font-bold mb-2">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-base font-bold mb-2">{children}</h3>
                          ),
                          code: ({ className, children, ...props }) => {
                            const match = /language-(\w+)/.exec(className || "");
                            const isInline = !match;
                            return isInline ? (
                              <code
                                className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono"
                                {...props}
                              >
                                {children}
                              </code>
                            ) : (
                              <pre className="bg-muted p-3 rounded-lg overflow-x-auto mb-2">
                                <code className={`${className || ""} text-xs font-mono`} {...props}>
                                  {children}
                                </code>
                              </pre>
                            );
                          },
                          pre: ({ children }) => <>{children}</>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-muted-foreground pl-3 italic text-muted-foreground mb-2">
                              {children}
                            </blockquote>
                          ),
                          hr: () => <hr className="my-3 border-border" />,
                          table: ({ children }) => (
                            <div className="overflow-x-auto mb-2">
                              <table className="w-full border-collapse border border-border">
                                {children}
                              </table>
                            </div>
                          ),
                          th: ({ children }) => (
                            <th className="border border-border px-2 py-1 bg-muted font-semibold">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="border border-border px-2 py-1">{children}</td>
                          ),
                        }}
                      >
                        {m.content}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input */}
        <div className="pt-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="メッセージを入力..."
              disabled={loading}
              className="flex-1"
            />
            <Button type="submit" disabled={loading || !input.trim()}>
              {loading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              <span className="sr-only">送信</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
