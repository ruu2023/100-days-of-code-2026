"use client";

import React, { useState } from "react";

/**
 * GCP + Next.js Dockerfile Generator
 * 100 Days of Code: Day X
 */

// 質問の定義
const STEPS = [
  {
    id: "node",
    question: "Node.js のバージョンは？",
    options: ["18-slim", "20-slim", "22-slim"],
  },
  {
    id: "pkg",
    question: "利用するパッケージマネージャーは？",
    options: ["npm", "yarn", "pnpm"],
  },
  {
    id: "port",
    question: "コンテナのポート番号（GCP推奨は8080）",
    options: ["8080", "3000"],
  },
];

export default function DockerPromptMaker() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  // 回答を選択した時の処理
  const handleAnswer = (value: string) => {
    const key = STEPS[currentStep].id;
    setAnswers((prev) => ({ ...prev, [key]: value }));

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsFinished(true);
    }
  };

  // Dockerfileのテンプレート生成
  const generateDockerfile = () => {
    const { node, pkg, port } = answers;
    
    // npm ci は lockファイルが必須で厳格すぎるため、install に変更して安定性を向上
    const installCmd = pkg === "npm" ? "npm install" : pkg === "yarn" ? "yarn install" : "pnpm install";
    const buildCmd = pkg === "npm" ? "npm run build" : pkg === "yarn" ? "yarn build" : "pnpm build";
    
    // CMD を ["npm", "start"] のような正しい配列形式にするための準備
    const startCmdArray = pkg === "npm" ? '"npm", "start"' : pkg === "yarn" ? '"yarn", "start"' : '"pnpm", "start"';

    return `FROM node:${node} AS base

# 1. 依存関係のインストール
WORKDIR /app
# package-lock.json がなくてもエラーにならないようワイルドカードを使用
COPY package*.json ${pkg === "pnpm" ? "pnpm-lock.yaml" : pkg === "yarn" ? "yarn.lock" : ""} ./
RUN ${pkg === "pnpm" ? "npm i -g pnpm && " : ""}${installCmd}

# 2. ビルド
COPY . .
RUN ${buildCmd}

# 3. 実行用
ENV NODE_ENV production
# Cloud Run は PORT 環境変数を見ているため明示的に設定
ENV PORT ${port}
EXPOSE ${port}

CMD [${startCmdArray}]`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <div className="mx-auto max-w-2xl">
        <header className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-blue-600">GCP Docker Architect</h1>
          <p className="mt-2 text-slate-500">Next.js を Cloud Run へ最速で届ける</p>
        </header>

        {!isFinished ? (
          <div className="rounded-xl bg-white p-8 shadow-sm border border-slate-200">
            {/* プログレスバー */}
            <div className="mb-6 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300" 
                style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
              />
            </div>

            <h2 className="mb-6 text-xl font-semibold">{STEPS[currentStep].question}</h2>
            <div className="grid gap-3">
              {STEPS[currentStep].options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  className="w-full rounded-lg border-2 border-slate-100 p-4 text-left hover:border-blue-400 hover:bg-blue-50 transition-all"
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-700">
            {/* 結果表示セクション */}
            <section className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
              <h3 className="mb-3 font-bold text-slate-700">1. Dockerfile</h3>
              <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-100">
                <code>{generateDockerfile()}</code>
              </pre>
            </section>

            <section className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
              <h3 className="mb-3 font-bold text-slate-700">2. GCP デプロイ手順</h3>
              <ol className="list-decimal pl-5 text-sm space-y-2 text-slate-600">
                <li><code className="bg-slate-100 px-1">gcloud auth login</code> でログイン</li>
                <li>プロジェクトIDを設定: <code className="bg-slate-100 px-1">gcloud config set project [ID]</code></li>
                <li>ビルド & デプロイ: 
                  <pre className="mt-2 bg-slate-800 text-slate-200 p-3 rounded">
                    gcloud run deploy --source .
                  </pre>
                </li>
              </ol>
            </section>

            <button 
              onClick={() => { setIsFinished(false); setCurrentStep(0); }}
              className="w-full py-3 text-blue-600 font-medium hover:underline"
            >
              最初からやり直す
            </button>
          </div>
        )}
      </div>
    </div>
  );
}