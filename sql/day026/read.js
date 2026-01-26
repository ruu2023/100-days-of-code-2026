const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('videos.db');

db.serialize(() => {
    // SQL Challenge 3: SELECT Data
    // 保存されている全ての動画を取得します
    const sql = `
    SELECT * FROM videos
    `;

    // .all(sql, [], callback) は、結果を配列(rows)で受け取ります
    db.all(sql, [], (err, rows) => {
        if (err) {
            console.error("データ取得失敗...", err.message);
            return;
        }

        // 取得したデータを綺麗に表示
        if (rows.length === 0) {
            console.log("動画がまだありません。add.js で追加してください！");
        } else {
            console.log(`\n=== Video Library (${rows.length} videos) ===`);
            rows.forEach((row) => {
                console.log(`[${row.id}] ${row.title} (★${row.rating})`);
                console.log(`    URL: ${row.url}`);
                console.log(`    Memo: ${row.memo}`);
                console.log('-----------------------------------');
            });
        }
    });
});

db.close();
