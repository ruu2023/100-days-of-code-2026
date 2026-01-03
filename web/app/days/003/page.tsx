"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Question {
  id: string;
  question: string;
  options: string[];
}

interface AnswerResponse {
  correct: boolean;
  explanation: string;
}

export default function Day003() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [result, setResult] = useState<AnswerResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedOption(null);
    try {
      const res = await fetch("http://localhost:8080/quiz");
      if (!res.ok) throw new Error("Failed to fetch question");
      const data = await res.json();
      setQuestion(data);
    } catch (err) {
      setError("Is the Go server running? (cd go/day003 && go run .)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  const handleSubmit = async () => {
    if (!question || !selectedOption) return;

    try {
      const res = await fetch("http://localhost:8080/quiz/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: question.id,
          answer: selectedOption,
        }),
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError("Failed to submit answer");
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="max-w-2xl mx-auto flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Go Quiz API Client</h1>
          <Link href="/" className="text-blue-500 hover:underline">
            ← Back to Top
          </Link>
        </div>

        <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl">
          {loading ? (
            <p className="text-center py-10">クイズを読み込み中です...</p>
          ) : error ? (
            <div className="text-center py-10 text-red-400">
              <p>{error}</p>
              <button
                onClick={fetchQuestion}
                className="mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
              >
                Retry
              </button>
            </div>
          ) : question ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Q. {question.question}</h2>

              <div className="grid gap-3">
                {question.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => !result && setSelectedOption(option)}
                    disabled={!!result}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all ${
                      selectedOption === option
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-white/10 hover:bg-white/5"
                    } ${result ? "cursor-default" : ""}`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {!result ? (
                <button
                  onClick={handleSubmit}
                  disabled={!selectedOption}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-bold transition-all"
                >
                  解答を見る
                </button>
              ) : (
                <div
                  className={`p-4 rounded-xl border ${
                    result.correct
                      ? "bg-green-500/10 border-green-500/50 text-green-200"
                      : "bg-red-500/10 border-red-500/50 text-red-200"
                  }`}
                >
                  <p className="font-bold mb-1">
                    {result.correct ? "🎉 Good Answer" : "❌ Bad Answer"}
                  </p>
                  <p>{result.explanation}</p>

                  <button
                    onClick={fetchQuestion}
                    className="mt-4 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition w-full text-white"
                  >
                    次の問題へ →
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
