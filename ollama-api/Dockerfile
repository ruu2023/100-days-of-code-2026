FROM ollama/ollama:latest

# モデルを事前にダウンロードするためのビルド引数
# Ollamaのディレクトリを環境変数で固定
ENV OLLAMA_MODELS=/root/.ollama/models

# 一時的にOllamaを起動してモデルをプルする
RUN ollama serve & \
    sleep 5 && \
    ollama pull hf.co/LiquidAI/LFM2.5-1.2B-Instruct-GGUF:Q4_K_M

# ポート設定（Cloud Run用）
ENV PORT 8080
EXPOSE 8080

# 実行用スクリプトをコピー
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]