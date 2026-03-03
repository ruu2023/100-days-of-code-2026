"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Key, Unlock, Clock, ShieldAlert, Cpu, Database, Trash2, Zap,
  Settings, AlertCircle, Braces, ToggleLeft, List, Type, Hash,
  ChevronRight, Lock, Eye, RefreshCw, Fingerprint, CheckCircle2,
} from "lucide-react";
import { generateJwtAction } from "./actions";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const decodeBase64Url = (str: string) => {
  try {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    const padded = pad ? base64 + "=".repeat(4 - pad) : base64;
    const jsonPayload = decodeURIComponent(
      atob(padded).split("").map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")
    );
    return JSON.parse(jsonPayload);
  } catch { return null; }
};

type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };

const getJsonType = (v: JsonValue) => {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  return typeof v;
};

// ─── JSON Type Config ─────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<string, { label: string; color: string; Icon: React.ElementType; example: string }> = {
  string:  { label: "String",  color: "text-emerald-300 bg-emerald-500/10 border-emerald-500/25", Icon: Type,       example: '"hello"' },
  number:  { label: "Number",  color: "text-amber-300  bg-amber-500/10  border-amber-500/25",     Icon: Hash,       example: "42 / 3.14" },
  boolean: { label: "Boolean", color: "text-sky-300    bg-sky-500/10    border-sky-500/25",        Icon: ToggleLeft, example: "true / false" },
  null:    { label: "Null",    color: "text-zinc-400   bg-zinc-500/10   border-zinc-500/25",       Icon: Braces,     example: "null" },
  object:  { label: "Object",  color: "text-violet-300 bg-violet-500/10 border-violet-500/25",    Icon: Braces,     example: '{ "key": val }' },
  array:   { label: "Array",   color: "text-rose-300   bg-rose-500/10   border-rose-500/25",       Icon: List,       example: "[1, 2, 3]" },
};

const CLAIM_HINTS: Record<string, string> = {
  sub: "Subject — 誰のトークンか（ユーザーID）",
  exp: "Expiration — 有効期限（Unix秒）",
  iat: "Issued At — 発行日時（Unix秒）",
  nbf: "Not Before — この時刻より前は無効",
  iss: "Issuer — トークンを発行したサーバー",
  aud: "Audience — 使用を許可するサービス名",
  alg: "Algorithm — 署名に使ったアルゴリズム",
  typ: "Type — トークン種類（たいてい JWT）",
};

// ─── Sub Components ───────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: string }) {
  const cfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.null;
  const Icon = cfg.Icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-mono font-bold ${cfg.color}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

function FieldRow({ k, v }: { k: string; v: JsonValue }) {
  const type = getJsonType(v);
  const display = type === "string" ? `"${v}"` : type === "array" || type === "object" ? JSON.stringify(v) : String(v);
  const hint = CLAIM_HINTS[k];
  return (
    <div className="grid grid-cols-[160px_1fr] gap-3 items-start py-3 px-3 rounded-xl hover:bg-white/[0.04] transition-colors border border-transparent hover:border-white/5">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-mono text-xs font-bold text-white truncate">{k}</span>
        {hint && <span className="text-[10px] text-zinc-400 leading-tight">{hint}</span>}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <TypeBadge type={type} />
        <span className="font-mono text-xs text-zinc-200 break-all">{display}</span>
      </div>
    </div>
  );
}

function JsonPanel({ title, data, accent }: { title: string; data: Record<string, JsonValue>; accent: string }) {
  return (
    <div className={`rounded-2xl border ${accent} bg-black/25 overflow-hidden`}>
      <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
        <Braces className="w-3.5 h-3.5 text-zinc-400" />
        <span className="text-xs font-semibold text-zinc-200 tracking-widest uppercase">{title}</span>
        <span className="ml-auto text-[10px] text-zinc-500 font-mono">{Object.keys(data).length} keys</span>
      </div>
      <div className="divide-y divide-white/[0.04] px-2 py-1">
        {Object.entries(data).map(([k, v]) => <FieldRow key={k} k={k} v={v as JsonValue} />)}
      </div>
    </div>
  );
}

// ─── Intro Card ───────────────────────────────────────────────────────────────

