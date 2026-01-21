"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, Send } from "lucide-react";
import { MoodSelector } from "./components/MoodSelector";
import { Log, Timeline } from "./components/Timeline";

export default function MindFlowPage() {
  const [mood, setMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("mindflow-logs");
    if (saved) {
      try {
        setLogs(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse logs", e);
      }
    }
  }, []);

  // Save to localStorage whenever logs change
  useEffect(() => {
    localStorage.setItem("mindflow-logs", JSON.stringify(logs));
  }, [logs]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood) return;

    const newLog: Log = {
      id: crypto.randomUUID(),
      mood,
      note,
      timestamp: new Date().toISOString(),
    };

    setLogs([newLog, ...logs]);
    setMood(null);
    setNote("");
  };

  const handleDelete = (id: string) => {
    setLogs(logs.filter((log) => log.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="max-w-xl mx-auto px-4 py-8">
        <header className="flex items-center gap-2 mb-8">
          <div className="bg-indigo-600 p-2 rounded-lg text-white">
            <Brain size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-800">
            MindFlow
          </h1>
        </header>

        {/* Input Section */}
        <section className="mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100"
          >
            <h2 className="text-center text-lg font-medium text-slate-600 mb-6">
              How are you feeling?
            </h2>

            <MoodSelector currentMood={mood} onSelect={setMood} />

            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Write a short note... (optional)"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pr-12 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
              />
              <button
                type="submit"
                disabled={!mood}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-indigo-600 disabled:text-slate-300 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <Send size={20} />
              </button>
            </form>
          </motion.div>
        </section>

        {/* Timeline Section */}
        <section>
          <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-semibold text-slate-700">Recent Logs</h3>
            <span className="text-xs text-slate-400">
              {logs.length} entries
            </span>
          </div>
          <Timeline logs={logs} onDelete={handleDelete} />
        </section>
      </div>
    </div>
  );
}
