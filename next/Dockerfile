# --- Stage 1: Base (共通設定) ---
FROM node:22-slim AS base
WORKDIR /app
# 共通で使う環境変数
ENV NODE_ENV production

# --- Stage 2: Dependencies (依存関係のインストール) ---
FROM base AS deps
# ビルドに必要なツールをインストールする場合があるため、一時的にコピー
COPY package*.json ./
# 開発用ライブラリも含む全ての依存関係をインストール
RUN npm install

# --- Stage 3: Builder (ビルド実行) ---
FROM base AS builder
COPY . .
# deps ステージからインストール済みの node_modules をコピー
COPY --from=deps /app/node_modules ./node_modules
# Next.js のビルドを実行
RUN npm run build

# --- Stage 4: Runner (実行用イメージ) ---
FROM base AS runner
# Cloud Run 用のポート設定
ENV PORT 8080
EXPOSE 8080

# 1. ビルド成果物 (.next) の中から、実行に必要な static ファイルをコピー
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# 2. standalone モードの成果物をコピー (後述の next.config.js 設定が必要)
COPY --from=builder /app/.next/standalone ./

# 実行コマンド (standaloneモードでは server.js を直接叩くのが最速)
CMD ["node", "server.js"]