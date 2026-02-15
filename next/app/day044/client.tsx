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
// Dockerfileのテンプレート生成（マルチステージ版）
  const generateDockerfile = () => {
    const { node, pkg, port } = answers;
    
    // パッケージマネージャーごとのコマンド
    const installCmd = pkg === "npm" ? "npm install" : pkg === "yarn" ? "yarn install" : "pnpm install";
    const buildCmd = pkg === "npm" ? "npm run build" : pkg === "yarn" ? "yarn build" : "pnpm build";
    const lockFile = pkg === "pnpm" ? "pnpm-lock.yaml" : pkg === "yarn" ? "yarn.lock" : "package-lock.json";
    const pnpmInstall = pkg === "pnpm" ? "RUN npm i -g pnpm\n" : "";

    return `FROM node:${node} AS base

# --- Stage 1: Dependencies ---
FROM base AS deps
WORKDIR /app
COPY package*.json ${lockFile === "package-lock.json" ? "" : lockFile} ./
${pnpmInstall}RUN ${installCmd}

# --- Stage 2: Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# next.config.js で output: 'standalone' を設定している前提
RUN ${pnpmInstall}${buildCmd}

# --- Stage 3: Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
# Cloud Run 用のポート設定
ENV PORT ${port}
EXPOSE ${port}

# ユーザー権限の設定（セキュリティ向上）
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs

# 必要最小限のファイルだけを builder からコピー
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# standaloneモードでは node server.js で起動
CMD ["node", "server.js"]`;
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
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                  1
                </div>
                <h3 className="font-bold text-slate-800">Next.js 設定の最適化</h3>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  マルチステージビルドを有効にするため、<code className="bg-slate-100 px-1 rounded text-pink-600">next.config.js</code> に以下の設定を追記してください。これにより、実行に必要な最小限のファイルのみが抽出されます。
                </p>

                <div className="relative">
                  <div className="absolute top-0 right-4 rounded-b-md bg-slate-700 px-2 py-1 text-[10px] font-mono text-slate-300 uppercase">
                    next.config.js
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-blue-300 leading-relaxed">
                    <code>{`
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 実行ファイルを最小化してイメージサイズを削減
  output: 'standalone', 
};

module.exports = nextConfig;`}</code>
                  </pre>
                </div>
                
                <div className="rounded-md bg-amber-50 p-3 border-l-4 border-amber-400">
                  <p className="text-xs text-amber-800 flex items-center gap-1">
                    <span className="font-bold">⚠️ 注意:</span>
                    App Routerを利用している場合、この設定がないとビルドが成功しても起動に失敗します。
                  </p>
                </div>
              </div>
            </section>


            <section className="rounded-xl bg-white p-6 shadow-sm border border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                  2
                </div>
                <h3 className="font-bold text-slate-800">.dockerignore の最適化</h3>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-slate-600">
                  <code className="bg-slate-100 px-1 rounded text-pink-600">プロジェクトルート/.dockerignore</code> に以下の設定を追記してください。ローカルの巨大な <code className="bg-slate-100 px-1 rounded text-pink-600">node_modules</code> やビルド済みのキャッシュを除外します。これにより、<span className="font-semibold text-slate-800">GCPへのアップロード時間が大幅に短縮</span>されます。
                </p>

                <div className="relative">
                  <div className="absolute top-0 right-4 rounded-b-md bg-slate-700 px-2 py-1 text-[10px] font-mono text-slate-300 uppercase">
                    .dockerignore
                  </div>
                  <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-sm text-blue-300 leading-relaxed">
                    <code>{`
node_modules
.next
.git.next
.git
.env*.local
.vscode
README.md
Dockerfile
.dockerignore`}</code>
                  </pre>
                </div>
                
                <div className="rounded-md bg-amber-50 p-3 border-l-4 border-amber-400">
                  <p className="text-xs text-amber-800 flex items-center gap-1">
                    これを設定しないと、数千個のファイルをクラウドに送信しようとしてデプロイが非常に遅くなります。
                  </p>
                </div>
              </div>
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