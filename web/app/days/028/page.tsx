"use client"
import React, { useState, useEffect } from  'react';

export default function GlassGenerator() {
  // state
  const [blur, setBlur] = useState(10);
  const [opacity, setOpacity] = useState(0.2);
  const [color, setColor] = useState("#ffffff");
  const [copied, setCopied] = useState(false);

  // css code
  const glassStyle = {
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    backgroundColor: `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    border: "1px solid rgba(255,255,255,0.125)",
  };

  const cssCode = `background: rgba(${parseInt(color.slice(1,3), 16)}, ${parseInt(color.slice(3,5), 16)}, ${parseInt(color.slice(5,7), 16)});
  backdrop-filter: blur(${blur}px);
  -webkit-backdrop-filter: blur(${blur}px);
  border: 1px solid rgba(255,255,255,${opacity});
  border-radius: 12px;`
  
  // clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(cssCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 text-white font-sans">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* ヘッダー */}
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Glassmorphism Generator</h1>
          <p className="mt-2 opacity-80">実用的なデザインを簡単に作成するためのジェネレーターです。</p>
        </header>
        
        <main className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* preview */}
          <div className="flex justify-center items-center h-64 bg-white/10 rounded-3xl relative overflow-hidden">
            <div className="absolute w-32 h-32 bg-yellow-300 rounded-full -top-10 -left-10 animate-pulse" />
            <div className="absolute w-48 h-48 bg-blue-400 rounded-full -bottom-10 -right-10 animate-bounce" />

            <div style={glassStyle} className="w-64 h-40 rounded-xl flex items-center justify-center shadow-2xl z-10 border border-white/20">
              <span className="text-lg font-semibold tracking-widest uppercase">Preview</span>
            </div>
          </div>

          {/* Control */}
          <div className="bg-black/20 p-6 rounded-2xl space-y-6 backdrop-blur-md">
            <div>
              <label htmlFor="" className="block text-sm font-medium mb-2">Blur: {blur}px</label>
              <input type="range" min="0" max="20" step="0.5" value={blur} onChange={(e) => setBlur(Number(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white" />

            </div>

            <div>
              <label htmlFor="" className="block text-sm font-medium mb-2">Opacity: {opacity}</label>
              <input type="range" min="0" max="1" step="0.01" value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-white" />
            </div>

            <div>
              <label htmlFor="" className="block text-sm font-medium mb-2">Background Color:</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-full h-10 bg-transparent border-none cursor-pointer" />
            </div>
          </div>
        </main>

        {/* code output */}
        <div className="bg-slate-900/80 rounded-xl p-6 relative group">
          <pre className="text-sm font-mono text-blue-300 overflow-x-auto">
            <code>{cssCode}</code>
          </pre>
          
          <button onClick={copyToClipboard} className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all flex items-center gap-2">
            {copied ? "Copied!" : "Copy Code"}
          </button>
        </div>

      </div>

    </div>
  )

}
