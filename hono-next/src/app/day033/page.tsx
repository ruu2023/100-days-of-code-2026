"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  GitBranch,
  Activity,
  User,
  CheckCircle2,
  XCircle,
  Trophy,
  Flame
} from "lucide-react";

type Question = {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    feedback: string;
  }[];
};

type NPC = {
  id: "security" | "git" | "performance";
  name: string;
  role: string;
  icon: React.ReactNode;
  color: string;
  x: number;
  y: number;
  questions: Question[];
};

const NPCS: NPC[] = [
  {
    id: "security",
    name: "サム",
    role: "セキュリティの番人",
    icon: <ShieldCheck size={32} />,
    color: "bg-blue-600",
    x: 20,
    y: 30,
    questions: [
      {
        id: "q1",
        text: "APIキーが含まれた .env ファイルをうっかり公開リポジトリにコミットしてしまった！どうする？",
        options: [
          { id: "a", text: "すぐにリポジトリからファイルを削除する。", isCorrect: false, feedback: "Botは一瞬でGithubをスクレイピングしてるぞ。削除だけじゃ手遅れだ！" },
          { id: "b", text: "キーを無効化・再発行して、ファイルを削除する。", isCorrect: true, feedback: "正解！ 漏洩した前提で動くのが鉄則だ。" },
        ],
      },
      {
        id: "q2",
        text: "コメント欄にXSSの脆弱性があるとの報告が！",
        options: [
            { id: "a", text: "表示する前に、全ての入力をサニタイズ（無害化）する。", isCorrect: true, feedback: "その通り。ユーザー入力は絶対に信用するな。" },
            { id: "b", text: "コメント機能を完全に停止する。", isCorrect: false, feedback: "それはちょっと極端すぎないか？" }
        ]
      }
    ],
  },
  {
    id: "git",
    name: "ジーナ",
    role: "Git オペレーター",
    icon: <GitBranch size={32} />,
    color: "bg-purple-600",
    x: 80,
    y: 40,
    questions: [
      {
        id: "q1",
        text: "開発ブランチが main から50コミットも遅れてる。履歴をきれいに保ちたいなら？",
        options: [
          { id: "a", text: "git merge main", isCorrect: false, feedback: "マージも動くよ。" },
          { id: "b", text: "git rebase main", isCorrect: true, feedback: "正解！ 直線的な履歴の美しさよ。" },
        ],
      },
      {
        id: "q2",
        text: "ファイルの変更内容の一部だけをステージングしたい。",
        options: [
            { id: "a", text: "git add -p", isCorrect: true, feedback: "パッチモードは命の恩人ね。" },
            { id: "b", text: "git add .", isCorrect: false, feedback: "それだと全部入っちゃうわよ！" }
        ]
      }
    ],
  },
  {
    id: "performance",
    name: "ピート",
    role: "パフォーマンスの鬼",
    icon: <Activity size={32} />,
    color: "bg-orange-500",
    x: 50,
    y: 15,
    questions: [
      {
        id: "q1",
        text: "Reactアプリが重い...。リストが無駄に再レンダリングされてるみたいだ。",
        options: [
          { id: "a", text: "リスト項目を React.memo でラップする", isCorrect: true, feedback: "無駄なレンダリングを防ぐ第一歩として最適だね。" },
          { id: "b", text: "forceUpdate() を使う", isCorrect: false, feedback: "うわぁ... それは絶対にやめてくれ。" },
        ],
      },
       {
        id: "q2",
        text: "APIレスポンスが巨大すぎる。でも必要なのはユーザー名だけだ。",
        options: [
            { id: "a", text: "クライアント側でフィルタリングする。", isCorrect: false, feedback: "帯域の無駄遣いには変わらないぞ！" },
            { id: "b", text: "GraphQLか、専用のDTOエンドポイントを使う。", isCorrect: true, feedback: "その通り。" }
        ]
      }
    ],
  },
];

