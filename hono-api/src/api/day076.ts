import { Hono } from "hono";
import type { Env } from "@/lib/auth";

type Item = {
  id: string;
  title: string;
  content: string;
  author: string;
  created_at: string;
};

// In-memory storage (for demo purposes)
const items: Item[] = [
  {
    id: "1",
    title: "htmx 入門",
    content: "htmxの基本的な使い方について学びます。",
    author: "田中太郎",
    created_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "2",
    title: "Hono で API 開発",
    content: "Cloudflare Workers と Hono で高速な API を作成。",
    author: "佐藤花子",
    created_at: "2026-02-20T14:30:00Z",
  },
  {
    id: "3",
    title: "CRUD 操作の実践",
    content: "RESTful API での作成・読取・更新・削除の実装。",
    author: "鈴木一郎",
    created_at: "2026-03-01T09:15:00Z",
  },
];

let nextId = 4;

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const escapeAttr = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
    .replaceAll("\n", "&#10;")
    .replaceAll("\r", "&#13;");

const renderTable = (items: Item[]) => {
  if (items.length === 0) {
    return `
      <div class="empty-state">
        <p>データがありません。「新規作成」から追加してください。</p>
      </div>
    `;
  }

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>タイトル</th>
            <th>著者</th>
            <th>作成日</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${items
            .map(
              (item) => `
            <tr>
              <td class="cell-title">${escapeHtml(item.title)}</td>
              <td>${escapeHtml(item.author)}</td>
              <td class="cell-date">${formatDate(item.created_at)}</td>
              <td class="cell-actions">
                <a class="btn btn-secondary btn-sm" href="http://localhost:8787/api/day076/${item.id}/edit" hx-get="http://localhost:8787/api/day076/${item.id}/edit" hx-target="#edit-container" hx-swap="innerHTML">編集</a>
                <button class="btn btn-danger btn-sm" hx-delete="http://localhost:8787/api/day076/${item.id}" hx-target="#table-container" hx-swap="innerHTML" hx-on:click="if(!confirm('削除しますか？')) return false">削除</button>
              </td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
};

const day076App = new Hono<{ Bindings: Env }>();

// Edit form (shown below create form)
day076App.get("/:id/edit", (c) => {
  const id = c.req.param("id");
  const item = items.find((item) => item.id === id);

  if (!item) {
    return c.html("<p>アイテムが見つかりません</p>");
  }

  return c.html(`
    <section class="panel" style="margin-top: 16px;">
      <h2>編集: ${escapeHtml(item.title)}</h2>
      <form hx-put="http://localhost:8787/api/day076/${id}" hx-target="#table-container" hx-swap="innerHTML" hx-on::after-request="document.getElementById('edit-container').innerHTML = ''">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">タイトル</label>
            <input type="text" name="title" class="form-input" value="${escapeHtml(item.title)}" required />
          </div>
          <div class="form-group">
            <label class="form-label">著者</label>
            <input type="text" name="author" class="form-input" value="${escapeHtml(item.author)}" required />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">内容</label>
          <textarea name="content" class="form-textarea" required>${escapeHtml(item.content)}</textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" onclick="document.getElementById('edit-container').innerHTML = ''">キャンセル</button>
          <button type="submit" class="btn btn-primary">保存</button>
        </div>
      </form>
    </section>
  `);
});

day076App.get("/", (c) => {
  const html = renderTable(items);

  c.header("Content-Type", "text/html; charset=utf-8");
  return c.body(html);
});

day076App.post("/", async (c) => {
  const contentType = c.req.header("content-type") || "";

  let title: string, content: string, author: string;

  if (contentType.includes("application/json")) {
    const body = await c.req.json<Pick<Item, "title" | "content" | "author">>();
    title = body.title;
    content = body.content;
    author = body.author;
  } else {
    const form = await c.req.parseBody();
    title = form["title"] as string;
    content = form["content"] as string;
    author = form["author"] as string;
  }

  if (!title || !content || !author) {
    c.status(400);
    return c.html("<p>エラー: すべての項目を入力してください</p>");
  }

  const newItem: Item = {
    id: String(nextId++),
    title,
    content,
    author,
    created_at: new Date().toISOString(),
  };

  items.unshift(newItem);

  c.header("Content-Type", "text/html; charset=utf-8");
  return c.body(renderTable(items));
});

day076App.put("/:id", async (c) => {
  const id = c.req.param("id");
  const contentType = c.req.header("content-type") || "";

  let title: string, content: string, author: string;

  if (contentType.includes("application/json")) {
    const body = await c.req.json<Pick<Item, "title" | "content" | "author">>();
    title = body.title;
    content = body.content;
    author = body.author;
  } else {
    const form = await c.req.parseBody();
    title = form["title"] as string;
    content = form["content"] as string;
    author = form["author"] as string;
  }

  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    c.status(404);
    return c.html("<p>エラー: アイテムが見つかりません</p>");
  }

  if (!title || !content || !author) {
    c.status(400);
    return c.html("<p>エラー: すべての項目を入力してください</p>");
  }

  items[index] = {
    ...items[index],
    title,
    content,
    author,
  };

  c.header("Content-Type", "text/html; charset=utf-8");
  return c.body(renderTable(items));
});

day076App.delete("/:id", (c) => {
  const id = c.req.param("id");
  const index = items.findIndex((item) => item.id === id);

  if (index === -1) {
    c.status(404);
    return c.json({ error: "アイテムが見つかりません" });
  }

  items.splice(index, 1);

  c.header("Content-Type", "text/html; charset=utf-8");
  return c.body(renderTable(items));
});

export { day076App };
