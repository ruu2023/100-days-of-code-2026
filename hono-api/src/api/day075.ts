import { Hono } from "hono";
import type { Env } from "@/lib/auth";

type SearchItem = {
  id: string;
  title: string;
  category: string;
  tags: string[];
  summary: string;
  actionLabel: string;
  actionHref: string;
};

const SEARCH_ITEMS: SearchItem[] = [
  {
    id: "workers-routing",
    title: "Workers Routing Basics",
    category: "Cloudflare Workers",
    tags: ["workers", "routing", "deploy"],
    summary: "Hono で GET エンドポイントを作り、Cloudflare Workers に最小デプロイする流れ。",
    actionLabel: "Route 設計を見る",
    actionHref: "https://developers.cloudflare.com/workers/",
  },
  {
    id: "htmx-live-search",
    title: "htmx Live Search",
    category: "htmx",
    tags: ["htmx", "search", "ui"],
    summary: "input から `hx-get` を発火して、検索結果だけを HTML 断片で差し替える基本形。",
    actionLabel: "htmx で検索する",
    actionHref: "https://htmx.org/docs/",
  },
  {
    id: "server-rendered-fragments",
    title: "Server Rendered HTML Fragments",
    category: "Architecture",
    tags: ["ssr", "html", "fragment"],
    summary: "JSON を組み立てず、Worker からそのまま結果一覧の HTML を返す htmx 向けの設計。",
    actionLabel: "フラグメント方針を確認",
    actionHref: "https://htmx.org/examples/",
  },
  {
    id: "debounced-query",
    title: "Debounced Query Input",
    category: "UX",
    tags: ["debounce", "input", "trigger"],
    summary: "`keyup changed delay:250ms` で打鍵ごとの無駄なリクエストを抑える定番設定。",
    actionLabel: "Trigger の例を見る",
    actionHref: "https://htmx.org/attributes/hx-trigger/",
  },
  {
    id: "empty-state",
    title: "Empty State Design",
    category: "UX",
    tags: ["empty-state", "search", "copy"],
    summary: "0 件のときに次の検索語を案内し、UI を止まった印象にしないための設計。",
    actionLabel: "空状態の例を見る",
    actionHref: "https://htmx.org/examples/",
  },
  {
    id: "workers-cors",
    title: "Workers CORS Setup",
    category: "Cloudflare Workers",
    tags: ["cors", "workers", "local-dev"],
    summary: "ローカル HTML や GitHub Pages から API を呼ぶための origin 設計。",
    actionLabel: "CORS を見直す",
    actionHref: "https://developers.cloudflare.com/workers/runtime-apis/fetch/",
  },
];

const day075App = new Hono<{ Bindings: Env }>();

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const normalize = (value: string) => value.trim().toLowerCase();

const matchesQuery = (item: SearchItem, query: string) => {
  if (!query) {
    return true;
  }

  const haystacks = [
    item.title,
    item.category,
    item.summary,
    item.tags.join(" "),
  ].map((value) => normalize(value));

  return haystacks.some((value) => value.includes(query));
};

const renderResults = (items: SearchItem[], query: string) => {
  if (items.length === 0) {
    const safeQuery = escapeHtml(query);
    return `
      <section class="search-empty">
        <p class="search-empty-title">該当するチュートリアルがありません。</p>
        <p class="search-empty-body">"${safeQuery}" を外して、"workers" や "htmx" などで試してください。</p>
      </section>
    `;
  }

  return `
    <div class="search-meta">${items.length} 件ヒット${query ? ` / query: "${escapeHtml(query)}"` : ""}</div>
    <div class="result-list">
      ${items.map((item) => `
        <article class="result-card">
          <div class="result-head">
            <p class="result-category">${escapeHtml(item.category)}</p>
            <h3>${escapeHtml(item.title)}</h3>
          </div>
          <p class="result-summary">${escapeHtml(item.summary)}</p>
          <ul class="tag-list">
            ${item.tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}
          </ul>
          <a class="result-link" href="${escapeHtml(item.actionHref)}" target="_blank" rel="noreferrer">${escapeHtml(item.actionLabel)}</a>
        </article>
      `).join("")}
    </div>
  `;
};

day075App.get("/", (c) => {
  return c.json({
    day: "075",
    feature: "htmx search ui",
    endpoints: {
      search: "/api/day075/search?q=htmx",
    },
  });
});

day075App.get("/search", (c) => {
  const query = normalize(c.req.query("q") ?? "");
  const filtered = SEARCH_ITEMS.filter((item) => matchesQuery(item, query));
  const html = renderResults(filtered, query);

  c.header("Content-Type", "text/html; charset=utf-8");
  return c.body(html);
});

export { day075App };
