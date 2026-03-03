'use client'
import React, { useEffect, useMemo, useState } from "react";

// Wake Lock API は TS の lib.dom.d.ts に入ってない環境があるので最小定義
type WakeLockSentinelLike = {
  released: boolean;
  release: () => Promise<void>;
  addEventListener: (type: "release", listener: () => void) => void;
  removeEventListener?: (type: "release", listener: () => void) => void;
};

type NavigatorWithWakeLock = Navigator & {
  wakeLock?: {
    request: (type: "screen") => Promise<WakeLockSentinelLike>;
  };
};

export default function SleepPreventButton() {
  const [isOn, setIsOn] = useState(false);
  const [status, setStatus] = useState<string>("OFF");
  const [error, setError] = useState<string | null>(null);

  const nav = navigator as NavigatorWithWakeLock;

  const supported = useMemo(() => {
    return typeof nav.wakeLock?.request === "function";
  }, [nav.wakeLock]);

  const [sentinel, setSentinel] = useState<WakeLockSentinelLike | null>(null);

  const turnOn = async () => {
    setError(null);

    if (!supported) {
      setStatus("このブラウザは Wake Lock 非対応");
      setIsOn(false);
      return;
    }

    try {
      const s = await nav.wakeLock!.request("screen");

      const onRelease = () => {
        setSentinel(null);
        setIsOn(false);
        setStatus("解除されました（タブ非表示/OS都合など）");
      };

      s.addEventListener("release", onRelease);

      setSentinel(s);
      setIsOn(true);
      setStatus("ON（画面スリープ防止中）");
    } catch (e) {
      const name = e instanceof Error ? e.name : "UnknownError";
      setError(name);
      setIsOn(false);
      setStatus(`失敗: ${name}`);
    }
  };

  const turnOff = async () => {
    setError(null);
    try {
      await sentinel?.release();
    } finally {
      setSentinel(null);
      setIsOn(false);
      setStatus("OFF");
    }
  };

  const toggle = async () => {
    if (sentinel && !sentinel.released) {
      await turnOff();
    } else {
      await turnOn();
    }
  };

  // タブが戻ってきた時に、ON状態を維持したい場合は再取得する
  // （ブラウザが勝手に解除することがある）
  useEffect(() => {
    const handleVis = async () => {
      if (document.visibilityState === "visible") {
        // 「ONのつもり」だったのに解除されていたら再取得
        if (isOn && !sentinel) {
          await turnOn();
        }
      }
    };
    document.addEventListener("visibilitychange", handleVis);
    return () => document.removeEventListener("visibilitychange", handleVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOn, sentinel]);

  // アンマウント時に解除
  useEffect(() => {
    return () => {
      sentinel?.release().catch(() => {});
    };
  }, [sentinel]);

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: 24, maxWidth: 520 }}>
      <h1 style={{ margin: "0 0 12px" }}>スリープ防止</h1>

      <button
        onClick={toggle}
        style={{
          fontSize: 18,
          padding: "12px 16px",
          borderRadius: 12,
          border: "1px solid #ccc",
          cursor: "pointer",
        }}
      >
        {isOn ? "OFFにする" : "ONにする"}
      </button>

      <div style={{ marginTop: 12, opacity: 0.85 }}>
        <div>状態: {status}</div>
        {!supported && <div style={{ marginTop: 6 }}>Chrome / Edge 系で動くことが多いです。</div>}
        {error && <div style={{ marginTop: 6 }}>エラー: {error}</div>}
      </div>

      <hr style={{ margin: "16px 0" }} />

      <details>
        <summary>メモ（挙動）</summary>
        <ul>
          <li>タブが非表示になると解除されることがあります（復帰時に再取得）。</li>
          <li>macOS の「PC本体が寝る」まで確実に止められるかは環境次第です。</li>
        </ul>
      </details>
    </div>
  );
}