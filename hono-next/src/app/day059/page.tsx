import { AlertCircle, ArrowRight, CheckCircle2, ChevronDown, Globe, ShieldCheck, Terminal } from 'lucide-react';

const slides = [
  {
    id: "01",
    title: "CORS エラーと Credentials 違反",
    tag: "Security",
    error: "Access Control Allow Origin mismatch",
    cause: "credentials: true と origin: '*' の併用はブラウザ仕様で禁止されている。",
    solution: "origin を環境変数から取得し、許可リスト（配列）で明示的に定義。",
    insight: "認証情報（Cookie等）を伴う通信では、ワイルドカードによる全許可は許されない。"
  },
  {
    id: "02",
    title: "リダイレクト URL ミスマッチ",
    tag: "OAuth Config",
    error: "redirect_uri_mismatch",
    cause: "BETTER_AUTH_URL が API側ではなくフロント側の URL になっていた。",
    solution: "BETTER_AUTH_URL を Workers API のオリジンに修正。",
    insight: "better-auth が Google へ伝えるコールバック先は、自ドメイン（API）である必要がある。"
  },
  {
    id: "03",
    title: "state_mismatch エラー",
    tag: "Cookie Context",
    error: "Auth Error: state_mismatch",
    cause: "クロスオリジン fetch では Set-Cookie（state）がブラウザに保存されない。",
    solution: "fetch をやめ、window.location.href による直接遷移方式へ変更。",
    insight: "OAuth の開始は 'First-party' 遷移として実行することで Cookie 制御を確実にする。"
  },
  {
    id: "04",
    title: "404 Routing Order",
    tag: "Hono Routing",
    error: "HTTP 404 Not Found",
    cause: "ワイルドカードルート (/*) が具体的なルートより先に定義されていた。",
    solution: "ルート定義の順序を入れ替え、詳細なパスを優先的に評価させる。",
    insight: "Hono のルーティングは登録順。広域キャッチオールは常に最後に配置する。"
  }
];

