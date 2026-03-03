"use client";

import { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

type Transaction = {
  date: string;
  description: string;
  amount: number;
  type: "income" | "expense";
  category?: string;
};

export default function Page() {
  const [jsonInput, setJsonInput] = useState(`[
  { "date": "2024-01-15", "description": "売上 - サービスA", "amount": 50000, "type": "income", "category": "売上" },
  { "date": "2024-01-16", "description": "仕入 - 消耗品", "amount": 5000, "type": "expense", "category": "仕入" },
  { "date": "2024-01-20", "description": "売上 - サービスB", "amount": 30000, "type": "income", "category": "売上" },
  { "date": "2024-01-25", "description": "光熱費", "amount": 8000, "type": "expense", "category": "経費" },
  { "date": "2024-01-31", "description": "家賃", "amount": 100000, "type": "expense", "category": "経費" }
]`);
  const [parsedData, setParsedData] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const textTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 日付を月日に変換
  const formatDate = (dateStr: string) => {
    const match = dateStr.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return `${parseInt(match[2])}月${parseInt(match[3])}日`;
    }
    return dateStr;
  };

  // アイテムを文章に変換
  const itemToText = (item: Transaction) => {
    const dateText = formatDate(item.date);
    const amountText = `¥${item.amount.toLocaleString()}`;
    if (item.type === "income") {
      return `${dateText}の売上${amountText}`;
    } else {
      return `${dateText}の支出${amountText}`;
    }
  };

  // テキストを1文字ずつ表示するアニメーション
  useEffect(() => {
    if (currentIndex >= 0 && parsedData[currentIndex]) {
      const text = itemToText(parsedData[currentIndex]);
      setDisplayedText("");

      let charIndex = 0;
      if (textTimerRef.current) clearInterval(textTimerRef.current);

      textTimerRef.current = setInterval(() => {
        if (charIndex < text.length) {
          setDisplayedText(text.slice(0, charIndex + 1));
          charIndex++;
        } else {
          if (textTimerRef.current) clearInterval(textTimerRef.current);
        }
      }, 150);

      return () => {
        if (textTimerRef.current) clearInterval(textTimerRef.current);
      };
    }
  }, [currentIndex, parsedData]);

  // パクパクアニメーション
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, 150);
      return () => clearInterval(interval);
    } else {
      setMouthOpen(false);
    }
  }, [isPlaying]);

  // データ再生
  useEffect(() => {
    if (isPlaying && currentIndex < parsedData.length) {
      timerRef.current = setTimeout(() => {
        if (currentIndex < parsedData.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
          setDisplayedText("");
          setCurrentIndex(-1);
        }
      }, 3000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentIndex, parsedData.length]);

  const handleParse = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error("配列形式してください");
      }
      setParsedData(parsed);
      setError(null);
      setIsPreviewOpen(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "JSONパースエラー");
    }
  };

  const handleDownloadExcel = () => {
    let balance = 0;
    const header = ["日付", "勘定科目", "摘要", "収入", "支出", "残高"];
    const rows = parsedData.map((item) => {
      const income = item.type === "income" ? item.amount : 0;
      const expense = item.type === "expense" ? item.amount : 0;
      balance += income - expense;
      return [
        item.date,
        item.category || "",
        item.description,
        income,
        expense,
        balance,
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([header, ...rows]);
    ws["!cols"] = [
      { wch: 12 },
      { wch: 12 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "出納帳");
    XLSX.writeFile(wb, `出納帳_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleStart = () => {
    if (parsedData.length === 0) return;
    setCurrentIndex(0);
    setIsPlaying(true);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentIndex(-1);
    setDisplayedText("");
    if (textTimerRef.current) clearInterval(textTimerRef.current);
  };

  const totalIncome = parsedData
    .filter((d) => d.type === "income")
    .reduce((sum, d) => sum + d.amount, 0);
  const totalExpense = parsedData
    .filter((d) => d.type === "expense")
    .reduce((sum, d) => sum + d.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <div className="min-h-screen p-8 bg-gradient-to-b from-blue-200 to-purple-200">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-center text-white drop-shadow-lg">
          出納帳Excel出力
        </h1>

        {/* キャラクターエリア */}
        <div className="flex flex-col items-center mb-8">
          {/* 吹き出し */}
          <div className="relative mb-4">
            <div className="bg-white rounded-2xl px-6 py-4 shadow-lg max-w-md text-center relative min-h-[80px] flex items-center justify-center">
              {!isPlaying && currentIndex < 0 && !displayedText ? (
                <p className="text-lg font-bold text-gray-400">プレビュー後にSTARTで発表するよ</p>
              ) : displayedText ? (
                <p className="text-lg font-bold text-purple-700">{displayedText}</p>
              ) : null}
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[15px] border-t-white"></div>
            </div>
          </div>

          {/* キャラクター */}
          <div className="relative">
            <div
              className="w-32 h-28 bg-yellow-400 relative"
              style={{
                borderRadius: "50% 50% 45% 45% / 60% 60% 40% 40%",
              }}
            >
              <div className="absolute top-8 left-6 w-6 h-8 bg-black rounded-full">
                <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="absolute top-8 right-6 w-6 h-8 bg-black rounded-full">
                <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div
                className={`absolute top-14 left-1/2 -translate-x-1/2 w-8 h-4 bg-red-600 rounded-full transition-all duration-100 ${
                  mouthOpen ? "h-8" : "h-4"
                }`}
              ></div>
            </div>
            <div className="w-24 h-4 bg-black/20 rounded-full mx-auto -mt-2"></div>
          </div>

          {/* コントロールボタン */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={handleStart}
              disabled={isPlaying || parsedData.length === 0}
              className="px-6 py-3 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform"
            >
              ▶ START
            </button>
            <button
              onClick={handleStop}
              disabled={!isPlaying}
              className="px-6 py-3 bg-red-500 text-white font-bold rounded-full hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform"
            >
              ⏹ STOP
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">JSON入力</h2>
          <p className="text-sm text-gray-600 mb-2">
            以下のフォーマットのJSONを入力してください：
          </p>
          <pre className="bg-gray-100 p-2 rounded text-xs mb-4 overflow-x-auto">
{`[
  { "date": "2024-01-15", "description": "摘要", "amount": 50000, "type": "income", "category": "勘定科目" },
  { "date": "2024-01-16", "description": "摘要", "amount": 5000, "type": "expense", "category": "勘定科目" }
]`}
          </pre>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="w-full h-64 p-4 border rounded-md font-mono text-sm"
            placeholder="JSONを入力..."
          />
          {error && (
            <p className="text-red-500 mt-2 text-sm">{error}</p>
          )}
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleParse}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              プレビュー
            </button>
            {parsedData.length > 0 && (
              <button
                onClick={handleDownloadExcel}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Excelダウンロード
              </button>
            )}
          </div>
        </div>

        {isPreviewOpen && parsedData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">プレビュー</h2>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 p-4 rounded">
                <p className="text-sm text-gray-600">総収入</p>
                <p className="text-xl font-bold text-green-600">
                  ¥{totalIncome.toLocaleString()}
                </p>
              </div>
              <div className="bg-red-50 p-4 rounded">
                <p className="text-sm text-gray-600">総支出</p>
                <p className="text-xl font-bold text-red-600">
                  ¥{totalExpense.toLocaleString()}
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-gray-600">収支</p>
                <p className={`text-xl font-bold ${balance >= 0 ? "text-blue-600" : "text-red-600"}`}>
                  ¥{balance.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-2 text-left">日付</th>
                    <th className="p-2 text-left">勘定科目</th>
                    <th className="p-2 text-left">摘要</th>
                    <th className="p-2 text-right">収入</th>
                    <th className="p-2 text-right">支出</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((item, idx) => (
                    <tr key={idx} className={`border-b ${currentIndex === idx ? "bg-yellow-100" : ""}`}>
                      <td className="p-2">{item.date}</td>
                      <td className="p-2">{item.category || "-"}</td>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2 text-right text-green-600">
                        {item.type === "income" ? `¥${item.amount.toLocaleString()}` : "-"}
                      </td>
                      <td className="p-2 text-right text-red-600">
                        {item.type === "expense" ? `¥${item.amount.toLocaleString()}` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
