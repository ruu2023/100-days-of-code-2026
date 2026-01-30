"use client";

import React, { useState, useEffect, useRef } from "react";

// 定数
const GRAVITY = 0.5;
const JUMP_FORCE = -8;
const BASE_SPEED = 5;
const MAX_SPEED = 12;
const SPAWN_INTERVAL = 1400;

export default function GravityDash() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<"START" | "PLAYING" | "GAMEOVER">("START");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);

  // ゲームエンジン内部状態
  const engine = useRef({
    playerY: 150,
    playerVy: 0,
    score: 0,
    obstacles: [] as { x: number; width: number; height: number; isTop: boolean }[],
    lastPosIsTop: false,
    consecutiveCount: 0 // 同じ側に連続して出た回数
  });

  // スコアに基づく背景色の決定
  const getBgColor = () => {
    if (gameState === "GAMEOVER") return "bg-red-950";
    if (score >= 30) return "bg-rose-900";
    if (score >= 20) return "bg-purple-900";
    if (score >= 10) return "bg-indigo-900";
    return "bg-slate-950";
  };

  const startGame = () => {
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    engine.current = {
      playerY: 150,
      playerVy: 0,
      score: 0,
      obstacles: [],
      lastPosIsTop: false,
      consecutiveCount: 0
    };
    lastSpawnRef.current = performance.now();
    setScore(0);
    setGameState("PLAYING");
  };

  const update = (time: number) => {
    if (gameState !== "PLAYING") return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const e = engine.current;
    const currentSpeed = Math.min(BASE_SPEED + Math.floor(e.score / 5) * 0.7, MAX_SPEED);

    // プレイヤー移動
    e.playerVy += GRAVITY;
    e.playerY += e.playerVy;
    if (e.playerY > canvas.height - 30) { e.playerY = canvas.height - 30; e.playerVy = 0; }
    if (e.playerY < 0) { e.playerY = 0; e.playerVy = 0; }

    // 障害物生成（ここが今回のキモ！）
    if (time - lastSpawnRef.current > SPAWN_INTERVAL - (currentSpeed * 50)) {
      let isTop = Math.random() > 0.5;
      
      // 同じ側に2回連続したら、次は強制的に逆にする
      if (isTop === e.lastPosIsTop) {
        e.consecutiveCount++;
        if (e.consecutiveCount >= 2) {
          isTop = !isTop;
          e.consecutiveCount = 0;
        }
      } else {
        e.consecutiveCount = 0;
      }
      
      e.lastPosIsTop = isTop;
      e.obstacles.push({
        x: canvas.width,
        width: 35,
        height: 60 + Math.random() * 90,
        isTop
      });
      lastSpawnRef.current = time;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 障害物処理
    for (let i = e.obstacles.length - 1; i >= 0; i--) {
      const obs = e.obstacles[i];
      obs.x -= currentSpeed;
      const obsY = obs.isTop ? 0 : canvas.height - obs.height;

      // 判定を少し甘く（5px内側）してプレイ感を向上
      if (
        55 < obs.x + obs.width &&
        75 > obs.x &&
        e.playerY + 5 < obsY + obs.height &&
        e.playerY + 25 > obsY
      ) {
        setGameState("GAMEOVER");
        return;
      }

      if (obs.x + obs.width < 0) {
        e.obstacles.splice(i, 1);
        e.score++;
        setScore(e.score);
      }

      // 描画
      ctx.fillStyle = obs.isTop ? "#fca5a5" : "#f87171";
      ctx.fillRect(obs.x, obsY, obs.width, obs.height);
    }

    // プレイヤー描画
    ctx.fillStyle = "#60a5fa";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#60a5fa";
    ctx.fillRect(50, e.playerY, 30, 30);
    ctx.shadowBlur = 0;

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    if (gameState === "PLAYING") requestRef.current = requestAnimationFrame(update);
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); };
  }, [gameState]);

  useEffect(() => {
    if (score > highScore) setHighScore(score);
  }, [score]);

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen transition-colors duration-700 ${getBgColor()} text-white p-4 font-mono select-none`}
         onClick={() => gameState === "PLAYING" ? (engine.current.playerVy = JUMP_FORCE) : startGame()}>
      
      <div className="text-center mb-6">
        <h1 className="text-4xl font-black tracking-tighter italic">NEO <span className="text-blue-400">DASH</span></h1>
        <div className="text-xs opacity-50 uppercase tracking-widest mt-1">Record: {highScore} pts</div>
      </div>

      <div className="relative border-2 border-white/20 rounded-2xl overflow-hidden shadow-2xl bg-black/20">
        <canvas ref={canvasRef} width={600} height={300} className="max-w-full" />
        
        <div className="absolute top-4 left-6">
          <p className="text-3xl font-black">{score}</p>
          <p className="text-[10px] text-blue-300">SCORE</p>
        </div>

        {gameState !== "PLAYING" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
            <h2 className="text-6xl font-black italic mb-4">{gameState === "START" ? "READY?" : "FAIL"}</h2>
            <button className="px-10 py-3 bg-white text-black font-bold hover:bg-blue-400 hover:text-white transition-all">
              {gameState === "START" ? "SYNC ENGINE" : "RETRY SYSTEM"}
            </button>
          </div>
        )}
      </div>

      <div className="mt-8 flex gap-6 text-[10px] opacity-40 uppercase">
        <p>Avoid streaks: <span className="text-white">Enabled</span></p>
        <p>Speed: <span className="text-white">x{(1 + (Math.floor(score/5) * 0.1)).toFixed(1)}</span></p>
      </div>
    </div>
  );
}