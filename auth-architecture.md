# Next.js + Hono (Cloudflare Workers) 認証アーキテクチャ解説

このドキュメントでは、フロントエンドに Next.js、バックエンド API に Hono (Cloudflare Workers)、認証ライブラリに Better Auth を使用し、本番環境ではリバースプロキシによって同一ドメインで連携する構成において、どのようにログインフローが実現されているかを解説します。

## 1. 全体の認証フロー（どういう流れでログインしているのか）

### 第1ステップ: ログインの開始 (Next.js 側)
ユーザーが Next.js の画面 (`src/app/login/client.tsx`) で「Google でログイン」ボタンをクリックします。
この時、Next.js は直接 Google に行くのではなく、**バックエンド (hono-api) の OAuth エンドポイントへブラウザをリダイレクト** させます。URL パラメータとして、ログイン成功後の戻り先 (`callbackURL`) を仕込みます。

* リクエスト先例: `http://localhost:8787/api/auth/oauth/google?callbackURL=http://localhost:3000/dashboard`

### 第2ステップ: Googleへの転送準備 (hono-api 側)
リクエストを受け取った `hono-api` (`src/api/index.ts`) が処理をします。
ここでは GET リクエストを `Better Auth` に渡すため、内部的に POST リクエストを生成して `Better Auth` に処理を委譲しています。`Better Auth` が Google のログインURL（OAuthのURL）を生成し、ブラウザをそこへリダイレクトさせます。

### 第3ステップ: Google認証 〜 コールバック (Google → hono-api)
ユーザーがGoogleでログインを完了すると、Googleは `hono-api` のコールバックURL (`/api/auth/callback/google`) にリダイレクトして戻してくれます。
`hono-api` は再び `Better Auth` にこの情報を渡します。
`Better Auth` は内部で Google からユーザー情報を取得し、D1 データベースにユーザー情報を保存（または更新）し、**セッショントークンを発行** します。
発行されたセッショントークンは、レスポンスの `Set-Cookie` ヘッダーに乗せられます。

### 第4ステップ: Cookieの付与とNext.jsへの帰還 (hono-api → Next.js)
`hono-api` の `src/api/index.ts` (`/auth/callback/:provider` の処理) で非常に重要なことをしています。
`Better Auth` が発行した `better-auth.session_token` という Cookie の値を意図的に抽出し、明示的に `Set-Cookie` ヘッダーとしてセットした上で、最初に指定されていた `callbackURL` (つまり Next.js の `http://localhost:3000/dashboard`) へブラウザをリダイレクトさせています。

### 第5ステップ: Next.js 側でのセッション確認 (Next.js Middleware)
ブラウザが Next.js の `/dashboard` にアクセスすると、Next.js の `src/middleware.ts` が作動します。
この Middleware は、「本当にこのユーザーはログインしているのか？」を確認するために、**ブラウザから送られてきた Cookie をそのままくっつけて** `hono-api` の `/api/me` エンドポイントに送ります。
`hono-api` は Cookie を検証し、ユーザー情報を Next.js に返します。認証が確認できれば、Next.js はダッシュボードの画面を表示します。

---

## 2. なぜローカル (`localhost`) でも問題なく Cookie が共有されるのか？

一見すると、Next.js は `localhost:3000` で動き、Hono は `localhost:8787` で動いている「別のサイト」に見えます。通常、別々のサイトで Cookie は共有できません。

しかし、**ブラウザの Cookie の仕様により「`localhost` というドメインは、ポート番号（`:3000` や `:8787`）を区別せずに Cookie を共有する」** という特別なルールがあります。

1. `localhost:8787` (hono-api) がログイン成功時に `better-auth.session_token` という Cookie をブラウザに保存させる。
2. ブラウザは「これは `localhost` 用の Cookie だな」と認識する。
3. その直後に `localhost:3000` (Next.js) にアクセスすると、ブラウザは「同じ `localhost` だからこの Cookie を送ろう！」と判断して、**自動的に Next.js にもセッション Cookie を送ってくれます**。

Next.js (Middleware) はその送られてきた Cookie をそのまま `hono-api` に横流しして認証を確認できているため、ローカルでも一切エラーにならずスムーズに統合されています。

### 本番環境の場合
本番環境でも、この「Cookieの共有」の理屈は同じですが、方法が違います。 Cloudflare Workers (`hono-api`) が **リバースプロキシ** として働き、`ruu-dev.com` へのアクセスをすべて受け付けます。
* API へのアクセス (`/api/*`) は Workers が自分で処理します。
* それ以外のアクセスは Next.js (Cloud Run) へルーティングします。

これにより、ブラウザから見れば**すべて同じ `ruu-dev.com` という1つのドメイン**とのやり取りになるため、Cookie が完璧に共有されます。

---

## 3. なぜ `hono-api` は Next.js のホスト名を知ることができるのか？ (仮想リクエストの魔法)

Next.js と hono-api は別々に動いていますが、Google の OAuth 設定において、リダイレクトURIが正しく認識されるための工夫が Hono 側に施されています。

カギとなるのは、`apiApp.get("/auth/oauth/:provider")` 内にある以下の処理です。

