const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('videos.db');

// コマンドライン引数からデータを取得
// 実行例: node add.js "My Video" "http://..." 5 "Awesome!"
const title = process.argv[2];
const url = process.argv[3];
const rating = process.argv[4];
const memo = process.argv[5];

// if (!title || !url) {
//     console.log("使い方: node add.js <タイトル> <URL> <評価(1-5)> <感想>");
//     process.exit(1);
// }

const data = [
  {title: "My Video 1", url: "http://...", rating: 5, memo: "Awesome!"},
  {title: "My Video 2", url: "http://...", rating: 5, memo: "Awesome!"},
  {title: "My Video 3", url: "http://...", rating: 5, memo: "Awesome!"},
  {title: "My Video 4", url: "http://...", rating: 5, memo: "Awesome!"},
  {title: "My Video 5", url: "http://...", rating: 5, memo: "Awesome!"},
  {title: "My Video 6", url: "http://...", rating: 5, memo: "Awesome!"},
  {title: "My Video 7", url: "http://...", rating: 5, memo: "Awesome!"},
  {title: "My Video 8", url: "http://...", rating: 5, memo: "Awesome!"},
  {title: "My Video 9", url: "http://...", rating: 5, memo: "Awesome!"},
  {title: "My Video 10", url: "http://...", rating: 5, memo: "Awesome!"},
  {title: "My Video 11", url: "http://...", rating: 5, memo: "Awesome!"},
  {title: "My Video 12", url: "http://...", rating: 5, memo: "Awesome!"},
  {title: "My Video 13", url: "http://...", rating: 5, memo: "Awesome!"},
  {title: "My Video 14", url: "http://...", rating: 5, memo: "Awesome!"},
  {title: "My Video 15", url: "http://...", rating: 5, memo: "Awesome!"},
  {title: "My Video 16", url: "http://...", rating: 5, memo: "Awesome!"},
]

db.serialize(() => {
    // SQL Challenge 2: INSERT Data
    // プレースホルダー (?) を使うことで、SQLインジェクションを防ぎます。
    const sql = `
    INSERT INTO videos (title, url, rating, memo)
    VALUES (?, ?, ?, ?)
    `;

    // run(sql, [params], callback)
    data.forEach((item) => {
      db.run(sql, [item.title, item.url, item.rating, item.memo], function(err) {
          if (err) {
              console.error("データ追加失敗...", err.message);
          } else {
              // this.lastID で、今追加されたデータのIDがわかります
              console.log(`動画を追加しました！ (ID: ${this.lastID})`);
              console.log(`タイトル: ${title}`);
          }
      });
    })
});

db.close();
