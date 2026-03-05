#!/bin/bash

export OLLAMA_HOST="0.0.0.0:${PORT:-8080}"

# Ollamaをバックグラウンドで起動
ollama serve &

# サーバー起動を待つ
sleep 5

# 使いやすい名前(lfm2.5)でモデルを作成（すでに内包されているファイルを元にする）
ollama create lfm2.5 -f /dev/stdin <<EOF
FROM hf.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF:Q4_K_M
EOF

# プロセスを維持
wait