# Day075

htmx で検索 UI を作り、`hono-api` の `/api/day075/search` から HTML フラグメントを返すチュートリアルです。

## Files

- `index.html`: htmx を使った検索 UI
- `../../hono-api/src/api/day075.ts`: 検索 API

## Local check

1. `cd hono-api && npm install && npm run dev`
2. 別ターミナルで `cd html/day075 && python3 -m http.server 8000`
3. `http://localhost:8000` を開く

ローカル静的配信から API を叩けるように、Workers 側の CORS は `localhost` / `127.0.0.1` を許可しています。
