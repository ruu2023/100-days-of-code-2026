# --- ビルドステージ ---
FROM golang:1.25-alpine AS build
WORKDIR /app

# モジュールのキャッシュを利用
COPY go.mod ./
# go.sum があればそれも COPY
# COPY go.mod go.sum ./ 
RUN go mod download

COPY . .
# CGO_ENABLED=0 にして、依存関係をすべて含んだバイナリを作る
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o server .

# --- 実行ステージ ---
FROM alpine:latest

# 【重要】ここが HTTPS 通信に必須！
RUN apk --no-cache add ca-certificates

WORKDIR /app
# ビルドステージからバイナリだけを持ってくる
COPY --from=build /app/server /app/server

EXPOSE 8080
ENV PORT=8080

# 実行
CMD ["/app/server"]