"use client";

import React, { useState, useEffect } from 'react';
import { Music, Search, Trash2, CheckCircle, Plus, ExternalLink, Youtube } from 'lucide-react';

interface Song {
  id: number;
  title: string;
  artist: string;
  cover: string;
  lyrics: string;
  ytmUrl: string; // YouTube Musicへのリンクを追加
}

export default function LyricApp() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [lyrics, setLyrics] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('my-lyrics-v5');
    if (saved) setSongs(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('my-lyrics-v5', JSON.stringify(songs));
  }, [songs]);

  // リアルタイム検索（デバウンス）
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.length > 1) {
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=5`);
        const data = await res.json();
        setResults(data.results);
      } else { setResults([]); }
    }, 500);
    return () => clearTimeout(timer);
  }, [query]);

  // 保存処理：YouTube Musicの検索URLを生成
  const handleSave = () => {
    if (!selected || !lyrics) return alert("曲を選択し、歌詞を入力してください");
    
    // 曲名とアーティスト名でYouTube Musicの検索URLを作成
    const encodedSearch = encodeURIComponent(`${selected.trackName} ${selected.artistName}`);
    const ytmUrl = `https://music.youtube.com/search?q=${encodedSearch}`;

    const newEntry: Song = {
      id: Date.now(),
      title: selected.trackName,
      artist: selected.artistName,
      cover: selected.artworkUrl100.replace('100x100bb', '400x400bb'),
      lyrics,
      ytmUrl
    };

    setSongs([newEntry, ...songs]);
    setQuery(''); setSelected(null); setLyrics('');
  };

  return (
    <div className="min-h-screen bg-[#030303] text-zinc-100 p-4 md:p-10 font-sans selection:bg-red-500/30">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-black text-red-600 italic tracking-tighter flex items-center gap-2">
            <Youtube size={36} /> LYRIC STUDIO
          </h1>
        </header>

        <div className="grid lg:grid-cols-2 gap-8 mb-10">
          {/* 左：歌詞入力 */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase">Step 1. Paste Lyrics</span>
            <textarea
              placeholder="ここに歌詞を貼り付け..."
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              className="w-full h-80 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 outline-none focus:ring-2 focus:ring-red-600 transition-all text-lg leading-relaxed shadow-2xl"
            />
          </div>

          {/* 右：曲検索 & 保存 */}
          <div className="space-y-6">
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-zinc-500 tracking-[0.2em] uppercase">Step 2. Connect Music</span>
              <div className="relative">
                <input
                  placeholder="曲名・アーティスト名で検索..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 p-5 rounded-2xl outline-none focus:border-red-600 text-xl"
                />
                {results.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden z-50 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                    {results.map((r) => (
                      <button key={r.trackId} onClick={() => {setSelected(r); setResults([]); setQuery('')}} 
                        className="w-full p-4 flex items-center gap-4 hover:bg-zinc-800 text-left border-b border-zinc-800/50">
                        <img src={r.artworkUrl60} className="w-12 h-12 rounded-lg shadow-md" />
                        <div className="truncate text-sm font-bold">{r.trackName} <span className="text-zinc-500 block font-normal">{r.artistName}</span></div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {selected && (
              <div className="p-5 bg-red-600/10 border border-red-600/20 rounded-3xl flex items-center gap-4 animate-in zoom-in-95">
                <img src={selected.artworkUrl60} className="w-16 h-16 rounded-xl shadow-lg" />
                <div className="flex-1 truncate"><p className="font-black text-lg truncate">{selected.trackName}</p><p className="text-red-500 font-bold">{selected.artistName}</p></div>
                <CheckCircle className="text-red-600" size={28} />
              </div>
            )}

            <button onClick={handleSave} className="w-full bg-zinc-100 text-black py-5 rounded-full font-black text-lg hover:bg-white hover:scale-[1.01] active:scale-95 transition-all shadow-xl">
              SAVE ARCHIVE
            </button>
          </div>
        </div>

        {/* ライブラリ表示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {songs.map(song => (
            <div key={song.id} className="bg-zinc-900 rounded-[2.5rem] p-6 border border-zinc-800 hover:border-red-600/50 transition-all group relative">
              <div className="flex gap-4 mb-6">
                <img src={song.cover} className="w-24 h-24 rounded-2xl object-cover shadow-2xl group-hover:rotate-3 transition-transform" />
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h3 className="font-bold text-xl leading-tight truncate">{song.title}</h3>
                  <p className="text-red-600 font-bold text-sm mb-2">{song.artist}</p>
                  <a href={song.ytmUrl} target="_blank" rel="noreferrer" 
                    className="flex items-center gap-1.5 text-[10px] font-black bg-zinc-800 text-zinc-300 w-fit px-3 py-1 rounded-full hover:bg-red-600 hover:text-white transition-colors uppercase">
                    <Youtube size={12} /> Listen
                  </a>
                </div>
              </div>
              <div className="h-48 overflow-y-auto text-sm text-zinc-400 italic leading-relaxed whitespace-pre-wrap border-t border-zinc-800 pt-4 custom-scrollbar">
                {song.lyrics}
              </div>
              <button onClick={() => setSongs(songs.filter(s => s.id !== song.id))} 
                className="absolute top-4 right-4 text-zinc-700 hover:text-red-500 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}