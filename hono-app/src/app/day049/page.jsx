"use client";

import React, { useState, useEffect } from 'react';
import { Copy, Check, Trash2, Settings } from 'lucide-react';

function ConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-80 border border-slate-200">
        <h2 className="text-slate-800 font-bold text-lg mb-2">下書きを削除しますか？</h2>
        <p className="text-slate-400 text-sm mb-6">この操作は元に戻せません。</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
            キャンセル
          </button>
          <button onClick={onConfirm} className="flex-1 py-2 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors">
            削除する
          </button>
        </div>
      </div>
    </div>
  );
}

function LimitSettingModal({ currentLimit, onSave, onCancel }) {
  const [inputValue, setInputValue] = useState(String(currentLimit));
  const parsed = parseInt(inputValue, 10);
  const isValid = !isNaN(parsed) && parsed >= 1 && parsed <= 100000;

  const presets = [
    { label: 'X (旧Twitter)', value: 140 },
    { label: 'Instagram', value: 2200 },
    { label: '小論文', value: 800 },
    { label: 'レポート', value: 2000 },
    { label: '原稿用紙1枚', value: 400 },
  ];

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-96 border border-slate-200">
        <h2 className="text-slate-800 font-bold text-lg mb-4">最大文字数を設定</h2>

        {/* プリセット */}
        <div className="flex flex-wrap gap-2 mb-4">
          {presets.map((p) => (
            <button
              key={p.value}
              onClick={() => setInputValue(String(p.value))}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                ${parseInt(inputValue) === p.value
                  ? 'bg-sky-500 text-white border-sky-500'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-sky-300'}`}
            >
              {p.label} ({p.value})
            </button>
          ))}
        </div>

        {/* カスタム入力 */}
        <div className="mb-1">
          <label className="text-xs text-slate-400 font-medium mb-1 block">カスタム文字数</label>
          <input
            type="number"
            min={1}
            max={100000}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className={`w-full px-4 py-2 rounded-xl border text-slate-800 font-bold text-lg focus:outline-none transition-colors
              ${isValid ? 'border-slate-200 focus:border-sky-400' : 'border-red-300 focus:border-red-400'}`}
          />
          {!isValid && (
            <p className="text-xs text-red-400 mt-1">1〜100,000 の範囲で入力してください</p>
          )}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors">
            キャンセル
          </button>
          <button
            onClick={() => isValid && onSave(parsed)}
            disabled={!isValid}
            className="flex-1 py-2 rounded-xl bg-sky-500 text-white font-bold hover:bg-sky-600 transition-colors disabled:opacity-40"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

// プログレスバーの色を進捗に応じて変化させる
function getProgressColor(ratio) {
  if (ratio < 0.7) return 'bg-sky-400';
  if (ratio < 0.9) return 'bg-amber-400';
  if (ratio <= 1.0) return 'bg-orange-500';
  return 'bg-red-500';
}

export default function DraftApp() {
  const [text, setText] = useState("");
  const [limit, setLimit] = useState(140);
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showLimitSetting, setShowLimitSetting] = useState(false);

  // 初回読み込み
  useEffect(() => {
    const savedText = localStorage.getItem("draft_text");
    const savedLimit = localStorage.getItem("draft_limit");
    if (savedText) setText(savedText);
    if (savedLimit) setLimit(parseInt(savedLimit, 10));
  }, []);

  const handleChange = (e) => {
    const value = e.target.value;
    setText(value);
    localStorage.setItem("draft_text", value);
  };

  const handleSaveLimit = (newLimit) => {
    setLimit(newLimit);
    localStorage.setItem("draft_limit", String(newLimit));
    setShowLimitSetting(false);
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmClear = () => {
    setText("");
    localStorage.removeItem("draft_text");
    setShowConfirm(false);
  };

  const ratio = text.length / limit;
  const isOverLimit = text.length > limit;
  const progressWidth = Math.min(ratio * 100, 100);
  const progressColor = getProgressColor(ratio);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4 font-sans">
      {showConfirm && (
        <ConfirmModal onConfirm={handleConfirmClear} onCancel={() => setShowConfirm(false)} />
      )}
      {showLimitSetting && (
        <LimitSettingModal
          currentLimit={limit}
          onSave={handleSaveLimit}
          onCancel={() => setShowLimitSetting(false)}
        />
      )}

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

        {/* ヘッダー */}
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h1 className="text-xl font-bold text-slate-800">Draft</h1>
          <div className="flex gap-1">
            <button
              onClick={() => setShowLimitSetting(true)}
              className="p-2 text-slate-400 hover:text-sky-500 transition-colors"
              title="文字数設定"
            >
              <Settings size={20} />
            </button>
            <button
              onClick={() => setShowConfirm(true)}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              title="削除"
            >
              <Trash2 size={20} />
            </button>
          </div>
        </div>

        {/* プログレスバー */}
        <div className="h-1.5 bg-slate-100">
          <div
            className={`h-full transition-all duration-150 ${progressColor}`}
            style={{ width: `${progressWidth}%` }}
          />
        </div>

        {/* 入力エリア */}
        <div className="p-4">
          <textarea
            className={`w-full h-64 p-4 text-lg bg-transparent border-2 rounded-xl focus:outline-none transition-all resize-none
              ${isOverLimit
                ? 'border-red-200 focus:border-red-400'
                : 'border-slate-100 focus:border-sky-400'}`}
            placeholder="ここに入力してください（自動保存されます）"
            value={text}
            onChange={handleChange}
          />
        </div>

        {/* フッター */}
        <div className="px-4 pb-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className={`text-sm font-bold ${isOverLimit ? 'text-red-500' : 'text-slate-500'}`}>
              {text.length.toLocaleString()} / {limit.toLocaleString()}
            </span>
            {isOverLimit ? (
              <span className="text-xs text-red-500 font-medium animate-pulse">
                {(text.length - limit).toLocaleString()}文字オーバー
              </span>
            ) : (
              <span className="text-xs text-slate-400">
                残り {(limit - text.length).toLocaleString()}文字
              </span>
            )}
          </div>

          <button
            onClick={copyToClipboard}
            disabled={text.length === 0}
            className={`flex items-center gap-2 px-6 py-2 rounded-full font-bold transition-all
              ${copied
                ? 'bg-green-500 text-white'
                : 'bg-sky-500 hover:bg-sky-600 text-white shadow-md active:scale-95 disabled:opacity-50'}`}
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      <p className="mt-6 text-slate-400 text-sm">
        ヒント: ⚙️ から最大文字数を変更できます
      </p>
    </div>
  );
}