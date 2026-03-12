import fs from 'fs';
import path from 'path';

export const parseXPosts = (rawText, existingPostsMap = new Map()) => {
  const sections = rawText.split('---').filter(s => s.trim().length > 0);

  return sections.map(section => {
    const lines = section.trim().split('\n');
    
    // 1. 日付の抽出 (## 2026-02-18...)
    const date = lines[0]?.replace('## ', '').trim() || "";

    // 2. Day番号の抽出 (Day 049, Day 044, Day 005 などに対応)
    const dayMatch = section.match(/Day\s*(\d+)/i);
    const day = dayMatch ? parseInt(dayMatch[1], 10) : 0;

    // 3. タイトルの抽出 (】の後、:の後、または「今日の成果：」の後)
    let title = "Untitled Project";
    const titleLine = lines.find(l => l.includes('Day'));
    if (titleLine) {
      const match = titleLine.match(/(?:】|:|\uff1a|成果：)\s*(.*)/);
      if (match && match[1]) {
        title = match[1].replace(/✍️|🛡️|🌐|⌨️|⚡️|🐳|📝|🌿|🤖📰|🎨✨|🖼️|🧠|🎧🎤|📚🎓|🍺⚔️|📊✍️|🎬📝|🌌🏃‍♂️|🎥📌|💎✨|🍅⏳|⚪⚫|ᗧ/g, '').trim();
      }
    }

    // 4. 特徴とタグ
    const features = lines.filter(l => l.includes('✅') || l.startsWith('・')).map(l => l.replace(/[✅・]/g, '').trim());
    const tags = section.match(/#\w+/g) || [];
    
    // 5. URL
    const urlMatch = section.match(/\[Original Post\]\((.*?)\)/);
    const url = urlMatch ? urlMatch[1] : "#";

    // 5.5. Demo Link
    const demoMatch = section.match(/\[Demo\]\((.*?)\)/);
    let demoLink = demoMatch ? demoMatch[1] : undefined;
    if (!demoLink && existingPostsMap.has(day)) {
      demoLink = existingPostsMap.get(day).demoLink;
    }

    // 6. 説明文 (タイトル行の直後の行、かつ空行やタグ行でないもの)
    const description = lines.slice(2).find(l => l.length > 5 && !l.includes('✅') && !l.includes('#') && !l.includes('http')) || "";

    const post = { day, date, title, description, features, tags, url };
    if (demoLink) post.demoLink = demoLink;
    return post;
  })
  .filter(post => post.day > 0) // RTなどを除外
  .sort((a, b) => b.day - a.day); // 降順
};

const mdPath = path.join(process.cwd(), 'posts.md');
const jsonPath = path.join(process.cwd(), 'posts.json');

let existingPostsMap = new Map();
if (fs.existsSync(jsonPath)) {
  try {
    const existingData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    existingPostsMap = new Map(existingData.map(p => [p.day, p]));
  } catch (e) {
    // Ignore invalid JSON
  }
}

const rawData = fs.readFileSync(mdPath, 'utf8');
const posts = parseXPosts(rawData, existingPostsMap);

fs.writeFileSync(jsonPath, JSON.stringify(posts, null, 2));
console.log('✅ posts.json generated!');