function IntroCard({ icon, title, body, accent }: {
  icon: React.ReactNode; title: string; body: React.ReactNode; accent: string;
}) {
  return (
    <div className={`rounded-2xl border ${accent} bg-white/[0.03] p-5 space-y-3`}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent} bg-white/5`}>{icon}</div>
        <h3 className="font-bold text-white text-sm">{title}</h3>
      </div>
      <div className="text-sm text-zinc-300 leading-relaxed space-y-2">{body}</div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function Client() {
  const [token, setToken] = useState("");
  const [parts, setParts] = useState<string[]>([]);
  const [header, setHeader] = useState<any>(null);
  const [payload, setPayload] = useState<any>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"pretty" | "raw">("pretty");

  const [genPayload, setGenPayload] = useState(
    JSON.stringify({ sub: "user_123", name: "Alice", role: "admin", exp: Math.floor(Date.now() / 1000) + 3600 }, null, 2)
  );
  const [genSecret, setGenSecret] = useState("my-super-secret-key");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState("");

  const handleGenerate = async () => {
    setIsGenerating(true); setGenError("");
    try { JSON.parse(genPayload); } catch {
      setGenError("ペイロードが正しいJSON形式ではありません"); setIsGenerating(false); return;
    }
    const res = await generateJwtAction(genPayload, genSecret);
    if (res.success && res.token) setToken(res.token);
    else setGenError(res.error || "生成に失敗しました");
    setIsGenerating(false);
  };

  useEffect(() => {
    if (!token) { setParts([]); setHeader(null); setPayload(null); return; }
    const segs = token.split(".");
    setParts(segs);
    if (segs[0]) setHeader(decodeBase64Url(segs[0]));
    if (segs[1]) setPayload(decodeBase64Url(segs[1]));
  }, [token]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (payload?.exp) {
      const tick = () => setCountdown(Math.max(0, payload.exp * 1000 - Date.now()));
      tick(); t = setInterval(tick, 1000);
    } else setCountdown(null);
    return () => clearInterval(t);
  }, [payload]);

  const fmtCountdown = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}分 ${s % 60}秒`;
  };

  const decoded = header && payload;

  return (
    <main className="relative min-h-screen p-4 md:p-8 text-white overflow-hidden pb-32">
      <div className="gradient-bg" />

      <div className="max-w-3xl mx-auto space-y-12 relative z-10">

        {/* ══════════════════════════════════════════════════════════
            HERO
        ══════════════════════════════════════════════════════════ */}
        <header className="flex flex-col items-center text-center space-y-5 pt-10">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-3xl bg-fuchsia-600/15 border border-fuchsia-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(192,132,252,0.25)]"
          >
            <Unlock className="w-10 h-10 text-fuchsia-300" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 text-xs font-semibold mb-4">
              Day 055
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-fuchsia-300 via-purple-300 to-indigo-400 leading-tight">
              JWT Decoder<br />Playground
            </h1>
          </motion.div>
        </header>

        {/* ══════════════════════════════════════════════════════════
            SECTION A: JWTとは何か（前段）
        ══════════════════════════════════════════════════════════ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="space-y-5"
        >
          {/* Lead text */}
          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 md:p-8 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-fuchsia-400" />
              そもそも JWT って何？
            </h2>
            <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
              Webサービスにログインすると「あなたは誰か」をサーバーが把握し続ける必要があります。でも、HTTPは<strong className="text-white">「毎回ゼロから通信する」</strong>仕組みなので、何もしないとリクエストのたびに「誰ですか？」という状態に戻ってしまいます。
            </p>
            <p className="text-zinc-300 leading-relaxed text-sm md:text-base">
              この問題を解決するのが <strong className="text-fuchsia-300">JWT（JSON Web Token）</strong> です。ログイン時にサーバーが「このユーザーの情報と有効期限を詰め込んだ証明書」を発行し、以降のリクエストにはそれを添付するだけで認証が通るようになります。
            </p>

            {/* 3-step visual */}
            <div className="flex flex-col md:flex-row items-center gap-2 mt-4 text-xs font-medium">
              {[
                { icon: <Lock className="w-4 h-4" />, label: "ログイン", sub: "ID・パスワード送信", col: "text-sky-300 border-sky-500/30 bg-sky-500/10" },
                { icon: <ChevronRight className="w-5 h-5 text-zinc-600" />, label: "", sub: "", col: "" },
                { icon: <Fingerprint className="w-4 h-4" />, label: "サーバーが JWT 発行", sub: "署名済み証明書を返却", col: "text-fuchsia-300 border-fuchsia-500/30 bg-fuchsia-500/10" },
                { icon: <ChevronRight className="w-5 h-5 text-zinc-600" />, label: "", sub: "", col: "" },
                { icon: <CheckCircle2 className="w-4 h-4" />, label: "以降のリクエスト", sub: "JWTを添付するだけでOK", col: "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" },
              ].map((item, i) =>
                item.label ? (
                  <div key={i} className={`flex-1 flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border ${item.col}`}>
                    {item.icon}
                    <span className="font-bold">{item.label}</span>
                    <span className="text-zinc-400 text-[10px] text-center">{item.sub}</span>
                  </div>
                ) : (
                  <div key={i} className="hidden md:block shrink-0">{item.icon}</div>
                )
              )}
            </div>
          </div>

          {/* 3 mini cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <IntroCard
              accent="border-sky-500/20"
              icon={<Eye className="w-4 h-4 text-sky-300" />}
              title="中身は暗号化されていない"
              body={<>
                <p>JWTのヘッダーとペイロードは単なる<strong className="text-white">Base64エンコード</strong>。誰でもデコードして中身を見られます。</p>
                <p className="text-zinc-400 text-xs">→ パスワードなどの機密情報は絶対に入れてはいけません。</p>
              </>}
            />
            <IntroCard
              accent="border-fuchsia-500/20"
              icon={<Fingerprint className="w-4 h-4 text-fuchsia-300" />}
              title="改ざんはできない（署名）"
              body={<>
                <p>第3部の<strong className="text-white">Signature</strong>がサーバーの秘密鍵で作られており、少しでも書き換えると署名が合わなくなります。</p>
                <p className="text-zinc-400 text-xs">→ 「読める・けど偽れない」のが絶妙なバランスです。</p>
              </>}
            />
            <IntroCard
              accent="border-amber-500/20"
              icon={<Clock className="w-4 h-4 text-amber-300" />}
              title="有効期限が切れると使えない"
              body={<>
                <p>ペイロードに埋め込まれた <strong className="text-white">exp</strong> の時刻を過ぎると、サーバーはトークンを拒否します。</p>
                <p className="text-zinc-400 text-xs">→ 実際に下でカウントダウンを確認してみましょう。</p>
              </>}
            />
          </div>

          {/* divider with CTA */}
          <div className="flex items-center gap-4 py-2">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-zinc-400 text-xs font-semibold">↓ 実際に体験してみよう</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        </motion.section>

        {/* ══════════════════════════════════════════════════════════
            SECTION B: JWT 生成
        ══════════════════════════════════════════════════════════ */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-black flex items-center justify-center">1</span>
            <h2 className="text-sm font-bold text-zinc-200">JWT を生成する</h2>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-purple-400" />
                  JSON ペイロード
                  <span className="text-[10px] text-zinc-500 ml-1">— 証明書に入れる情報</span>
                </label>
                <textarea
                  value={genPayload}
                  onChange={(e) => setGenPayload(e.target.value)}
                  className="w-full h-36 p-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono text-xs text-zinc-200 resize-none transition-all custom-scrollbar"
                />
              </div>
              <div className="flex flex-col gap-4 justify-end">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    シークレットキー
                    <span className="text-[10px] text-zinc-500 ml-1">— 署名に使う秘密鍵</span>
                  </label>
                  <input
                    type="text"
                    value={genSecret}
                    onChange={(e) => setGenSecret(e.target.value)}
                    className="w-full p-3 bg-black/50 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-mono text-sm text-amber-200 transition-all"
                  />
                </div>
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold rounded-xl transition-all shadow-lg shadow-orange-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  <Zap className="w-4 h-4" />
                  {isGenerating ? "生成中..." : "JWT を生成 →"}
                </button>
                {genError && (
                  <div className="flex items-center gap-2 text-xs text-red-300 bg-red-500/10 p-2.5 rounded-xl border border-red-500/20">
                    <AlertCircle className="w-4 h-4 shrink-0" />{genError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION C: ペースト & カラー表示
        ══════════════════════════════════════════════════════════ */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-6 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-black flex items-center justify-center">2</span>
            <h2 className="text-sm font-bold text-zinc-200">JWT を貼り付けて構造を確認する</h2>
          </div>

          <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-5">
            <div className="relative">
              {token && parts.length === 3 ? (
                <>
                  <div className="w-full min-h-[5rem] p-4 bg-black/50 border border-white/10 rounded-2xl font-mono text-sm leading-loose break-all overflow-y-auto custom-scrollbar">
                    <span className="jwt-header font-semibold">{parts[0]}</span>
                    <span className="text-zinc-600 font-bold">.</span>
                    <span className="jwt-payload font-semibold">{parts[1]}</span>
                    <span className="text-zinc-600 font-bold">.</span>
                    <span className="jwt-signature font-semibold opacity-90">{parts[2]}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2.5 px-1">
                    <div className="flex items-center gap-4 text-[11px] font-semibold">
                      <span className="jwt-header">● Header</span>
                      <span className="jwt-payload">● Payload</span>
                      <span className="jwt-signature opacity-80">● Signature</span>
                    </div>
                    <button onClick={() => setToken("")} className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-zinc-400 hover:text-white">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </>
              ) : (
                <textarea
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="ここに JWT を貼り付けてください…&#10;（Step 1 で生成すると自動的に入力されます）"
                  className="w-full h-28 p-4 bg-black/50 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500/40 font-mono text-sm text-zinc-200 resize-none transition-all placeholder:text-zinc-600"
                />
              )}
            </div>

            {/* 3-part explanation */}
            {token && parts.length === 3 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="mt-4 grid grid-cols-3 gap-2 text-[11px]"
              >
                {[
                  { label: "Header", desc: "アルゴリズム情報", cls: "border-rose-500/25 bg-rose-500/5 text-rose-300" },
                  { label: "Payload", desc: "ユーザー情報・有効期限", cls: "border-purple-500/25 bg-purple-500/5 text-purple-300" },
                  { label: "Signature", desc: "改ざん検知の署名", cls: "border-blue-500/25 bg-blue-500/5 text-blue-300" },
                ].map(({ label, desc, cls }) => (
                  <div key={label} className={`rounded-xl border p-2.5 text-center ${cls}`}>
                    <div className="font-bold font-mono">{label}</div>
                    <div className="text-zinc-400 text-[10px] mt-0.5">{desc}</div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════════
            SECTION D: デコード結果 + JSON解説（解読後に出現）
        ══════════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {decoded && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-10"
            >
              {/* D-1: デコード */}
              <section className="space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-black flex items-center justify-center">3</span>
                  <h2 className="text-sm font-bold text-zinc-200">Base64デコード結果を読む</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Header */}
                  <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-5 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500/60 rounded-l-3xl" />
                    <h3 className="text-rose-300 font-bold mb-3 flex items-center gap-2 text-xs uppercase tracking-widest">
                      <Cpu className="w-3.5 h-3.5" /> Header
                    </h3>
                    <pre className="text-rose-200 font-mono text-xs break-all whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(header, null, 2)}
                    </pre>
                  </div>

                  {/* Payload */}
                  <div className="bg-purple-500/5 border border-purple-500/20 rounded-3xl p-5 relative overflow-hidden flex flex-col gap-3">
                    <div className="absolute top-0 left-0 w-1 h-full bg-purple-500/60 rounded-l-3xl" />
                    <h3 className="text-purple-300 font-bold flex items-center gap-2 text-xs uppercase tracking-widest">
                      <Database className="w-3.5 h-3.5" /> Payload
                    </h3>

                    {/* Countdown */}
                    {countdown !== null && (
                      <div className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border ${countdown === 0 ? "border-red-500/30 bg-red-500/10" : "border-amber-500/25 bg-amber-500/8"}`}>
                        <Clock className={`w-4 h-4 shrink-0 ${countdown === 0 ? "text-red-400" : "text-amber-300"}`} />
                        <div>
                          <div className="text-[10px] text-zinc-400 uppercase tracking-wide font-semibold">有効期限まで</div>
                          <div className={`font-mono text-sm font-bold ${countdown === 0 ? "text-red-300" : "text-amber-200"}`}>
                            {countdown === 0 ? "EXPIRED — 期限切れ" : fmtCountdown(countdown)}
                          </div>
                        </div>
                      </div>
                    )}

                    <pre className="text-purple-200 font-mono text-xs break-all whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(payload, null, 2)}
                    </pre>
                  </div>
                </div>
              </section>

              {/* D-2: JSON 型解説 */}
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-black flex items-center justify-center">4</span>
                  <h2 className="text-sm font-bold text-zinc-200">JSON フィールドを読み解く</h2>
                </div>

                <div className="bg-white/[0.03] border border-white/10 rounded-3xl p-6 space-y-5">
                  {/* Type primer */}
                  <div>
                    <p className="text-xs font-semibold text-zinc-300 mb-3 flex items-center gap-2">
                      <Braces className="w-4 h-4 text-indigo-400" />
                      JSON で使われる「型」の早見表
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {Object.entries(TYPE_CONFIG).map(([type, { label, color, Icon, example }]) => (
                        <div key={type} className={`flex items-start gap-2 p-2.5 rounded-xl border text-[11px] ${color} bg-black/20`}>
                          <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                          <div>
                            <div className="font-bold font-mono">{label}</div>
                            <div className="text-zinc-400 font-mono text-[10px] mt-0.5">{example}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tab switcher */}
                  <div className="space-y-3">
                    <div className="flex gap-1.5 p-1 bg-black/30 rounded-xl w-fit">
                      {(["pretty", "raw"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                            activeTab === tab ? "bg-indigo-500 text-white shadow" : "text-zinc-400 hover:text-zinc-200"
                          }`}
                        >
                          {tab === "pretty" ? "🔬 フィールド解説" : "📋 生JSON"}
                        </button>
                      ))}
                    </div>

                    {activeTab === "pretty" ? (
                      <div className="space-y-3">
                        <JsonPanel title="Header" data={header} accent="border-rose-500/20" />
                        <JsonPanel title="Payload" data={payload} accent="border-purple-500/20" />
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <pre className="bg-black/40 border border-rose-500/15 rounded-2xl p-4 font-mono text-xs text-rose-200 overflow-x-auto leading-relaxed">{JSON.stringify(header, null, 2)}</pre>
                        <pre className="bg-black/40 border border-purple-500/15 rounded-2xl p-4 font-mono text-xs text-purple-200 overflow-x-auto leading-relaxed">{JSON.stringify(payload, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* D-3: Conclusion */}
              <section>
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 via-purple-500/15 to-indigo-500/20 rounded-3xl blur-2xl" />
                  <div className="relative bg-white/[0.03] border border-white/10 rounded-3xl p-8 text-center space-y-5">
                    <div className="mx-auto w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-center justify-center">
                      <ShieldAlert className="w-7 h-7 text-rose-400" />
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl md:text-3xl font-black text-white">ペイロードは丸見えでしたよね？</h2>
                      <p className="text-zinc-300 text-sm max-w-xl mx-auto leading-relaxed">
                        Step 3, 4で見たとおり、ヘッダーとペイロードはBase64をデコードするだけで中身が読めます。
                        だから <strong className="text-white">パスワードや個人情報をペイロードに入れてはいけません。</strong>
                      </p>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 mt-4 text-sm">
                      <div className="flex-1 bg-red-500/8 border border-red-500/20 rounded-2xl p-4 text-left space-y-1.5">
                        <div className="text-red-300 font-bold text-xs uppercase tracking-wide flex items-center gap-1.5"><AlertCircle className="w-3.5 h-3.5" />入れてはいけないもの</div>
                        <ul className="text-zinc-300 text-xs space-y-1 list-disc list-inside">
                          <li>パスワード・クレジットカード番号</li>
                          <li>マイナンバー・個人の機密情報</li>
                          <li>本来隠すべき内部ロジック</li>
                        </ul>
                      </div>
                      <div className="flex-1 bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-4 text-left space-y-1.5">
                        <div className="text-emerald-300 font-bold text-xs uppercase tracking-wide flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />入れてよいもの</div>
                        <ul className="text-zinc-300 text-xs space-y-1 list-disc list-inside">
                          <li>ユーザーID・ロール（管理者か否か）</li>
                          <li>有効期限・発行元</li>
                          <li>公開しても問題ない識別情報</li>
                        </ul>
                      </div>
                    </div>

                    <div className="pt-5 border-t border-white/8">
                      <h3 className="text-2xl md:text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-yellow-300 to-orange-400">
                        だから Signature が重要
                      </h3>
                      <p className="text-zinc-300 text-sm mt-3 max-w-lg mx-auto leading-relaxed">
                        第3パーツの <span className="jwt-signature font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/10">Signature</span> はサーバーだけが知る秘密鍵で生成されます。
                        中身を書き換えると署名が一致しなくなり、サーバーに即座に拒否されます。
                        <strong className="text-white">「誰でも読める・でも誰も偽れない」</strong>これがJWTの核心です。
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-3 text-xs text-zinc-400">
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>実運用では有効期限を短くし（15分〜1時間）、期限切れ後はリフレッシュトークンで再発行するのが定石です</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </main>
  );
}