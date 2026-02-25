"""
VOICEVOX を使って docs/api/data.json からずんだもん音声を生成するスクリプト
出力: docs/audio/{id}.wav
     docs/audio/manifest.json（プレイヤー用メタデータ）
"""

import json
import os
import re
import time
import requests
from pathlib import Path

# ==============================
# 設定
# ==============================
VOICEVOX_URL = "http://localhost:50021"
SPEAKER_ID = 3  # ずんだもん（ノーマル）
# 他のずんだもん声質: 1=あまあま, 2=ツンツン, 4=セクシー, 5=ささやき, 22=ヒソヒソ

INPUT_JSON = Path("docs/api/data.json")
OUTPUT_DIR = Path("docs/audio")
MANIFEST_PATH = OUTPUT_DIR / "manifest.json"

# ==============================
# テキスト前処理
# ==============================
def clean_text(text: str) -> str:
    """読み上げ用テキストのクリーニング"""
    # URLを除去
    text = re.sub(r'https?://\S+', '', text)
    # 記号を読みやすく置換
    text = text.replace('【', '').replace('】', '。')
    text = text.replace('「', '').replace('」', '。')
    text = text.replace('…', '。')
    text = text.replace('・・・', '。')
    text = text.replace('\n', '。')
    # 連続する句点を整理
    text = re.sub(r'。{2,}', '。', text)
    text = text.strip()
    return text

def build_speech_text(item: dict) -> str:
    """ニュースアイテムから読み上げテキストを構築"""
    title = clean_text(item.get("title", ""))
    summary = clean_text(item.get("summary", ""))
    category = item.get("category", "")

    parts = []
    if category:
        parts.append(f"{category}のニュースなのだ。")
    parts.append(f"{title}。")
    if summary:
        # サマリーが長すぎる場合は最初の300文字に制限
        if len(summary) > 300:
            summary = summary[:300] + "。以上なのだ"
        parts.append(summary)

    return "".join(parts)

# ==============================
# VOICEVOX API
# ==============================
def generate_audio(text: str, output_path: Path) -> bool:
    """テキストから音声ファイルを生成"""
    try:
        # 音声クエリ生成
        query_res = requests.post(
            f"{VOICEVOX_URL}/audio_query",
            params={"text": text, "speaker": SPEAKER_ID},
            timeout=30
        )
        query_res.raise_for_status()
        query = query_res.json()

        # 読み上げ速度を少し上げる（デフォルト1.0）
        query["speedScale"] = 1.1
        query["intonationScale"] = 1.2  # 抑揚を強調

        # 音声合成
        synth_res = requests.post(
            f"{VOICEVOX_URL}/synthesis",
            params={"speaker": SPEAKER_ID},
            json=query,
            timeout=60
        )
        synth_res.raise_for_status()

        output_path.parent.mkdir(parents=True, exist_ok=True)
        output_path.write_bytes(synth_res.content)
        print(f"  ✅ 生成完了: {output_path}")
        return True

    except requests.exceptions.RequestException as e:
        print(f"  ❌ 生成失敗: {e}")
        return False

# ==============================
# メイン処理
# ==============================
def main():
    print("📰 news.json を読み込み中...")
    if not INPUT_JSON.exists():
        print(f"❌ {INPUT_JSON} が見つかりません")
        return

    with open(INPUT_JSON, encoding="utf-8") as f:
        news_items = json.load(f)

    print(f"  → {len(news_items)} 件のニュースを検出")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    manifest = []

    for i, item in enumerate(news_items):
        item_id = item.get("id", f"news-{i}")
        safe_id = re.sub(r'[^\w\-]', '_', item_id)
        audio_path = OUTPUT_DIR / f"{safe_id}.wav"

        print(f"\n[{i+1}/{len(news_items)}] {item.get('title', '')[:40]}...")

        # 既存ファイルがあればスキップ（増分生成）
        if audio_path.exists():
            print(f"  ⏭️  スキップ（既存ファイルあり）")
        else:
            speech_text = build_speech_text(item)
            print(f"  📝 読み上げテキスト ({len(speech_text)}文字): {speech_text[:60]}...")
            success = generate_audio(speech_text, audio_path)
            if not success:
                continue
            time.sleep(0.5)  # API 過負荷防止

        manifest.append({
            "id": item_id,
            "title": item.get("title", ""),
            "url": item.get("url", ""),
            "source": item.get("source", ""),
            "category": item.get("category", ""),
            "date": item.get("date", ""),
            "summary": item.get("summary", ""),
            "bookmarkCount": item.get("bookmarkCount", 0),
            "audioFile": f"../audio/{safe_id}.wav"
        })

    # manifest.json を出力（GitHub Pages のプレイヤーが読み込む）
    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

    print(f"\n✅ 完了！{len(manifest)} 件の音声を生成しました")
    print(f"📋 manifest.json: {MANIFEST_PATH}")

if __name__ == "__main__":
    main()