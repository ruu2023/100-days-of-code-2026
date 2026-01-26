const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('videos.db');

// SQL Challenge 1: Create Table
// カラム構成:
// - id: INTEGER (主キー, 自動連番)
// - title: TEXT (動画のタイトル)
// - url: TEXT (動画のURL)
// - rating: INTEGER (1〜5の評価)
// - memo: TEXT (一言感想)

db.serialize(() => {
    // ヒント: CREATE TABLE IF NOT EXISTS テーブル名 ...
    const sql = `
    CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        url TEXT,
        rating INTEGER,
        memo TEXT
    )
    `;

    db.run(sql, (err) => {
        if (err) {
            console.error("テーブル作成失敗...", err.message);
        } else {
            console.log("動画テーブルを作成しました！ (videos.db)");
        }
    });
});

db.close();
