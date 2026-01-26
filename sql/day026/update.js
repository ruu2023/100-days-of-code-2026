const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('videos.db');

// コマンドライン引数から更新情報を取得
// 実行例: node update.js <ID> <新しい評価(1-5)> <新しい感想>
const id = process.argv[2];
const newRating = process.argv[3];
const newMemo = process.argv[4];

if (!id || !newRating || !newMemo) {
    console.log("使い方: node update.js <ID> <新しい評価> <新しい感想>");
    process.exit(1);
}

db.serialize(() => {
    // SQL Challenge 5: UPDATE Data
    // 特定のIDのデータを書き換えます
    const sql = `
    UPDATE videos
    SET rating = ?, memo = ?
    WHERE id = ?
    `;

    db.run(sql, [newRating, newMemo, id], function(err) {
        if (err) {
            console.error("更新失敗...", err.message);
        } else {
            // this.changes で「何件変更されたか」がわかります
            if (this.changes > 0) {
                console.log(`ID: ${id} のデータを更新しました！`);
            } else {
                console.log(`ID: ${id} が見つかりませんでした。`);
            }
        }
    });
});

db.close();
