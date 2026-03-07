```bash
gcloud run deploy hono-next-app --source . --region asia-northeast1
```

```bash
npx wrangler tail hono-api
```


ndlocr テスト
```bash

cd ndlocr-api
python main.py

curl -X POST -F "file=@image.jpeg" http://localhost:8080/ocr
```