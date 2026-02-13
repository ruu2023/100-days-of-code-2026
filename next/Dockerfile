FROM node:22-slim AS base

# 1. 依存関係のインストール
WORKDIR /app

# package.json と、もしあれば package-lock.json の両方をコピーする設定
COPY package*.json ./

# ci ではなく install に変更（lockファイルがなくても生成して進めてくれます）
RUN npm install

# 2. ビルド
COPY . .
RUN npm run build

# 3. 実行用
ENV NODE_ENV production
ENV PORT 8080
EXPOSE 8080

# 実行コマンドを配列形式で正しく記述
CMD ["npm", "start"]