export default function LightTroubleshootingSlides() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-100 font-sans">
      {/* イントロダクション */}
      <section className="h-screen flex flex-col justify-center items-center p-6 text-center bg-white border-b border-slate-200">
        <div className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold tracking-wider text-blue-600 uppercase bg-blue-50 rounded-full border border-blue-100">
          Troubleshooting Report 2026
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-slate-900 leading-tight tracking-tight">
          Next.js + Hono + better-auth<br />
          <span className="text-blue-600">OAuth 連携</span>のトラブルシューティング
        </h1>
        <p className="max-w-2xl text-slate-500 text-lg leading-relaxed">
          Cloud Run と Cloudflare Workers を跨ぐクロスドメイン認証で直面した、<br />
          技術的障壁とその解決プロセスの全記録。
        </p>
        <div className="mt-16 flex flex-col items-center text-slate-400">
          <p className="text-xs uppercase tracking-[0.2em] mb-4 font-bold">Scroll to Explore</p>
          <ChevronDown className="animate-bounce" size={24} />
        </div>
      </section>

      {/* スライド本体 */}
      <main>
        {slides.map((slide) => (
          <section key={slide.id} className="min-h-screen flex items-center justify-center p-6 border-b border-slate-200 sticky top-0 bg-slate-50">
            <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* 左側：見出し */}
              <div className="lg:col-span-5 space-y-6">
                <span className="text-8xl font-black text-slate-200 block leading-none">{slide.id}</span>
                <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-sm uppercase tracking-widest">
                  <Terminal size={18} /> {slide.tag}
                </div>
                <h2 className="text-3xl font-bold text-slate-900">{slide.title}</h2>
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600">
                  <AlertCircle size={20} className="shrink-0" />
                  <span className="text-sm font-mono font-semibold">{slide.error}</span>
                </div>
              </div>

              {/* 右側：内容カード */}
              <div className="lg:col-span-7">
                <div className="bg-white border border-slate-200 p-8 md:p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                    <ShieldCheck size={180} />
                  </div>
                  
                  <div className="space-y-8 relative z-10">
                    <div>
                      <h3 className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-3">Problem / 原因</h3>
                      <p className="text-xl text-slate-700 leading-relaxed font-medium">{slide.cause}</p>
                    </div>

                    <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl">
                      <h3 className="text-emerald-600 text-xs uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
                        <CheckCircle2 size={18} /> Solution / 解決策
                      </h3>
                      <p className="text-slate-800 text-lg font-bold leading-snug">{slide.solution}</p>
                    </div>

                    <div className="pt-6 border-t border-slate-100">
                      <p className="text-sm text-slate-400 leading-relaxed italic font-medium">
                        &ldquo; {slide.insight} &rdquo;
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* 最後のスライド：セッションブリッジ図解 */}
        <section className="min-h-screen flex items-center justify-center p-6 bg-blue-600">
          <div className="max-w-5xl w-full">
            <div className="text-center mb-12">
              <span className="text-blue-100 font-bold text-sm uppercase tracking-[0.3em]">Bridge Solution</span>
              <h2 className="text-4xl font-black text-white mt-4">5. セッションブリッジの仕組み</h2>
            </div>

            {/* 背景をつけた図解カード */}
            <div className="bg-slate-50 rounded-[3rem] p-8 md:p-16 shadow-2xl relative">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center relative z-10">
                
                {/* Workers側 */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Globe size={24} />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900 uppercase text-sm tracking-tighter">Workers (API)</span>
                    <span className="text-xs text-slate-400 font-mono italic">hono-api...workers.dev</span>
                  </div>
                  <div className="pt-4 border-t border-slate-50 text-xs font-semibold text-slate-500">
                    OAuth成功 → Token付与でRedirect
                  </div>
                </div>

                {/* 中央のアニメーション風矢印 */}
                <div className="flex flex-col items-center">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 shadow-lg shadow-blue-200">
                    Crossing Domains
                  </div>
                  <div className="hidden md:flex items-center w-full">
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-blue-200 to-blue-400"></div>
                    <ArrowRight className="text-blue-600 mx-2" size={32} />
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-blue-400 via-blue-200 to-transparent"></div>
                  </div>
                  <ArrowRight className="md:hidden text-blue-600 rotate-90" size={32} />
                </div>

                {/* Next.js側 */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 text-center space-y-4">
                  <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                    <Terminal size={24} />
                  </div>
                  <div>
                    <span className="block font-bold text-slate-900 uppercase text-sm tracking-tighter">Next.js (App)</span>
                    <span className="text-xs text-slate-400 font-mono italic">hono-next-app...run.app</span>
                  </div>
                  <div className="pt-4 border-t border-slate-50 text-xs font-semibold text-blue-600">
                    /api/auth/session で受取り
                  </div>
                </div>
              </div>

              {/* コードエリア：背景をつけて強調 */}
              <div className="mt-12 bg-slate-900 rounded-2xl p-6 md:p-8 text-white font-mono text-sm shadow-inner relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 text-[10px] font-bold text-slate-700 tracking-[0.3em] uppercase">
                  Server-side Logic
                </div>
                <div className="flex gap-4">
                  <div className="flex flex-col text-slate-600 select-none">
                    <span>1</span><span>2</span><span>3</span><span>4</span>
                  </div>
                  <div>
                    <p className="text-blue-400">// Next.js ドメインでクッキーを焼き直す</p>
                    <p className="mt-1">
                      <span className="text-purple-400">const</span> token = searchParams.get(<span className="text-emerald-400">&apos;token&apos;</span>);
                    </p>
                    <p>
                      cookies().set(<span className="text-emerald-400">&apos;session_token&apos;</span>, token, &#123; httpOnly: <span className="text-orange-400">true</span> &#125;);
                    </p>
                    <p>
                      <span className="text-purple-400">return</span> Response.redirect(<span className="text-emerald-400">&apos;/dashboard&apos;</span>);
                    </p>
                  </div>
                </div>
              </div>
              
              <p className="mt-8 text-center text-slate-400 font-medium text-sm">
                ドメインが異なるため直接クッキーを共有できない問題を、「トークン渡し」と「自ドメインでの再セット」で解決。
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-20 text-center bg-white border-t border-slate-100">
        <p className="text-slate-400 text-xs font-bold tracking-[0.4em] uppercase">
          &copy; 2026 ruu2023 | Engineering Documentation
        </p>
      </footer>
    </div>
  );
}