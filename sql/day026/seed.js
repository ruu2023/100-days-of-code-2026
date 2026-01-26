const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('videos.db');

// ★ ここが「自作Faker」の心臓部です！
// 1件のサンプルデータを元に、ループして大量のデータを生成します。

const SAMPLE_TEMPLATE = "My JavaScript Video, http://example.com/video, 5, Amazing content";
const COUNT = 100; // 生成する件数

function generateBulkData(template, count) {
    const parts = template.split(',').map(s => s.trim());
    const generatedData = [];

    // 役割を予想する（簡易ロジック）
    // 0: title (文字列) -> 連番をつける
    // 1: url (http含む) -> 連番をつける
    // 2: rating (数字) -> 1〜5のランダム
    // 3: memo (文字列) -> ランダムな言葉を選ぶ

    const memos = ["Good", "Bad", "Awesome", "So-so", "Best"];

    for (let i = 0; i < count; i++) {
        // 連番 (1, 2, 3...)
        const idSuffix = i + 1;

        // データの生成
        const title = `${parts[0]} ${idSuffix}`;      // "My JavaScript Video 1"
        const url = `${parts[1]}/${idSuffix}`;       // "http://example.com/video/1"
        const rating = Math.floor(Math.random() * 5) + 1; // 1〜5のランダム
        const memo = memos[Math.floor(Math.random() * memos.length)]; // 配列からランダム

        generatedData.push([title, url, rating, memo]);
    }

    return generatedData;
}

// 実行
const data = generateBulkData(SAMPLE_TEMPLATE, COUNT);

db.serialize(() => {
    const sql = "INSERT INTO videos (title, url, rating, memo) VALUES (?, ?, ?, ?)";
    const stmt = db.prepare(sql);

    data.forEach(row => {
        stmt.run(row);
    });

    stmt.finalize();
    console.log(`${COUNT}件のデータを自動生成して追加しました！`);
});

db.close();
