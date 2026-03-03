"use client";

import { useState } from "react";
import Link from "next/link";

type Fortune = {
  label: string;
  message: string;
  color: string;
};

const fortunes: Fortune[] = [
  {
    label: "大吉",
    message: "最初のデプロイに成功したよ! 🚀",
    color: "text-green-500",
  },
  {
    label: "中吉",
    message: "StackOverFlowで完璧な回答を見つけられた. ✨",
    color: "text-blue-500",
  },
  {
    label: "小吉",
    message: "ビルドは通った、けどテストに通らない. 🤔",
    color: "text-yellow-500",
  },
  {
    label: "末吉",
    message: "簡単にコンフリクトを解消",
    color: "text-orange-500",
  },
  { label: "吉", message: "イージーミスに気を付ける", color: "text-red-500" },
  { label: "凶", message: "無限ループ突入", color: "text-purple-600" },
];

export default function Day001() {
  const [fortune, setFortune] = useState<Fortune | null>(null);

  const drawFortune = () => {
    const random = fortunes[Math.floor(Math.random() * fortunes.length)];
    setFortune(random);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-900 p-4 font-sans">
      <div className="text-center max-w-md w-full">
        <h1 className="text-4xl font-bold mb-2">Day 1: Tech Omikuji</h1>
        <p className="text-gray-500 mb-8">
          本日のおみくじ for 100-day challenge.
        </p>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 min-h-[200px] flex flex-col items-center justify-center transition-all duration-300">
          {fortune ? (
            <div className="animate-in fade-in zoom-in duration-300">
              <h2 className={`text-3xl font-bold mb-4 ${fortune.color}`}>
                {fortune.label}
              </h2>
              <p className="text-lg text-gray-700">{fortune.message}</p>
            </div>
          ) : (
            <p className="text-gray-400 italic">今日のおみくじを引いてみよう</p>
          )}
        </div>

        <button
          onClick={drawFortune}
          className="w-full bg-black text-white hover:bg-gray-800 transition-colors font-bold py-4 px-8 rounded-full text-lg shadow-lg active:scale-95 duration-100"
        >
          おみくじを引く
        </button>

        <div className="mt-12">
          <Link
            href="/"
            className="text-sm text-gray-400 hover:text-gray-600 underline"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
