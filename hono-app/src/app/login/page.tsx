import Client from "./client";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const callbackUrl = redirect ?? "/dashboard";
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4"
      style={{
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(59,130,246,0.15) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(139,92,246,0.15) 0px, transparent 50%)
        `
      }}
    >
      <div className="w-full mx-auto" style={{ maxWidth: "384px" }}>
        {/* ロゴ/タイトル */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-4">
            <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.875 9v.75m14.25-2.872A2.25 2.25 0 0119.125 9v.75M4.875 9.75h14.25M4.875 9.75A2.25 2.25 0 003 12v6.75A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V12a2.25 2.25 0 00-1.875-2.25" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">100 Days of Code</h1>
          <p className="text-slate-400 text-sm mt-1">ここから認証が必要なアプリにアクセスできます。<br />アクセスするにはログインしてください</p>
        </div>

        {/* カード */}
        <div className="w-full bg-slate-800/50 border border-white/8 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
          <Client callbackUrl={callbackUrl} />
        </div>

        {/* フッター */}
        {/* <p className="text-center text-slate-600 text-xs mt-6">
          ログインすることでサービス利用規約に同意したものとみなします
        </p> */}
      </div>
    </div>
  );
}