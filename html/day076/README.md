# Day076

htmx で管理画面を作り、`hono-api` の `/api/day076` で CRUD 操作を提供するチュートリアルです。

## Files

- `index.html`: htmx を使った管理画面 UI
- `../../hono-api/src/api/day076.ts`: CRUD API

## Local check

1. `cd hono-api && npm install && npm run dev`
2. 別ターミナルで `cd html/day076 && python3 -m http.server 8000`
3. `http://localhost:8000` を開く

## Features

- **一覧表示**: 作品リストをテーブルで表示
- **新規作成**: モーダルフォームから title, content, author を入力して作成
- **編集**: 既存のアイテムを編集
- **削除**: アイテムを削除（確認ダイアログ付き）

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/day076` | 一覧取得（HTML フラグメント） |
| POST | `/api/day076` | 新規作成 |
| PUT | `/api/day076/:id` | 更新 |
| DELETE | `/api/day076/:id` | 削除 |

## API switching

- `localhost` / `127.0.0.1` / `::1` で開いた場合: `http://localhost:8787/api/day076`
- それ以外で開いた場合: `https://ruu-dev.com/api/day076`

GitHub Pages に配置する場合の想定 URL:

- `https://ruu2023.github.io/100-days-of-code-2026/html/day076/`
