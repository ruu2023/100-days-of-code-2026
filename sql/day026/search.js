const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('videos.db');

// コマンドライン引数から検索キーワードを取得
// 実行例: node search.js "Java"
const keyword = process.argv[2];

if (!keyword) {
    console.log("使い方: node search.js <検索キーワード>");
    process.exit(1);
}

db.serialize(() => {
    // SQL Challenge 4: Search with LIKE
    // % は「任意の文字列」を表すワイルドカードです。
    // '%Java%' -> 前後に何があっても "Java" が含まれていればヒット
    const sql = `
    SELECT * FROM videos
    WHERE title LIKE ? OR memo LIKE ?
    `;
    
    // 検索用パラメータ: %キーワード%
    const searchParam = `%${keyword}%`;

    db.all(sql, [searchParam, searchParam], (err, rows) => {
        if (err) {
            console.error("検索失敗...", err.message);
            return;
        }

        console.log(`\n=== 検索結果: "${keyword}" (${rows.length}件) ===`);
        rows.forEach((row) => {
            console.log(`[${row.id}] ${row.title} (★${row.rating}) - ${row.memo}`);
        });
    });
});

db.close();
