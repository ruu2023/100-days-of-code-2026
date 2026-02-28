# Next.js (Cloud Run) + Hono (Cloudflare Workers) + better-auth OAuth連携のトラブルシューティング記録

## 全体の課題
Next.jsフロントエンド（ドメインA）からHono APIサーバー（ドメインB）へと連携してGoogle OAuthを実行しようとした際、いくつかの認証に関するエラーが発生した。そのトラブル追跡と解決の経歴まとめ。

## 1. CORS エラーと Credentials 違反
**【現象】**
Next.js から Hono API への API リクエスト時に CORS エラーが発生。

**【原因】**
`hono-api/src/index.ts` の CORS 設定において：
- `origin` に `BETTER_AUTH_URL` 環境変数が使われていたが、未設定で `"*"` にフォールバックしていた
- 一方で `credentials: true` も設定されていた
- ブラウザの仕様として、`credentials: true` と `origin: "*"` の組み合わせは禁止されているためエラーとなった

**【解決】**
`origin` に許可するURL（Cloud RunのNext.jsのURL、ローカルホスト）を配列で明示的にハードコードした。

## 2. リダイレクト URL ミスマッチエラー
**【現象】**
Google ログイン画面に遷移した際、「redirect_uri mismatch」と表示され弾かれる。

**【原因】**
- Google Cloud Console 上での承認済みリダイレクトURI登録漏れ
- 根本原因として、API側の `BETTER_AUTH_URL` が誤って **Next.jsのURL** に設定されていた
- これにより better-auth が「`https://<nextjs-url>/api/auth/callback/google`」をコールバックURLとしてGoogleに渡してしまっていた（API側に返す必要があるのに間違ったURLに送ろうとしていた）

**【解決】**
`BETTER_AUTH_URL` を正しい **Workers APIのURL** (`https://hono-api.ruu2023.workers.dev`) に修正。

## 3. state_mismatch エラー
**【現象】**
Googleでの認証完了後、Workers のコールバック先 (`/api/auth/callback/google`) に戻ってきた時に `state_mismatch` エラーが発生。

**【原因】**
Next.js 側で `authClient.signIn.social()` を呼び出して OAuth を開始した際、**クロスオリジン（Next.jsドメインからWorkersドメインへ）のfetchリクエスト** が発生。
- Workers はレスポンスの `Set-Cookie` で OAuth の state クッキーを発行する。
- しかしブラウザは、クロスオリジンfetchレスポンスのクッキーを簡単には保存しない。
- Googleからコールバックされて戻ってきた段階で、ブラウザにstateクッキーが保存されていなかったため、検証に失敗し `state_mismatch` となった。

**【解決：ブラウザ直接ナビゲーション方式】**
クロスオリジン fetch を完全に排除する。
- Next.js 側の `client.tsx` を修正し、`window.location.href = /api/auth/oauth/google` のようにブラウザ自体を API 側のエンドポイントへ直接遷移させるようにした。
- Workers側に `GET /api/auth/oauth/google` エンドポイントを新設。
  - これは内部的に `better-auth` の POST `/sign-in/social` にリクエストをフォワード
  - JSONで返ってくるリダイレクト先URL（GoogleのOAuth画面など）を取り出し、`302` リダイレクトのResponseとして組み立て直す
  - この時、**Set-Cookieヘッダーもそのまま新Responseにコピー**
- ブラウザが直接Workersへ遷移（First-partyコンテキスト）するため、state クッキーが確実にブラウザへ保存されるようになり、エラーが解消された。

## 4. Oauth コールバック後の 404 とルーティング順序
**【現象】**
`state_mismatch` は解消したが、`/api/auth/callback/google` に戻ってきた際に `404 Not Found` になってしまう。

**【原因】**
Hono のルーティングは**登録された順**に評価される。
```typescript
app.on(["POST", "GET"], "/auth/*", ...); // ワイルドカードが先にあった
app.get("/auth/oauth/:provider", ...); // 詳細ルートが後になっていた
```
ワイルドカードルートが先にすべてを吸い込んでしまい、新設したエンドポイントやコールバック用デバッグルートに到達していなかった。

**【解決】**
具体的なルート（`/auth/oauth/:provider` や `/auth/callback/:provider`）をワイルドカード `/*` よりも**前**に登録するように順番を入れ替えた。

## 5. セッションクッキーの「ドメイン越え」問題（Session Bridge）
**【現象】**
OAuth のコールバック自体は `200 OK` (または 302 リダイレクト) になり、セッションも作成されて Next.js の機能画面へリダイレクトされた。しかし Next.js の middleware が依然として未ログインと判定して `/login` に戻してしまう。

**【原因】**
- Workers側のコールバックハンドラ（better-auth）は、無事に認証完了すると `Set-Cookie: session_token=...` を返す。
- **しかしこのクッキーは、Workers のドメイン (`hono-api...workers.dev`) に発行されている。**
- Next.js の画面へリダイレクトされてブラウザが表示するドメインは `hono-next-app...run.app`。
- Next.js 側にアクセスした際、ブラウザは Workers ドメインのクッキーを送信しないため、middleware はセッションクッキーを見つけられない。

**【解決：セッションブリッジ】**
Workersが直接Next.js画面へリダイレクトするのをやめ、**Next.jsのAPIルート（セッションブリッジ）を経由**させるようにした。
1. **[Workers側 (hono-api)]**
   コールバックが成功し、better-authが `302` (ダッシュボードへ) と `Set-Cookie(session_token)` を返したら、
   そのResponseに介入して `session_token` クッキーの値を文字列としてパース。
   リダイレクト先を Next.js の `/api/auth/session`（パラメータとして token を付与）に変更する。
2. **[Next.js側 (hono-app-next)]**
   `/api/auth/session?token=...` エンドポイント（Route Handler）を作成。
   受け取ったトークンを元に、**Next.js のドメインに対して**改めて `Set-Cookie` を行う。
   その後、目的のダッシュボードへリダイレクト。
   
これにより Next.js ドメイン自身にセッションクッキーが保持されるようになり、無事に middleware での認証が通るようになった。
