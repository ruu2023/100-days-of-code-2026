"use client";

import { BookOpen, List, Pencil, Plus, Sparkles, Trash2, X, Check } from 'lucide-react';
import React, { useEffect, useState } from 'react';

// カードの型定義
interface Card {
  id: string;
  front: string;
  back: string;
}

// API ヘルパー
const api = {
  getCards: () =>
    fetch('/api/tango/cards').then((r) => r.json<{ cards: Card[] }>()),
  addCard: (front: string, back: string) =>
    fetch('/api/tango/cards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ front, back }),
    }).then((r) => r.json<Card>()),
  editCard: (id: string, front: string, back: string) =>
    fetch(`/api/tango/cards/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ front, back }),
    }).then((r) => r.json<{ ok: boolean }>()),
  deleteCard: (id: string) =>
    fetch(`/api/tango/cards/${id}`, { method: 'DELETE' }).then((r) =>
      r.json<{ ok: boolean }>()
    ),
};

export default function TangoApp() {
  const [cards, setCards] = useState<Card[]>([]);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');

  useEffect(() => {
    fetch('/api/tango/cards').then(async (r) => {
      if (r.status === 401) { setIsUnauthorized(true); setIsLoading(false); return; }
      const data = await r.json<{ cards: Card[] }>();
      setCards(data.cards ?? []);
      setIsLoading(false);
    }).catch(() => { setIsUnauthorized(true); setIsLoading(false); });
  }, []);

  const addCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front) return;
    const newCard = await api.addCard(front, back ?? '');
    setCards([...cards, newCard]);
    setFront(''); setBack('');
  };

  const deleteCard = async (id: string) => {
    await api.deleteCard(id);
    setCards(cards.filter((c) => c.id !== id));
  };

  const startEdit = (card: Card) => {
    setEditingId(card.id); setEditFront(card.front); setEditBack(card.back);
  };

  const cancelEdit = () => { setEditingId(null); setEditFront(''); setEditBack(''); };

  const saveEdit = async (id: string) => {
    if (!editFront) return;
    await api.editCard(id, editFront, editBack ?? '');
    setCards(cards.map((c) => c.id === id ? { ...c, front: editFront, back: editBack } : c));
    cancelEdit();
  };

  const nextCard = () => { setIsFlipped(false); setCurrentIndex((p) => (p + 1) % cards.length); };
  const prevCard = () => { setIsFlipped(false); setCurrentIndex((p) => (p - 1 + cards.length) % cards.length); };

  // ローディング画面
  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-purple-300 text-sm tracking-wide">読み込み中...</p>
      </div>
    </div>
  );

  // 未ログイン画面
  if (isUnauthorized) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 flex flex-col items-center justify-center gap-6">
      <div className="p-4 rounded-2xl bg-white/10 backdrop-blur">
        <BookOpen size={40} className="text-purple-300" />
      </div>
      <div className="text-center">
        <p className="text-white text-xl font-bold mb-1">ログインが必要です</p>
        <p className="text-purple-300 text-sm">Single Tango を使うにはログインしてください</p>
      </div>
      <a href="/login" className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-all shadow-lg shadow-purple-900/50">
        ログインする
      </a>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 p-4 sm:p-8">
      <div className="max-w-lg mx-auto">

        {/* ヘッダー */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              ✦ Smart Tango
            </h1>
            <p className="text-purple-400 text-xs mt-0.5 flex items-center gap-1">
              <Sparkles size={11} /> AI powered by Gemini
            </p>
          </div>
          <button
            onClick={() => { setIsStudyMode(!isStudyMode); setIsFlipped(false); setCurrentIndex(0); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              isStudyMode
                ? 'bg-white/10 backdrop-blur text-white hover:bg-white/20'
                : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg shadow-purple-900/50'
            }`}
          >
            {isStudyMode ? <><List size={16} /> 一覧へ</> : <><BookOpen size={16} /> 学習開始</>}
          </button>
        </header>

        {isStudyMode && cards.length > 0 ? (
          /* ── 学習モード ── */
          <div className="space-y-6">
            {/* フリップカード */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="cursor-pointer"
              style={{ perspective: '1200px' }}
            >
              <div
                className="relative w-full transition-transform duration-700"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                  height: '260px',
                }}
              >
                {/* 表面 */}
                <div
                  className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8 backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="absolute inset-0 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl" />
                  <p className="relative text-white text-2xl font-bold text-center leading-relaxed">{cards[currentIndex].front}</p>
                  <p className="relative text-purple-300 text-xs mt-6 flex items-center gap-1">タップして答えを見る</p>
                </div>
                {/* 裏面 */}
                <div
                  className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center p-8"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-600/80 to-indigo-700/80 backdrop-blur-md border border-purple-400/30 shadow-2xl" />
                  <p className="relative text-white/70 text-xs mb-3 uppercase tracking-widest">Answer</p>
                  <p className="relative text-white text-lg font-semibold text-center leading-relaxed">
                    {cards[currentIndex].back || <span className="text-purple-300/60 italic text-base">AIが生成中...</span>}
                  </p>
                </div>
              </div>
            </div>

            {/* 進捗 & ナビ */}
            <div className="flex items-center gap-3">
              <button
                onClick={prevCard}
                className="flex-1 py-3 rounded-xl bg-white/10 backdrop-blur text-white text-sm font-semibold hover:bg-white/20 transition border border-white/10"
              >
                ← 前へ
              </button>
              <span className="text-purple-300 text-sm font-mono whitespace-nowrap">
                {currentIndex + 1} / {cards.length}
              </span>
              <button
                onClick={nextCard}
                className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition shadow-lg shadow-purple-900/50"
              >
                次へ →
              </button>
            </div>

            {/* ドット進捗 */}
            <div className="flex justify-center gap-1.5">
              {cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setIsFlipped(false); setCurrentIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-all ${i === currentIndex ? 'bg-purple-400 w-5' : 'bg-white/20'}`}
                />
              ))}
            </div>
          </div>
        ) : (
          /* ── 一覧・追加モード ── */
          <div className="space-y-6">
            {/* 追加フォーム */}
            <form onSubmit={addCard} className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 p-5 space-y-3">
              <p className="text-white/60 text-xs uppercase tracking-widest mb-1">新しいカードを追加</p>
              <input
                type="text"
                placeholder="単語・フレーズ (表面)"
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <input
                type="text"
                placeholder="説明・答え (裏面) — 空欄でAIが自動生成"
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-semibold text-sm transition shadow-lg shadow-purple-900/40"
              >
                <Plus size={18} /> カードを追加
              </button>
            </form>

            {/* カード一覧 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white/50 text-xs uppercase tracking-widest flex items-center gap-1.5">
                  <List size={12} /> {cards.length} cards
                </h2>
              </div>

              {cards.length === 0 && (
                <div className="rounded-2xl bg-white/5 border border-white/10 p-10 text-center">
                  <p className="text-white/30 text-sm">カードがありません</p>
                  <p className="text-purple-400/50 text-xs mt-1">上のフォームから追加してください</p>
                </div>
              )}

              {cards.map((card) =>
                editingId === card.id ? (
                  /* 編集フォーム */
                  <div key={card.id} className="rounded-xl bg-purple-800/40 border border-purple-500/50 p-4 space-y-2">
                    <input
                      type="text"
                      value={editFront}
                      onChange={(e) => setEditFront(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white/30"
                      placeholder="表面"
                    />
                    <input
                      type="text"
                      value={editBack}
                      onChange={(e) => setEditBack(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder-white/30"
                      placeholder="裏面"
                    />
                    <div className="flex gap-2 justify-end pt-1">
                      <button onClick={cancelEdit} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white/60 transition">
                        <X size={14} />
                      </button>
                      <button onClick={() => saveEdit(card.id)} className="p-2 rounded-lg bg-purple-500 hover:bg-purple-400 text-white transition">
                        <Check size={14} />
                      </button>
                    </div>
                  </div>
                ) : (
                  /* 通常表示 */
                  <div
                    key={card.id}
                    className="group rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-4 py-3 flex justify-between items-center transition-all"
                  >
                    <div className="overflow-hidden flex-1 min-w-0 mr-3">
                      <p className="text-white font-medium text-sm truncate">{card.front}</p>
                      {card.back ? (
                        <p className="text-purple-300/70 text-xs truncate mt-0.5">{card.back}</p>
                      ) : (
                        <p className="text-purple-400/40 text-xs mt-0.5 flex items-center gap-1 italic">
                          <Sparkles size={10} /> AI生成待ち
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(card)} className="p-1.5 rounded-lg text-white/40 hover:text-purple-300 hover:bg-white/10 transition">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => deleteCard(card.id)} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/10 transition">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}