```typescript
// ① 送信元の「本当のURL」を推測する
const host = ctx.req.header("x-forwarded-host") || ctx.req.header("host");
const protocol = ctx.req.header("x-forwarded-proto") || "http";
const workerBase = host ? `${protocol}://${host}` : (ctx.env.BETTER_AUTH_URL ?? "http://localhost:8787");

// ② 「あたかも本当のURLから来たリクエストであるかのように」偽装したリクエスト（syntheticReq）を作る
const syntheticReq = new Request(`${workerBase}/api/auth/sign-in/social`, {
  method: "POST",
  headers: { 
    ...ctx.req.raw.headers, // ← 元のリクエストヘッダー（x-forwarded-* など）をすべて引き継ぐ
    "Content-Type": "application/json" 
  },
  body: JSON.stringify({ provider, callbackURL }),
});

// ③ その偽装リクエストを Better Auth に渡す
const authRes = await auth.handler(syntheticReq);
```

### 本番環境 (`ruu-dev.com`) の場合

ユーザーが `ruu-dev.com` のログインボタンを押すと、一旦 Cloudflare にリクエストが飛びます。Cloudflare はリバースプロキシとして、リクエストに「元のアクセス情報」をヘッダーとして追加します（これが `x-forwarded-host` などです）。

1. 実際に `hono-api` が受け取るリクエストの内部的な宛先は直接のホストかもしれませんが、コードの ① で `x-forwarded-host` をチェックすると、そこには `ruu-dev.com` と書かれています。
2. そのため `workerBase` は `https://ruu-dev.com` になります。
3. ② で、Workers 内部で「宛先を `https://ruu-dev.com/...` に書き換えた架空の（Syntheticな）リクエスト」を新しく作ります。
4. ③ で、その架空のリクエストを `Better Auth` に渡します。
5. `Better Auth` は受け取ったリクエストの宛先を見て、「なるほど、このアプリのホストは `ruu-dev.com` だな」と信じ込みます。
6. そのため、Google に渡される `redirect_uri`（コールバック先）も `https://ruu-dev.com/api/auth/callback/google` として組み立てられます。

### ローカル環境 (`localhost`) の場合

ローカルで Next.js の画面 (`http://localhost:3000`) から直接 `http://localhost:8787` へアクセスします（プロキシを通さない）。

1. この場合、リクエストには `x-forwarded-host` が無いので、ブラウザが送る通常の `host` ヘッダーを見ます。
2. `host` には `localhost:8787` と書いてあります。
3. なので `workerBase` は `http://localhost:8787` になります。
4. `Better Auth` に対して「`http://localhost:8787` からのリクエストだぞ」と伝えます。
5. Google に渡される `redirect_uri` は `http://localhost:8787/api/auth/callback/google` になります。

---

## 4. `localhost:3000` に戻るためのバケツリレー

コードのいたるところにホスト名をベタ書き（ハードコード）していないにも関わらず、認証後に意図した画面（例: Next.jsの `/dashboard`）に戻れるのは、 **ユーザーが最初にクリックした時の情報をパラメータとして最後までリレーしている** からです。

### 第1走者：Next.js のログインボタン (client.tsx)
```typescript
const redirectAfterAuth = `http://localhost:3000/dashboard`; 

window.location.href = `${API_URL}/api/auth/oauth/google?callbackURL=${encodeURIComponent(redirectAfterAuth)}`;
```
ここで初めて「ログインが終わったら `http://localhost:3000/dashboard` に返してね」という行き先メモが作られます。

### 第2走者：hono-api のログイン開始処理 (api/index.ts)
```typescript
apiApp.get("/auth/oauth/:provider", async (ctx) => {
  // ① ?callbackURL= の値を受け取る
  const callbackURL = ctx.req.query("callbackURL") || "/";

  // ② Better Auth（認証ライブラリの本体）に仮想リクエストとして渡す
  const syntheticReq = new Request(`${workerBase}/api/auth/sign-in/social`, {
    method: "POST",
    body: JSON.stringify({ provider, callbackURL }), // ← 行き先メモごと Better Auth に渡す
  });
```
Better Auth はこの行き先メモ（`callbackURL`）を受け取ると、「よし、Googleでの認証が終わったらこのURLにリダイレクトさせればいいんだな」と裏側（Cookieや内部状態）で記憶してくれます。

### 第3走者：Google認証完了 〜 指定されたコードへ (api/index.ts)
```typescript
apiApp.on(["GET", "POST"], "/auth/callback/:provider", async (ctx) => {
  const auth = getAuth(ctx.env);
  
  // ① Better Auth に「Googleから返ってきたよ」とリクエストを渡す
  const response = await auth.handler(ctx.req.raw);
  
  // ② Better Auth は記憶していた行き先メモへのリダイレクト(302)を返してくれる！
  const status = response.status;
  const location = response.headers.get("location"); // ← ★ ここに "http://localhost:3000/dashboard" が入っている！

  if (status === 302 && location) {
    // 最後に、Better Authが作ってくれた location をそのまま使ってブラウザに返す
    const redirectRes = new Response(null, {
      status: 302,
      headers: {
        Location: location, // ← "http://localhost:3000/dashboard"
        "Set-Cookie": ...
      },
    });
    return redirectRes; 
```

このように、リクエスト時のパラメータ（動的な値）を引き回す設計になっているため、**ローカルでも本番でもコードを一切書き換えることなくシームレスに動作する**、非常に洗練されたアーキテクチャになっています。
