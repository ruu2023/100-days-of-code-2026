posts.json の最新の投稿内容を元に、以下のファイル内へ追記をお願いします。

- README.md

- hono-next/src/app/dashboard/page.tsx

---

```bash
gcloud run deploy hono-next-app --source . --region asia-northeast1
```

```bash
npx wrangler tail hono-api
```


```bash
source .env
kamal deploy
```


ndlocr テスト
```bash

cd ndlocr-api
python main.py

curl -X POST -F "file=@image.jpeg" http://localhost:8080/ocr
```