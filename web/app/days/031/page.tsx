"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, Save, Trash2, Clock, Link as LinkIcon } from "lucide-react";

interface Note {
  id: number;
  timestamp: number;
  text: string;
}

export default function YouTubeNotes() {
  const [videoId, setVideoId] = useState("");
  const [videoTitle, setVideoTitle] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState("");
  const [isApiReady, setIsApiReady] = useState(false); // ★API準備完了フラグ
  const playerRef = useRef<any>(null);
  // 1. 【修正】スクリプト読み込み ＋ データの復元
  useEffect(() => {
    // ★追加: LocalStorageからデータを復元
    const savedId = localStorage.getItem("yt-last-id");
    const savedNotes = localStorage.getItem("yt-notes-v2");
    if (savedId) setVideoId(savedId);
    if (savedNotes) setNotes(JSON.parse(savedNotes));

    if ((window as any).YT && (window as any).YT.Player) {
      setIsApiReady(true);
      return;
    }

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    (window as any).onYouTubeIframeAPIReady = () => {
      setIsApiReady(true);
    };
  }, []);

  // 2. 【修正】動画IDの保存 ＋ プレイヤー作成
  useEffect(() => {
    if (!isApiReady || !videoId) return;

    // ★追加: 現在の動画IDを保存（リロード対策）
    localStorage.setItem("yt-last-id", videoId);

    const createPlayer = () => {
      if (playerRef.current) {
        playerRef.current.destroy();
      }
      playerRef.current = new (window as any).YT.Player("yt-player", {
        videoId: videoId,
        events: {
          onReady: (e: any) => {
            setVideoTitle(e.target.getVideoData().title);
          },
        },
      });
    };

    createPlayer();
  }, [videoId, isApiReady]);
  // メモの保存
  useEffect(() => {
    localStorage.setItem("yt-notes-v2", JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!currentNote || !playerRef.current) return;
    const currentTime = Math.floor(playerRef.current.getCurrentTime());
    const newNote = {
      id: Date.now(),
      timestamp: currentTime,
      text: currentNote,
    };
    setNotes([...notes, newNote].sort((a, b) => a.timestamp - b.timestamp));
    setCurrentNote("");
  };

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v=|\/embed\/))/);
    return match
      ? url.split("v=")[1]?.split("&")[0] || url.split("/").pop()
      : "";
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-4 font-sans text-zinc-900">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* ヘッダーエリア */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-4">
          <h1 className="text-xl font-black tracking-tighter italic text-blue-600">
            YT_LOG.exe
          </h1>
          <input
            className="border-2 border-zinc-200 rounded-full px-6 py-2 w-full md:w-96 focus:border-blue-500 outline-none shadow-sm"
            placeholder="YouTube URLを貼り付けて開始..."
            onChange={(e) => {
              const id = extractVideoId(e.target.value);
              if (id) setVideoId(id);
            }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border-8 border-white">
              <div id="yt-player" className="w-full h-full"></div>
            </div>

            <div className="flex gap-2 p-2 bg-white rounded-2xl shadow-xl border border-zinc-100">
              <input
                className="flex-1 px-4 py-3 outline-none font-medium"
                value={currentNote}
                placeholder="変換確定後のEnterで記録..."
                onChange={(e) => setCurrentNote(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                    e.preventDefault();
                    addNote();
                  }
                }}
              />
              <button
                onClick={addNote}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200"
              >
                記録
              </button>
            </div>
          </div>

          {/* 右側：メモ一覧（タイトル追加） */}
          <div className="lg:col-span-4 flex flex-col h-[600px] bg-white rounded-3xl border shadow-sm p-6">
            {/* 動画情報エリア：リロードしてもここが出る */}
            {videoId && (
              <div className="mb-6 p-4 bg-zinc-50 rounded-2xl border border-zinc-100 overflow-hidden">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                  Recording Video:
                </p>
                <h2 className="font-bold text-sm text-zinc-800 line-clamp-2 mb-2">
                  {videoTitle || "Loading title..."}
                </h2>
                <a
                  href={`https://www.youtube.com/watch?v=${videoId}`}
                  target="_blank"
                  className="flex items-center gap-1 text-[10px] text-blue-500 font-mono hover:underline"
                >
                  <LinkIcon size={10} /> youtube.com/watch?v={videoId}
                </a>
              </div>
            )}

            <h3 className="flex items-center gap-2 font-bold text-zinc-400 mb-4 text-xs uppercase tracking-tighter">
              <Clock size={14} /> Logged Timestamps
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 bg-white rounded-xl border border-zinc-100 hover:border-blue-200 hover:shadow-md transition group"
                >
                  <div className="flex justify-between items-center mb-1">
                    <button
                      onClick={() =>
                        playerRef.current.seekTo(note.timestamp, true)
                      }
                      className="text-blue-600 font-mono text-xs font-bold bg-blue-50 px-2 py-0.5 rounded"
                    >
                      {Math.floor(note.timestamp / 60)}:
                      {(note.timestamp % 60).toString().padStart(2, "0")}
                    </button>
                    <button
                      onClick={() =>
                        setNotes(notes.filter((n) => n.id !== note.id))
                      }
                      className="text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-sm font-medium text-zinc-700">
                    {note.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
