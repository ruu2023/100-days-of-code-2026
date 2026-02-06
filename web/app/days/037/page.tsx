"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, RotateCcw, BookOpen, List } from 'lucide-react';

// カードの型定義
interface Card {
  id: number;
  front: string;
  back: string;
}

export default function TangoApp() {
  // --- ステート管理 ---
  const [cards, setCards] = useState<Card[]>([]);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isStudyMode, setIsStudyMode] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  // --- データの保存と読み込み (LocalStorage) ---
  useEffect(() => {
    const saved = localStorage.getItem('tango-cards');
    if (saved) setCards(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('tango-cards', JSON.stringify(cards));
  }, [cards]);

  // --- ハンドラー関数 ---
  const addCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!front || !back) return;
    const newCard = { id: Date.now(), front, back };
    setCards([...cards, newCard]);
    setFront(''); setBack('');
  };

  const deleteCard = (id: number) => {
    setCards(cards.filter(card => card.id !== id));
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  // --- UIコンポーネント ---
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans">
      <div className="max-w-md mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-indigo-600">Simple Tango</h1>
          <button 
            onClick={() => { setIsStudyMode(!isStudyMode); setIsFlipped(false); }}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            {isStudyMode ? <><List size={18}/> 一覧へ</> : <><BookOpen size={18}/> 学習開始</>}
          </button>
        </header>

        {isStudyMode && cards.length > 0 ? (
          // 学習モードのUI
          <div className="space-y-6">
            <div 
              onClick={() => setIsFlipped(!isFlipped)}
              className="h-64 w-full cursor-pointer perspective-1000"
            >
              <div className={`relative w-full h-full text-center transition-transform duration-500 shadow-xl rounded-2xl bg-white flex items-center justify-center p-6 text-xl font-medium ${isFlipped ? 'text-indigo-600' : 'text-gray-800'}`}>
                {isFlipped ? cards[currentIndex].back : cards[currentIndex].front}
                <div className="absolute bottom-4 text-xs text-gray-400">タップして反転</div>
              </div>
            </div>
            <button 
              onClick={nextCard}
              className="w-full py-4 bg-white border-2 border-indigo-600 text-indigo-600 rounded-xl font-bold hover:bg-indigo-50 transition"
            >
              次のカードへ
            </button>
          </div>
        ) : (
          // 編集・一覧モードのUI
          <div className="space-y-8">
            <form onSubmit={addCard} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-4">
              <input 
                type="text" placeholder="表面 (問題)" value={front}
                onChange={(e) => setFront(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <input 
                type="text" placeholder="裏面 (答え)" value={back}
                onChange={(e) => setBack(e.target.value)}
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 rounded-lg font-semibold">
                <Plus size={20}/> カードを追加
              </button>
            </form>

            <div className="space-y-3">
              <h2 className="font-semibold text-gray-600 flex items-center gap-2">
                <List size={18}/> カード一覧 ({cards.length})
              </h2>
              {cards.map((card) => (
                <div key={card.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center group">
                  <div className="overflow-hidden">
                    <p className="font-medium text-gray-800 truncate">{card.front}</p>
                    <p className="text-sm text-gray-500 truncate">{card.back}</p>
                  </div>
                  <button onClick={() => deleteCard(card.id)} className="text-gray-400 hover:text-red-500 transition">
                    <Trash2 size={18}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}