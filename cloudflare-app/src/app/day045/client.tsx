'use client';
import { createCustomerActions, deleteCustomersActions, getCustomersActions } from '@/actions/customers';

import React, { useState, useEffect } from "react";
import { Send, Trash2, User } from "lucide-react";

// メッセージの型定義
type Message = {
  CustomerId: number;
  CompanyName: string;
  ContactName: string;
};

const Client = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState("");
    const [userName, setUserName] = useState("名無しさん");

    // 初回レンダリング時にLocalStorageからデータを読み込む
    useEffect( () => {
      const fetch = async () => {
        const saved = await getCustomersActions() as Message[];
        if (saved) {
          setMessages(saved);
        }
      }
      fetch();
    }, []);

    // メッセージが更新されたらLocalStorageに保存する
    useEffect(() => {
      localStorage.setItem("my-board-messages", JSON.stringify(messages));
    }, [messages]);


    const sendMessage = async () => {
      if (!inputText.trim()) return;

      const newMessage: Message = {
        CustomerId: Date.now(),
        CompanyName: inputText,
        ContactName: userName || "名無しさん",
      };

      await createCustomerActions(newMessage.CompanyName, newMessage.ContactName);

      setMessages([newMessage, ...messages]);
      setInputText(""); // 入力欄を空にする
    }

    // 投稿ボタンを押した時の処理
    const handlePost = (e: React.FormEvent) => {
      e.preventDefault();
      sendMessage();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      // IME入力中（変換中）の Enter は無視する
      if (e.nativeEvent.isComposing || e.key !== 'Enter') return;

      // Shift + Enter は改行したい場合
      if (e.shiftKey) return;

      // 送信処理へ
      e.preventDefault(); // デフォルトの改行を防ぐ
      sendMessage();
    };

    // 掲示板をクリアする処理
    const clearBoard = () => {
      if (confirm("全ての書き込みを削除しますか？")) {
        setMessages([]);
        deleteCustomersActions();
      }
    };
    return (

  <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          
          {/* ヘッダー部分 */}
          <header className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-indigo-600">匿名一言掲示板</h1>
            <button 
              onClick={clearBoard}
              className="flex items-center gap-1 text-sm text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
              <span>全削除</span>
            </button>
          </header>

          {/* 投稿フォーム */}
          <form onSubmit={handlePost} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-full text-sm">
                <User size={14} />
                <input 
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-transparent focus:outline-none w-24 font-medium"
                  placeholder="名前"
                />
              </div>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full h-24 p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none mb-3"
              placeholder="今、何を考えてる？（Shift+Enterで改行）"
            />
            <button 
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <Send size={18} />
              <span>投稿する</span>
            </button>
          </form>

          {/* タイムライン */}
          <div className="space-y-4">
            {messages.length === 0 && (
              <p className="text-center text-slate-400 py-10">まだ投稿がありません。最初の声を残しましょう！</p>
            )}
            {messages.map((msg) => (
              <div key={msg.CustomerId} className="bg-white p-5 rounded-lg border border-slate-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-indigo-400 text-sm">@{msg.ContactName}</span>
                </div>
                <p className="whitespace-pre-wrap break-words text-slate-700 leading-relaxed">
                  {msg.CompanyName}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>

  )
}

export default Client