export default function DebuggingTavern() {
  const [playerPos, setPlayerPos] = useState({ x: 50, y: 80 });
  const [targetNPC, setTargetNPC] = useState<NPC | null>(null);
  const [isConversing, setIsConversing] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [completedNPCs, setCompletedNPCs] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<{ text: string, isCorrect: boolean } | null>(null);

  const handleMoveToNPC = (npc: NPC) => {
    if (isConversing) return;
    setPlayerPos({ x: npc.x, y: npc.y + 10 });
    setTargetNPC(npc);
    setTimeout(() => {
        setIsConversing(true);
        setCurrentQuestionIndex(0);
        setFeedback(null);
    }, 800);
  };

  const handleAnswer = (isCorrect: boolean, feedbackText: string) => {
    setFeedback({ text: feedbackText, isCorrect });

    if (isCorrect) {
        setScore(prev => prev + 100 + (streak * 10));
        setStreak(prev => prev + 1);
    } else {
        setStreak(0);
    }

    setTimeout(() => {
       if (isCorrect) {
          nextQuestion();
       } else {
          setFeedback(null);
       }
    }, 2000);
  };

  const nextQuestion = () => {
      setFeedback(null);
      if (targetNPC && currentQuestionIndex < targetNPC.questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
      } else {
          if(targetNPC && !completedNPCs.includes(targetNPC.id)) {
              setCompletedNPCs(prev => [...prev, targetNPC.id]);
          }
          setIsConversing(false);
          setTargetNPC(null);
      }
  };

  const isAllComplete = completedNPCs.length === NPCS.length;

  return (
    <div className="min-h-screen bg-[#1a1a2e] text-white font-sans overflow-hidden flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl aspect-[4/3] bg-[#252540] rounded-xl shadow-2xl border-4 border-[#3a3a5e] overflow-hidden">
        <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}
        ></div>

        <div className="absolute top-4 left-4 flex gap-4 z-10">
             <div className="bg-black/50 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <Trophy size={16} className="text-yellow-400" />
                <span className="font-bold text-yellow-100">{score}</span>
             </div>
             <div className="bg-black/50 px-4 py-2 rounded-full border border-white/10 flex items-center gap-2">
                <Flame size={16} className={`${streak > 2 ? 'text-orange-500' : 'text-gray-400'}`} />
                <span className="font-bold text-yellow-100">連続正解: {streak}</span>
             </div>
        </div>

        <div className="absolute top-4 right-4 bg-black/50 p-4 rounded-lg border border-white/10 z-10 backdrop-blur-sm">
            <h3 className="text-xs uppercase tracking-wider text-gray-400 mb-2">リリース前チェック</h3>
            <div className="flex flex-col gap-2">
                {NPCS.map(npc => (
                    <div key={npc.id} className="flex items-center gap-2 text-sm">
                        {completedNPCs.includes(npc.id) ? (
                            <CheckCircle2 size={16} className="text-green-400" />
                        ) : (
                            <div className="w-4 h-4 rounded-full border border-gray-500" />
                        )}
                        <span className={completedNPCs.includes(npc.id) ? "text-gray-500 line-through" : "text-gray-200"}>
                            {npc.role}
                        </span>
                    </div>
                ))}
            </div>
        </div>

        <div className="absolute top-[10%] left-[45%] w-[10%] h-[15%] bg-[#151525] rounded-t-xl opacity-50"></div>

        {NPCS.map((npc) => (
          <div
            key={npc.id}
            className={`absolute flex flex-col items-center cursor-pointer transition-transform hover:scale-110 active:scale-95 group ${completedNPCs.includes(npc.id) ? 'opacity-50 grayscale' : ''}`}
            style={{ left: `${npc.x}%`, top: `${npc.y}%`, transform: 'translate(-50%, -50%)' }}
            onClick={() => handleMoveToNPC(npc)}
          >
            {!completedNPCs.includes(npc.id) && !isConversing && (
                <div className="absolute -top-12 bg-white text-black text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    話しかける
                </div>
            )}

            <div className={`w-16 h-16 rounded-2xl ${npc.color} flex items-center justify-center shadow-[0_4px_0_rgba(0,0,0,0.3)] border-2 border-white/20 z-0`}>
              {npc.icon}
            </div>
            <div className="mt-2 text-xs font-bold text-gray-400 bg-black/50 px-2 py-0.5 rounded-full">{npc.name}</div>
          </div>
        ))}

        <div
           className="absolute flex flex-col items-center z-10 pointer-events-none"
           style={{ left: `${playerPos.x}%`, top: `${playerPos.y}%`, transform: 'translate(-50%, -50%)' }}
        >
            <div className="w-14 h-14 rounded-full bg-indigo-500 border-4 border-indigo-300 flex items-center justify-center shadow-[0_10px_20px_rgba(0,0,0,0.5)] relative">
                <User size={24} className="text-white" />
            </div>
            <div className="mt-1 text-xs font-bold text-indigo-300">あなた</div>
        </div>

         {isConversing && targetNPC && (
                <div className="absolute bottom-8 left-8 right-8 bg-[#1f1f35]/95 border-2 border-[#4a4a6e] rounded-xl p-6 shadow-2xl backdrop-blur-md z-50 min-h-[200px] flex flex-col">
                    <div className="flex items-center gap-3 mb-4 border-b border-white/5 pb-4">
                        <div className={`p-2 rounded-lg ${targetNPC.color}`}>
                            {targetNPC.icon}
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-white">{targetNPC.name}</h2>
                            <p className="text-xs text-gray-400 uppercase tracking-widest">{targetNPC.role}</p>
                        </div>

                        <div className="ml-auto flex gap-1">
                             {targetNPC.questions.map((_, i) => (
                                 <div key={i} className={`h-1 w-8 rounded-full ${i <= currentQuestionIndex ? targetNPC.color : 'bg-gray-700'}`} />
                             ))}
                        </div>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-xl font-medium mb-6 leading-relaxed">
                            {targetNPC.questions[currentQuestionIndex].text}
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {targetNPC.questions[currentQuestionIndex].options.map((option) => (
                                <button
                                    key={option.id}
                                    disabled={feedback !== null}
                                    onClick={() => handleAnswer(option.isCorrect, option.feedback)}
                                    className="p-4 rounded-lg border-2 text-left transition-all relative overflow-hidden bg-white/5 border-white/10 hover:bg-white/10 hover:border-indigo-400"
                                >
                                    <span className="relative z-10 font-medium">{option.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {feedback && (
                        <div className={`absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20 rounded-lg text-center p-6 ${feedback.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                            {feedback.isCorrect ? <CheckCircle2 size={48} className="mb-4" /> : <XCircle size={48} className="mb-4" />}
                            <p className="text-2xl font-bold mb-2">{feedback.isCorrect ? "正解！" : "残念..."}</p>
                            <p className="text-white text-lg max-w-lg">{feedback.text}</p>
                        </div>
                    )}
                </div>
            )}

         {isAllComplete && (
             <div className="absolute inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center text-center p-8">
                 <Trophy size={80} className="text-yellow-400 mb-6" />
                 <h1 className="text-4xl font-bold text-white mb-4">リリース前チェック完了！</h1>
                 <p className="text-gray-400 text-xl mb-8">本番リリース前のバグ潰し、お見事！</p>
                 <div className="text-2xl font-bold text-yellow-500 mb-8">最終スコア: {score}</div>
                 <button onClick={() => window.location.reload()} className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full font-bold transition-all">
                     もう一度挑戦
                 </button>
             </div>
         )}
      </div>
    </div>
  );
}
