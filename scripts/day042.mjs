import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import he from "he";
import Parser from "rss-parser";

if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY is missing. Set it in GitHub Secrets.");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const rss = new Parser({ headers: { "User-Agent": "my-news-app/1.0" } });
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

async function fetchArticleText(url) {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: { "user-agent": "Mozilla/5.0 (summary-bot)" },
    });
    const html = await res.text();

    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article?.textContent) {
      return "本文の取得に失敗しました（JS実行が必要なサイトの可能性があります）";
    }

    let text = he
      .decode(article.textContent)
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return smartTrim(text, 3000);
  } catch {
    return "本文取得エラー";
  }
}

function smartTrim(text, limit = 3000) {
  if (text.length <= limit) return text;

  const head = Math.floor(limit * 0.45);
  const tail = Math.floor(limit * 0.20);
  const mid = limit - head - tail;

  const headPart = text.slice(0, head);
  const tailPart = text.slice(-tail);

  const center = Math.floor(text.length / 2);
  const midStart = Math.max(0, center - Math.floor(mid / 2));
  const midPart = text.slice(midStart, midStart + mid);

  return ["【冒頭】\n" + headPart, "\n\n【中盤】\n" + midPart, "\n\n【結論付近】\n" + tailPart].join("");
}

async function getSummaryWithRetry(title, url, retries = 3) {
  const content = await fetchArticleText(url);

  for (let i = 0; i < retries; i++) {
    try {
      const prompt = `以下の内容を日本語で要約してください。

条件:
- 箇条書きは禁止
- 番号や見出しは禁止
- 普通の文章で2段落
- 読者が「何がすごいのか」を理解できる構成にする
- 本文に無いことは推測しない
- 最後に「要するに：」で始まる、究極の1行まとめ

タイトル: ${title}
本文: ${content}
言語: 日本語`;

      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      if (String(error?.message || "").includes("429") && i < retries - 1) {
        console.log("429 Error, retrying...");
        await sleep(20000);
        continue;
      }
      console.log("要約失敗: ", error.message);
      return `要約失敗: ${error.message}`;
    }
  }
  return "要約失敗";
}

// はてブ：テクノロジー人気エントリー
async function fetchHatenaHotIT(limit = 20) {
  const feed = await rss.parseURL("https://b.hatena.ne.jp/hotentry/it.rss");
  return (feed.items || []).slice(0, limit).map((it, idx) => ({
    id: `hatebu-it-${idx}-${(it.guid || it.link || "").slice(-12)}`,
    title: it.title || "(no title)",
    url: it.link,
    source: "Hatena:it",
  }));
}

async function fetchHatenaBookmarkCount(url) {
  const api = `https://b.hatena.ne.jp/entry/jsonlite/?url=${encodeURIComponent(url)}`;
  const res = await fetch(api, {
    signal: AbortSignal.timeout(6000),
    headers: { "User-Agent": "my-news-app/1.0" },
  });
  if (!res.ok) return 0;

  const json = await res.json().catch(() => null);
  return Number(json?.count || 0);
}

function categorizeHatena(title) {
  const isAI =
    /ai|llm|gpt|gemini|claude|openai|rag|agent|prompt|生成ai|大規模言語モデル/i.test(title);

  const isSec =
    /security|cve|vuln|exploit|breach|rce|xss|csrf|malware|ランサム|脆弱性|セキュリティ|侵害/i.test(title);

  if (isAI && !isSec) return "AI";
  if (isSec && !isAI) return "Security";
  if (isAI && isSec) return "Both";
  return "Other";
}

async function pickHatenaAIAndSecurity() {
  const items = await fetchHatenaHotIT(30);

  const aiCandidates = [];
  const secCandidates = [];

  for (const it of items) {
    const cat = categorizeHatena(it.title);
    if (cat === "AI" || cat === "Both") aiCandidates.push(it);
    if (cat === "Security" || cat === "Both") secCandidates.push(it);
  }

  const aiPool = aiCandidates.length ? aiCandidates : items;
  const secPool = secCandidates.length ? secCandidates : items;

  async function rankByBookmarks(pool) {
    const sliced = pool.slice(0, 10);
    const scored = [];
    for (const it of sliced) {
      await sleep(500);
      const count = await fetchHatenaBookmarkCount(it.url);
      scored.push({ ...it, bookmarkCount: count });
    }
    scored.sort((a, b) => (b.bookmarkCount || 0) - (a.bookmarkCount || 0));
    return scored[0] || null;
  }

  const aiPick = await rankByBookmarks(aiPool);
  const secPick = await rankByBookmarks(secPool);

  return { aiPick, secPick };
}

async function main() {
  console.log("🚀 Hatena AI + Security (1 each) started...");

  const { aiPick, secPick } = await pickHatenaAIAndSecurity();

  const results = [];

  if (aiPick) {
    console.log(`🧠 AI pick: ${aiPick.title} (bkm ${aiPick.bookmarkCount ?? "?"})`);
    await sleep(2000);
    const summary = await getSummaryWithRetry(aiPick.title, aiPick.url);
    results.push({ ...aiPick, summary, category: "AI" });
  } else {
    console.log("🧠 AI pick: none");
  }

  if (secPick) {
    console.log(`🛡 Security pick: ${secPick.title} (bkm ${secPick.bookmarkCount ?? "?"})`);
    await sleep(2000);
    const summary = await getSummaryWithRetry(secPick.title, secPick.url);
    results.push({ ...secPick, summary, category: "Security" });
  } else {
    console.log("🛡 Security pick: none");
  }

  if (!fs.existsSync("./docs/api")) fs.mkdirSync("./docs/api");
  fs.writeFileSync("./docs/api/data.json", JSON.stringify(results, null, 2));
  console.log("✅ data.json updated (max 2 summaries)");
}

main();
