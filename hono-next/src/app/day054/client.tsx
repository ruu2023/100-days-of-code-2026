"use client";

import { useSql } from "@/hooks/useSql";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2, Database, Layout, Play, RotateCcw, Smartphone } from "lucide-react";
import { useState } from "react";

const PROBLEMS = [
  {
    id: 1,
    title: "全てのユーザーを取得",
    description: "users テーブルから全てのカラムを取得してください。",
    target: "SELECT * FROM users;",
    type: "query"
  },
  {
    id: 2,
    title: "役割(role)が 'User' の人を抽出",
    description: "role が 'User' であるユーザーの名前(name)を全て取得してください。",
    target: "SELECT name FROM users WHERE role = 'User';",
    type: "query"
  },
  {
    id: 3,
    title: "スコアが高い順に並べ替え",
    description: "全てのユーザーを score が高い順（降順）に並べ替えて取得してください。",
    target: "SELECT * FROM users ORDER BY score DESC;",
    type: "query"
  },
  {
    id: 4,
    title: "【番外編】インデックス・シミュレーター",
    description: "大量のデータに対する検索速度が、インデックス（索引）の有無によってどれほど劇的に変わるかを検証します。",
    type: "simulator"
  }
];

function SimulatorPanel({
  onLoadData,
  onSetQuery,
  timeWithoutIndex,
  timeWithIndex,
}: {
  onLoadData: (count: number) => Promise<void>;
  onSetQuery: (query: string) => void;
  timeWithoutIndex: number | null;
  timeWithIndex: number | null;
}) {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (count: number) => {
    setIsGenerating(true);
    await onLoadData(count);
    setIsGenerating(false);
    if (step === 1) setStep(2);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-4">
      <div className={`flex-1 p-4 rounded-xl border space-y-3 relative transition-all ${step >= 1 ? "bg-white/5 border-white/10" : "bg-white/5 opacity-40 border-white/5"}`}>
        <h4 className="text-sm font-semibold text-zinc-300">1. データセット生成</h4>
        <p className="text-xs text-zinc-400">ダミーユーザーを作成します</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleGenerate(100000)}
            disabled={isGenerating}
            className="w-full py-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {isGenerating ? "生成中..." : "10万件を生成"}
          </button>
          <button
            onClick={() => handleGenerate(1000000)}
            disabled={isGenerating}
            className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-400 border border-indigo-500/30 font-medium rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {isGenerating ? "生成中..." : "100万件を生成 (重いので注意)"}
          </button>
        </div>
      </div>

      <div className={`flex-1 p-4 rounded-xl border space-y-3 relative transition-all ${step >= 2 ? "bg-white/5 border-white/10" : "bg-white/5 opacity-40 border-white/5 pointer-events-none"}`}>
        <h4 className="text-sm font-semibold text-zinc-300">2. インデックスなし検索</h4>
        <p className="text-xs text-zinc-400 mb-2">エディタにクエリを挿入して実行してください</p>
        <button
          onClick={() => onSetQuery("SELECT * FROM users WHERE score = 9999;")}
          className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg text-sm transition-colors"
        >
          サンプルクエリ挿入
        </button>
        {timeWithoutIndex !== null && (
          <div className="absolute top-4 right-4 text-xs font-mono text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
            {timeWithoutIndex.toFixed(2)}ms
          </div>
        )}
        {step === 2 && timeWithoutIndex !== null && (
          <button
            onClick={() => setStep(3)}
            className="w-full py-2 mt-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold rounded-lg text-xs transition-colors shadow-lg shadow-amber-500/20"
          >
            次へ進む
          </button>
        )}
      </div>

      <div className={`flex-1 p-4 rounded-xl border space-y-3 relative transition-all ${step >= 3 ? "bg-white/5 border-white/10" : "bg-white/5 opacity-40 border-white/5 pointer-events-none"}`}>
        <h4 className="text-sm font-semibold text-zinc-300">3. インデックスあり検索</h4>
        <p className="text-xs text-zinc-400 mb-2">インデックス作成後、再検索してください</p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onSetQuery("CREATE INDEX idx_score ON users(score);")}
            className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg text-sm transition-colors"
          >
             CREATE INDEX挿入
          </button>
          <button
            onClick={() => onSetQuery("SELECT * FROM users WHERE score = 9999;")}
            className="w-full py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 font-medium rounded-lg text-sm transition-colors"
          >
            比較用SELECT挿入
          </button>
        </div>
        {timeWithIndex !== null && (
          <div className="absolute top-4 right-4 text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">
            {timeWithIndex.toFixed(2)}ms
          </div>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  const { runQuery, loadData, loading, error, isReady } = useSql();
  const [currentProblemIdx, setCurrentProblemIdx] = useState(3);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [queryTime, setQueryTime] = useState<number | null>(null);
  const [timeWithoutIndex, setTimeWithoutIndex] = useState<number | null>(null);
  const [timeWithIndex, setTimeWithIndex] = useState<number | null>(null);
  const [hasIndex, setHasIndex] = useState(false);

  const currentProblem = PROBLEMS[currentProblemIdx];

  const handleExecute = () => {
    const { results: res, timeMs } = runQuery(query);

    console.log("Query Time:", timeMs, "ms", res);
    
    // Store execution time
    setQueryTime(timeMs);

    // Track state for the Simulator stage
    if (currentProblem.type === "simulator") {
        const upperQuery = query.toUpperCase();
        if (upperQuery.includes("CREATE INDEX")) {
            setHasIndex(true);
        } else if (upperQuery.includes("SELECT")) {
            if (hasIndex) {
                setTimeWithIndex(timeMs);
            } else {
                setTimeWithoutIndex(timeMs);
            }
        }
    }

    if (res && res.length > 0) {
      // Create a shallow copy and cap at 100 rows to prevent rendering crashes
      const safeResults = JSON.parse(JSON.stringify(res));
      if (safeResults[0] && safeResults[0].values.length > 100) {
        safeResults[0].values = safeResults[0].values.slice(0, 100);
      }
      setResults(safeResults);
      
      // Auto-validate if it's a curriculum problem
      if (currentProblem.type === "query" && currentProblem.target) {
        const { results: targetRes } = runQuery(currentProblem.target);
        
        const resValues = res[0]?.values;
        const targetValues = targetRes?.[0]?.values;
        
        if (JSON.stringify(resValues) === JSON.stringify(targetValues)) {
          setIsCorrect(true);
        } else {
          setIsCorrect(false);
        }
      }
    } else {
      setResults([]);
      setIsCorrect(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setIsCorrect(null);
    setQueryTime(null);
    setTimeWithoutIndex(null);
    setTimeWithIndex(null);
  };

  const handleLoadData = async (count: number) => {
    await loadData(count);
    setHasIndex(false);
    setTimeWithoutIndex(null);
    setTimeWithIndex(null);
    setResults([]);
    setQueryTime(null);
  };

  const addKeyword = (keyword: string) => {
    setQuery((prev) => prev + (prev.endsWith(" ") || prev === "" ? "" : " ") + keyword + " ");
  };

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Database className="w-12 h-12 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen p-4 pb-24 md:p-8">
      <div className="gradient-bg" />
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
              <Database className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">SQL DRILL</h1>
          </div>
          <div className="flex gap-2">
             <div className="px-3 py-1 text-xs font-semibold text-blue-400 border border-blue-400/30 rounded-full glass">
               Day 054
             </div>
          </div>
        </header>

        {/* Conditional Header / Control Area */}
        {currentProblem.type === "query" ? (
          <section className="glass p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-blue-400 uppercase tracking-wider">Problem {currentProblem.id}</h2>
              <span className="text-xs text-zinc-500">{currentProblemIdx + 1} / {PROBLEMS.length}</span>
            </div>
            <h3 className="text-xl font-semibold">{currentProblem.title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{currentProblem.description}</p>
          </section>
        ) : (
          <section className="glass p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-blue-400 uppercase tracking-wider">SQL Index Simulator (Final Stage)</h2>
              <span className="text-xs text-zinc-500">{currentProblemIdx + 1} / {PROBLEMS.length}</span>
            </div>
            <h3 className="text-xl font-semibold">{currentProblem.title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {currentProblem.description}
            </p>

            <SimulatorPanel
              onLoadData={handleLoadData}
              onSetQuery={setQuery}
              timeWithoutIndex={timeWithoutIndex}
              timeWithIndex={timeWithIndex}
            />
          </section>
        )}

        {/* Editor Area */}
        <section className="space-y-4">
          <div className="glass p-2 flex flex-wrap gap-2 overflow-x-auto no-scrollbar">
            {["SELECT", "*", "FROM", "WHERE", "ORDER BY", "DESC", "users", "name", "role", "score"].map((kw) => (
              <button
                key={kw}
                onClick={() => addKeyword(kw)}
                className="px-3 py-1.5 text-xs font-mono rounded-lg glass-button whitespace-nowrap"
              >
                {kw}
              </button>
            ))}
          </div>

          <div className="relative group">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ここに SQL を入力してください..."
              className="w-full h-40 p-4 bg-black/40 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-mono text-sm resize-none transition-all"
            />
            {error && (
              <div className="absolute bottom-4 left-4 right-4 p-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={handleClear} className="p-2 glass-button rounded-xl text-zinc-400">
                <RotateCcw className="w-5 h-5" />
              </button>
              <button 
                onClick={handleExecute}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>実行</span>
              </button>
            </div>
          </div>
        </section>

        {/* Results */}
        <AnimatePresence mode="wait">
          {(results.length > 0 || isCorrect !== null) && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="glass overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                <span className="text-sm font-medium text-zinc-400">Execution Result</span>
                
                {isCorrect === true && currentProblem.type === "query" && (
                  <div className="flex items-center gap-1.5 text-green-400 text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>正解！</span>
                  </div>
                )}
                {isCorrect === false && results.length > 0 && currentProblem.type === "query" && (
                  <div className="flex items-center gap-1.5 text-amber-400 text-sm font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    <span>不正解（結果が異なります）</span>
                  </div>
                )}

                {queryTime !== null && (
                  <div className="flex items-center gap-1.5 text-blue-400 text-sm font-mono ml-auto pl-4">
                    <span>⏱ {queryTime.toFixed(2)} ms</span>
                  </div>
                )}
              </div>
              <div className="overflow-x-auto">
                {results.length > 0 ? (
                  <div className="flex flex-col">
                    <table className="w-full text-left text-sm">
                    <thead className="bg-white/5">
                      <tr>
                        {(results[0].columns || results[0].lc).map((col: string) => (
                          <th key={col} className="px-6 py-3 font-semibold text-zinc-300">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {results[0].values.map((row: any[], i: number) => (
                        <tr key={i} className="hover:bg-white/5 transition-colors">
                          {row.map((val: any, j: number) => (
                            <td key={j} className="px-6 py-3 text-zinc-400 font-mono">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="p-4 bg-white/5 border-t border-white/5 text-xs text-zinc-500 flex justify-between">
                    <span>{results[0]?.values?.length > 100 ? "表示上限 (先頭100件を表示中)" : `結果: ${results[0]?.values?.length || 0} 件`}</span>
                  </div>
                  </div>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-zinc-500">
                    <Database className="w-8 h-8 mb-3 opacity-20" />
                    <p>表示する結果がありません</p>
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Next Problem Button */}
        {(isCorrect || currentProblem.type === "simulator") && currentProblemIdx < PROBLEMS.length - 1 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex justify-center pt-4"
          >
            <button
              onClick={() => {
                setCurrentProblemIdx((prev) => prev + 1);
                handleClear();
              }}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
            >
              次の問題へ
            </button>
          </motion.div>
        )}
        {/* End of Main Content */}
      </div>

      {/* iPhone Navigation Bar Placeholder (for feel) */}
      <div className="fixed bottom-0 left-0 right-0 h-16 glass rounded-t-3xl border-t-0 flex items-center justify-around px-8 md:hidden">
        <div className="flex flex-col items-center gap-1 text-blue-500">
          <Layout className="w-6 h-6" />
          <span className="text-[10px] font-medium">Practice</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-zinc-500">
          <Database className="w-6 h-6" />
          <span className="text-[10px] font-medium">Database</span>
        </div>
        <div className="flex flex-col items-center gap-1 text-zinc-500">
          <Smartphone className="w-6 h-6" />
          <span className="text-[10px] font-medium">Profile</span>
        </div>
      </div>
    </main>
  );
}
