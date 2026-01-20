'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, type SavedImage } from '@/lib/db';
import Image from 'next/image';

export default function PicSpot() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState<SavedImage | null>(null);
  const [zoomScale, setZoomScale] = useState(1);

  // IndexedDBから画像をリアルタイムに取得
  const images = useLiveQuery(() => db.images.orderBy('timestamp').reverse().toArray());

  // 外部URLからの画像取得（CORS制限がある場合はフォールバックが必要）
  const fetchAndSaveImage = async (url: string, name: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      await db.images.add({
        blob,
        name: name || 'dropped-image',
        type: blob.type,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Failed to fetch image:', error);
      alert('一部の画像はセキュリティ制限により直接保存できませんでした。');
    }
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const items = Array.from(e.dataTransfer.items);
    
    for (const item of items) {
      // 1. ファイルとしてのドロップ (ローカルからのドラッグなど)
      if (item.kind === 'file') {
        const file = item.getAsFile();
        if (file && file.type.startsWith('image/')) {
          await db.images.add({
            blob: file,
            name: file.name,
            type: file.type,
            timestamp: Date.now(),
          });
        }
      } 
      // 2. 文字列としてのドロップ (ブラウザの他タブからの画像URLなど)
      else if (item.kind === 'string' && item.type === 'text/html') {
        item.getAsString(async (html) => {
          const doc = new DOMParser().parseFromString(html, 'text/html');
          const img = doc.querySelector('img');
          if (img?.src) {
            await fetchAndSaveImage(img.src, img.alt || 'web-image');
          }
        });
      }
    }
  }, []);

  const handleDelete = async (id: number) => {
    await db.images.delete(id);
  };

  const closeLightbox = () => {
    setActiveImage(null);
    setZoomScale(1);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY < 0) {
      setZoomScale(prev => Math.min(prev + 0.1, 5));
    } else {
      setZoomScale(prev => Math.max(prev - 0.1, 0.5));
    }
  };
  
  const handleClipBoard = async () => {
    if (!activeImage) return;

    try {
      // 1. Blobからキャンバスを作成してPNGに変換 (多くのブラウザがコピー時にPNGを要求するため)
      const url = URL.createObjectURL(activeImage.blob);
      const img = new (window.Image as any)();
      
      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject('Canvas context not found');
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject('Conversion failed');
          }, 'image/png');
        };
        img.onerror = reject;
        img.src = url;
      });

      // 2. クリップボードに書き込み
      const item = new ClipboardItem({ 'image/png': pngBlob });
      await navigator.clipboard.write([item]);
      
      URL.revokeObjectURL(url);
      alert("クリップボードにコピーしました（PNG変換済）");

    } catch (error) {
      console.error("クリップボードにコピーできませんでした", error);
      alert("コピーに失敗しました。このブラウザが画像コピーをサポートしていない可能性があります。");
    }
  };

  return (
    <main 
      className={`min-h-screen p-8 transition-colors duration-300 ${
        isDragging ? 'bg-indigo-900/20' : 'bg-slate-950'
      }`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <div className="max-w-6xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-4">
            Pic-Spot
          </h1>
          <p className="text-slate-400">外部サイトから画像をドラッグ＆ドロップしてコレクション</p>
        </header>

        {/* ギャラリーグリッド */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {images?.map((img) => (
            <div 
              key={img.id}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-indigo-500 transition-all cursor-pointer shadow-xl"
              // onClick={() => setSelectedImage(URL.createObjectURL(img.blob))}
              onClick={() => setActiveImage(img)}
            >
              <img 
                src={URL.createObjectURL(img.blob)} 
                alt={img.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <button 
                onClick={(e) => { e.stopPropagation(); img.id && handleDelete(img.id); }}
                className="absolute top-3 right-3 p-2 bg-red-500/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          ))}

          {/* 空の状態のプレースホルダー */}
          {images?.length === 0 && (
            <div className="col-span-full py-32 text-center border-2 border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-500">ここに画像をドロップしてください</p>
            </div>
          )}
        </div>
      </div>

      {/* ライトボックス（拡大表示・ズーム機能付き） */}
      {activeImage && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300"
          onWheel={handleWheel}
        >
          {/* コントロールバー */}
          <div className="absolute top-6 flex items-center gap-4 px-6 py-3 bg-slate-900/80 backdrop-blur-xl rounded-full border border-slate-800 z-[60] shadow-2xl">
            <button onClick={() => setZoomScale(prev => Math.max(prev - 0.2, 0.5))} className="text-slate-400 hover:text-indigo-400 p-1 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </button>
            <span className="text-sm font-mono min-w-[50px] text-center text-slate-200">{Math.round(zoomScale * 100)}%</span>
            <button onClick={() => setZoomScale(prev => Math.min(prev + 0.2, 5))} className="text-slate-400 hover:text-indigo-400 p-1 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
            </button>
            <div className="w-px h-4 bg-slate-700 mx-2" />
            <button onClick={() => setZoomScale(1)} className="text-xs font-bold text-slate-400 hover:text-white transition-colors">RESET</button>
            <button 
              onClick={handleClipBoard} 
              className="px-3 py-1.5 flex items-center gap-2 text-slate-400 hover:text-indigo-400 transition-colors bg-slate-800/50 rounded-lg hover:bg-slate-800"
              title="クリップボードにコピー"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span className="text-xs font-bold uppercase tracking-wider">Copy</span>
            </button>
            <div className="w-px h-4 bg-slate-700 mx-2" />
            <button 
              onClick={closeLightbox} 
              className="text-slate-400 hover:text-red-400 transition-colors p-1"
              title="閉じる"
            >
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* 画像表示エリア */}
          <div 
            className="w-full h-full overflow-auto flex items-center justify-center p-12 cursor-grab active:cursor-grabbing"
            onClick={closeLightbox}
          >
            <div 
              className="relative transition-transform duration-200 ease-out origin-center"
              style={{ transform: `scale(${zoomScale})` }}
              onClick={(e) => e.stopPropagation()}
              onDoubleClick={() => setZoomScale(prev => prev === 1 ? 2 : 1)}
            >
              <img 
                src={URL.createObjectURL(activeImage.blob)} 
                alt="Expanded" 
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl select-none pointer-events-none"
              />
            </div>
          </div>
          
          <p className="absolute bottom-6 text-slate-500 text-xs font-medium">スクロールでズーム / ダブルクリックでリセット</p>
        </div>
      )}
    </main>
  );
}
