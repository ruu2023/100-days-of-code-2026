'use client';

import { useEffect, useState, useRef } from 'react';
import { Send, Users, MessageSquare } from 'lucide-react';

export default function ChatApp() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [userCount, setUserCount] = useState(0);
  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;
    const socket = new WebSocket(WS_URL);
    socketRef.current = socket;

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'count') {
        setUserCount(data.value);
      } else if (data.type === 'msg') {
        setMessages((prev) => [...prev, data.value]);
      } else if (data.type === 'clear') {
        setMessages([]);
      }
    };

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (socketRef.current && input.trim()) {
      socketRef.current.send(input);
      setInput('');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-neutral-900 rounded-3xl shadow-2xl overflow-hidden border border-neutral-800 flex flex-col h-[85vh]">
        {/* Header */}
        <header className="px-6 py-4 bg-neutral-800/50 backdrop-blur-md border-b border-neutral-700/50 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
              <MessageSquare size={20} />
            </div>
            <h1 className="font-bold text-lg tracking-tight">Chat Room</h1>
          </div>
          <div className="flex items-center gap-2 bg-neutral-800 px-3 py-1.5 rounded-full border border-neutral-700">
            <Users size={14} className="text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">{userCount} Online</span>
          </div>
        </header>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-2 opacity-50">
              <MessageSquare size={48} />
              <p className="text-sm">No messages yet. Say hello!</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-neutral-800 hover:bg-neutral-750 transition-colors border border-neutral-700/50 rounded-2xl p-4 shadow-sm w-fit max-w-[85%] rounded-bl-sm">
                  <p className="text-sm leading-relaxed text-neutral-200">{msg}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-neutral-800/30 border-t border-neutral-700/50 backdrop-blur-sm">
          <div className="relative flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
                  sendMessage();
                }
              }}
              placeholder="Type your message..."
              className="w-full bg-neutral-900 border border-neutral-700 text-neutral-100 placeholder:text-neutral-500 rounded-full py-3.5 pl-5 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all shadow-inner"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="absolute right-1.5 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-neutral-700 disabled:text-neutral-500 text-white rounded-full transition-all shadow-lg hover:shadow-blue-500/20 active:scale-95"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}