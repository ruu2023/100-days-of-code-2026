# NDLOCR-Lite API

Cloud Runで動かすOCR APIサーバー。国会図書館のOCRライブラリ「ndlocr-lite」を使用。

## 必要環境

- Python 3.10+
- Docker (Cloud Run用)

## Dockerなしでローカル起動

### 依存インストール

```bash
pip install -r requirements.txt
```

### 起動

```bash
python main.py
```

ポート8080で起動します。

### テスト

```bash
curl -X POST -F "file=@test.jpg" http://localhost:8080/ocr
```

## Dockerで動かす

### ビルド

```bash
docker build -t ndlocr-api .
```

### 実行

```bash
docker run -p 8080:8080 ndlocr-api
```

## Cloud Runにデプロイ

```bash
# GCPプロジェクトIDを環境変数に設定
export PROJECT_ID=your-project-id

# デプロイ実行
./deploy.sh
```

## API仕様

### エンドポイント

- `GET /` - ステータス確認
- `GET /health` - ヘルスチェック
- `POST /ocr` - OCR処理

### OCRリクエスト

```bash
curl -X POST \
  -F "file=@image.jpg" \
  https://<service-url>/ocr
```

### レスポンス

```json
{
  "text": "認識されたテキスト...",
  "lines": [
    {
      "id": 0,
      "text": "1行目のテキスト",
      "confidence": 0.95,
      "boundingBox": [[x1,y1], [x2,y2], [x3,y3], [x4,y4]]
    }
  ],
  "image_info": {
    "width": 1920,
    "height": 1080
  }
}
```

## 使用技術

- FastAPI
- ndlocr-lite (国会図書館OCR)
- Google Cloud Run
