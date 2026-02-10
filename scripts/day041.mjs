import fs from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

function backoffMs(attempt) {
  const base = Math.min(60000, 2000 * Math.pow(2, attempt)); // 2s,4s,8s... max 60s
  const jitter = Math.floor(Math.random() * 1000);
  return base + jitter;
}

async function generateWithRetry(prompt, retries = 6) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (e) {
      const msg = String(e?.message || "");
      const is429 = msg.includes("429") || msg.includes("RESOURCE_EXHAUSTED");
      if (!is429 || i === retries - 1) throw e;

      const wait = backoffMs(i);
      console.log(`429 -> wait ${wait}ms (attempt ${i + 1}/${retries})`);
      await sleep(wait);
    }
  }
  return "要約失敗";
}

function toRedditJsonUrl(url) {
  const u = url.replace(/\?.*$/, "");
  return u.endsWith("/") ? `${u}.json` : `${u}/.json`;
}

function stripMarkdownLite(s = "") {
  return String(s)
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_>#-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function smartTrim(text, limit = 2800) {
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

async function fetchRedditThreadText(postUrl, { maxComments = 10 } = {}) {
  try {
    const jsonUrl = toRedditJsonUrl(postUrl) + `?limit=${maxComments}&sort=top`;

    const res = await fetch(jsonUrl, {
      signal: AbortSignal.timeout(8000),
      headers: { "user-agent": "my-news-app/1.0" },
    });

    if (!res.ok) return `Redditスレ取得に失敗しました (status ${res.status})`;

    const data = await res.json();
    const post = data?.[0]?.data?.children?.[0]?.data;
    const comments = data?.[1]?.data?.children || [];

    const title = post?.title || "";
    const selftext = stripMarkdownLite(post?.selftext || "");
    const subreddit = post?.subreddit_name_prefixed || "";
    const score = post?.score ?? "";
    const numComments = post?.num_comments ?? "";

    const top = [];
    for (const c of comments) {
      const d = c?.data;
      if (!d || d.body == null) continue;
      if (d.stickied) continue;

      const body = stripMarkdownLite(d.body).slice(0, 400); // 1コメントの上限
      if (!body) continue;

      top.push({ author: d.author, score: d.score, body });
      if (top.length >= maxComments) break;
    }

    const commentText = top
      .map((c, i) => `C${i + 1} (+${c.score}) u/${c.author}: ${c.body}`)
      .join("\n");

    const combined = [
      `Subreddit: ${subreddit}`,
      `Score: ${score} / Comments: ${numComments}`,
      `Title: ${title}`,
      selftext ? `Post: ${selftext}` : "",
      commentText ? `Top Comments:\n${commentText}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    return smartTrim(combined, 2800);
  } catch {
    return "Redditスレ取得エラー";
  }
}

async function fetchRedditHot(subreddit, limit = 15) {
  try {
    const res = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=${limit}`, {
      signal: AbortSignal.timeout(8000),
      headers: { "user-agent": "my-news-app/1.0" },
    });

    if (!res.ok) {
      console.log(`Reddit list fetch failed: r/${subreddit} status=${res.status}`);
      return [];
    }

    const json = await res.json();
    const children = json?.data?.children || [];

    return children
      .map((c) => c.data)
      .filter(Boolean)
      .map((d) => ({
        id: `reddit-${d.id}`,
        title: d.title,
        url: `https://www.reddit.com${d.permalink}`,
        source: `Reddit:r/${subreddit}`,
        score: d.score ?? 0,
        num_comments: d.num_comments ?? 0,
      }));
  } catch (e) {
    console.log("Reddit fetch error:", e.message);
    return [];
  }
}

function pickBest(items, { minScore = 60, minComments = 10 } = {}) {
  // 条件を満たすものを優先。無ければ上位から1つ拾う（偏りOK）
  const ok = items
    .filter((x) => (x.score ?? 0) >= minScore && (x.num_comments ?? 0) >= minComments)
    .sort((a, b) => (b.score + b.num_comments) - (a.score + a.num_comments));

  if (ok.length) return ok[0];

  const any = [...items].sort((a, b) => (b.score + b.num_comments) - (a.score + a.num_comments));
  return any[0] || null;
}

async function summarizeRedditThread(item, label) {
  const threadText = await fetchRedditThreadText(item.url, { maxComments: 10 });

  const prompt = `以下はRedditスレ（投稿＋上位コメント）です。
  読者が素早く理解できるよう整理してください。

  出力ルール:
  - 前置きや説明文は禁止
  - いきなり結果から書く
  - 本文に無いことは推測しない。不明なら「不明」

  出力形式:

  日本語タイトル:
  （自然で簡潔な日本語に翻訳）

  【評価ポイント】
  - 最大5つ

  【懸念・限界】
  - 最大3つ

  要するに：
  （1行）

  ジャンル: ${label}
  元タイトル: ${item.title}
  スレ内容: ${threadText}
  言語: 日本語`;


  return await generateWithRetry(prompt);
}

async function main() {
  console.log("🚀 AI + Security (1 each) started...");

  // --- AI候補（必要なら好きなsubredditに入れ替えOK）
  const aiPool = [
    ...(await fetchRedditHot("MachineLearning", 15)),
    ...(await fetchRedditHot("LocalLLaMA", 15)),
  ];

  // --- Security候補
  const secPool = [
    ...(await fetchRedditHot("netsec", 15)),
    ...(await fetchRedditHot("cybersecurity", 15)),
  ];

  const aiPick = pickBest(aiPool, { minScore: 80, minComments: 20 });
  const secPick = pickBest(secPool, { minScore: 80, minComments: 20 });

  const results = [];

  if (aiPick) {
    console.log(`🧠 AI pick: ${aiPick.title} (score ${aiPick.score}, comments ${aiPick.num_comments})`);
    await sleep(3000);
    const summary = await summarizeRedditThread(aiPick, "AI");
    results.push({ ...aiPick, summary, category: "AI" });
  } else {
    console.log("🧠 AI pick: none");
  }

  if (secPick) {
    console.log(`🛡 Security pick: ${secPick.title} (score ${secPick.score}, comments ${secPick.num_comments})`);
    await sleep(3000);
    const summary = await summarizeRedditThread(secPick, "Security");
    results.push({ ...secPick, summary, category: "Security" });
  } else {
    console.log("🛡 Security pick: none");
  }

  if (!fs.existsSync("./public")) fs.mkdirSync("./public");
  fs.writeFileSync("./public/data.json", JSON.stringify(results, null, 2));
  console.log("✅ data.json updated (max 2 summaries)");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exitCode = 1;
});
