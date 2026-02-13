
## ステップ 1：魔法のお店（アプリ）を建てる

まずは、Cloudflare のルールに沿った Next.js のお店（プロジェクト）を建てます。

```bash
# ターミナルで実行
# 「my-magic-shop」は好きな名前に変えてOKです
npm create cloudflare@latest my-magic-shop -- --framework=next

```

* **解説:** 普通の Next.js ではなく、Cloudflare 専用の部品が入った特別なキットを使ってお店を建てます。
* **やること:** 途中でいくつか質問が出ますが、基本は全部 `Yes` (Enter) で進めて大丈夫です。

---

## ステップ 2：魔法のノート（DB）を買ってくる

データを記録するための専用ノート「D1」を Cloudflare の倉庫から持ってきます。

```bash
# ターミナルで実行
npx wrangler d1 create my-db

```

* **解説:** これを実行すると、画面に「database_id = 'xxxx-xxxx...'」という**魔法の ID** が表示されます。
* **ポイント:** この ID は次のステップで使うので、どこかにメモしておきましょう。

---

## ステップ 3：お店に「ノートの場所」を教える

お店の設定図（`wrangler.jsonc` または `wrangler.toml`）に、買ってきたノートの情報を書き込みます。

```json
// cloudflare/wrangler.jsonc (またはプロジェクト直下のファイル)
{
  "d1_databases": [
    {
      "binding": "DB", 
      "database_name": "my-db",
      "database_id": "ここにステップ2で出たIDを貼り付ける"
    }
  ]
}

```

* **解説:** お店（アプリ）が「あ、ノートを使いたいときは `DB` って名前で呼べばいいんだな」と理解できるようにします。

---

## ステップ 4：ノートに「線」を引く

真っ白なノートに、データを書くための「枠」を作ります。

1. まず、プロジェクトの目立つ場所に `schema.sql` というファイルを作ります。

```sql
-- schema.sql
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE
);

-- お試しデータ（任意）
INSERT INTO users (name, email) VALUES ('だいふく', 'daifuku@example.com');

```

2. 次に、この線を**「練習用のノート（ローカル）」**に反映させます。

```bash
# ターミナルで実行
npx wrangler d1 execute my-db --local --file=./schema.sql

```

* **解説:** これで、あなたのパソコンの中にある練習用ノートに「名前」や「メール」を書く欄ができました。

---

## ステップ 5：お店とノートを繋ぐ「呪文」を唱える

Next.js の中からノートを呼び出せるように、特別な呪文を `next.config.ts` に書き込みます。

```typescript
// cloudflare/next.config.ts
import type { NextConfig } from "next";
import { setupDevPlatform } from "@cloudflare/next-on-pages/next-dev";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// 開発中（npm run dev中）だけ魔法を有効にする
if (process.env.NODE_ENV === 'development') {
  (async () => {
    await setupDevPlatform();
  })();
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
  /* ここに他の設定があれば書く */
};

export default nextConfig;

```

* **解説:** `setupDevPlatform` と `initOpenNextCloudflareForDev` は、パソコンの中で Cloudflare の環境をそっくりそのまま再現してくれる魔法です。

---

## ステップ 6：店員さん（API）を雇う

最後に、ノートからデータを取ってきてお客さんに渡す「店員さん」を作ります。

`app/api/users/route.ts` というファイルを新しく作ってください。

```typescript
// app/api/users/route.ts
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { NextResponse } from "next/server";

export async function GET() {
  // ステップ3で決めた「DB」という名前でノートを呼び出す
  const { env } = getCloudflareContext();
  const db = env.DB;

  // ノートからデータを全部読み出す
  const { results } = await db.prepare("SELECT * FROM users").all();

  return NextResponse.json(results);
}

```

* **解説:** これで `http://localhost:3000/api/users` にアクセスすると、ノートに書いたデータが画面に表示されます！

---

これで準備完了です！次はこの「店員さん」が持ってきたデータを、画面（ページ）におしゃれに表示する方法を一緒に考えましょうか？