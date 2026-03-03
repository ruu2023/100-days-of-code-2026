"use client";

import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const AUDIO_BASE_URL = 'https://ruu2023.github.io/100-days-of-code-2026';
const MANIFEST_URL = `${AUDIO_BASE_URL}/audio/manifest.json`;

// ============================================================
// 型定義
// ============================================================
type NewsItem = {
  id: string;
  title: string;
  url: string;
  source: string;
  category: string;
  date: string;
  summary: string;
  bookmarkCount: number;
  audioFile: string;
};

// "../audio/foo.wav" → 絶対 URL に変換
function resolveAudioUrl(audioFile: string): string {
  const filename = audioFile.split("/").pop() ?? audioFile;
  return `${AUDIO_BASE_URL}/audio/${filename}`;
}

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function formatTime(sec: number) {
  if (!isFinite(sec) || isNaN(sec)) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ============================================================
// NewsCard コンポーネント
// ============================================================
type CardProps = {
  item: NewsItem;
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  onPlay: () => void;
  onStop: () => void;
  onSeek: (ratio: number) => void;
};

function NewsCard({
  item,
  isPlaying,
  progress,
  currentTime,
  duration,
  onPlay,
  onStop,
  onSeek,
}: CardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card
      className={`transition-all duration-200 ${
        isPlaying
          ? "border-green-400 shadow-md shadow-green-100 bg-green-50"
          : "hover:border-gray-300"
      }`}
    >
      <CardContent className="p-4">
        {/* Top row */}
        <div className="flex items-start gap-3">
          {/* Play / Stop ボタン */}
          <Button
            size="icon"
            variant={isPlaying ? "default" : "outline"}
            className={`shrink-0 rounded-full w-10 h-10 ${
              isPlaying ? "bg-green-500 hover:bg-green-600 border-green-500" : ""
            }`}
            onClick={isPlaying ? onStop : onPlay}
          >
            <span className="text-xs">{isPlaying ? "⏹" : "▶"}</span>
          </Button>

          {/* メタ情報 + タイトル */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              {item.category && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-green-100 text-green-700 hover:bg-green-100"
                >
                  {item.category}
                </Badge>
              )}
              {item.bookmarkCount > 0 && (
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground"
                >
                  ⭐ {item.bookmarkCount}
                </Badge>
              )}
              <span className="text-xs font-mono text-muted-foreground ml-auto">
                {formatDate(item.date)}
              </span>
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-semibold leading-snug line-clamp-2 hover:text-green-600 transition-colors"
            >
              {item.title}
            </a>
          </div>
        </div>

        {/* サマリー */}
        {item.summary && (
          <div className="mt-2 pl-[52px]">
            <p
              className={`text-xs text-muted-foreground leading-relaxed cursor-pointer ${
                expanded ? "" : "line-clamp-2"
              }`}
              onClick={() => setExpanded((v) => !v)}
            >
              {item.summary}
            </p>
            {!expanded && (
              <button
                className="text-xs text-green-600 mt-0.5 hover:underline"
                onClick={() => setExpanded(true)}
              >
                もっと見る
              </button>
            )}
          </div>
        )}

        {/* プログレスバー（再生中のみ） */}
        {isPlaying && (
          <div className="mt-3">
            <div
              className="w-full h-1.5 bg-gray-200 rounded-full cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                onSeek((e.clientX - rect.left) / rect.width);
              }}
            >
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs font-mono text-muted-foreground mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// /voice ページ本体
// ============================================================
export default function VoicePage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [playingId, setPlayingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number | null>(null);

  // manifest 取得
  useEffect(() => {
    fetch(`${MANIFEST_URL}?t=${Date.now()}`)
      .then((r) => {
        if (!r.ok) throw new Error(`manifest fetch failed: ${r.status}`);
        return r.json() as Promise<NewsItem[]>;
      })
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  // RAF ループ
  const startRaf = (audio: HTMLAudioElement) => {
    const tick = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress(audio.duration ? audio.currentTime / audio.duration : 0);
      if (!audio.paused) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const stopAll = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setPlayingId(null);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  };

  const handlePlay = (item: NewsItem) => {
    stopAll();
    const audio = new Audio(resolveAudioUrl(item.audioFile));
    audioRef.current = audio;
    setPlayingId(item.id);
    audio.addEventListener("loadedmetadata", () => setDuration(audio.duration));
    audio.addEventListener("ended", stopAll);
    audio.play().catch(() => stopAll());
    startRaf(audio);
  };

  const handleSeek = (ratio: number) => {
    if (!audioRef.current || !audioRef.current.duration) return;
    audioRef.current.currentTime = ratio * audioRef.current.duration;
  };

  useEffect(() => () => stopAll(), []);

  const playingItem = items.find((i) => i.id === playingId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-500 grid place-items-center text-sm">
            🌿
          </div>
          <h1 className="font-bold text-lg tracking-tight">
            ずんだもん<span className="text-green-500">NEWS</span>
          </h1>
          {!loading && !error && (
            <span className="ml-auto text-xs font-mono text-muted-foreground">
              {items.length} stories
            </span>
          )}
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-4 py-6 pb-28">
        {/* ローディング */}
        {loading && (
          <div className="text-center py-20 text-muted-foreground">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-green-500 rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">ニュースを読み込み中なのだ…</p>
          </div>
        )}

        {/* エラー */}
        {error && (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-sm">データを読み込めなかったのだ 😢</p>
            <p className="text-xs mt-1 font-mono text-red-400">{error}</p>
          </div>
        )}

        {/* 空 */}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-20 text-muted-foreground text-sm">
            ニュースがないのだ 😢
          </div>
        )}

        {/* ニュースカード一覧 */}
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <NewsCard
              key={item.id}
              item={item}
              isPlaying={playingId === item.id}
              progress={playingId === item.id ? progress : 0}
              currentTime={playingId === item.id ? currentTime : 0}
              duration={playingId === item.id ? duration : 0}
              onPlay={() => handlePlay(item)}
              onStop={stopAll}
              onSeek={handleSeek}
            />
          ))}
        </div>
      </main>

      {/* Now Playing バー */}
      {playingItem && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
          {/* ミニプログレス */}
          <div className="h-0.5 bg-gray-100">
            <div
              className="h-full bg-green-500 transition-all duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-green-600 uppercase tracking-wider mb-0.5">
                Now Playing
              </p>
              <p className="text-sm font-semibold truncate">{playingItem.title}</p>
            </div>
            <span className="text-xs font-mono text-muted-foreground shrink-0">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={stopAll}
              className="text-xs hover:border-red-400 hover:text-red-500 shrink-0"
            >
              ■ Stop
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}