import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// 実装済みのプロジェクト例
const projects = [
  // web/app から migration
  {
    title: "Tech Omikuji",
    description: "本日のおみくじ for 100-day challenge.",
    link: "/day001",
    day: "Day 1",
  },
  {
    title: "Docker Quiz",
    description: "Go Quiz API Client",
    link: "/day003",
    day: "Day 3",
  },
  {
    title: "Notion BI tool",
    description: "Notion Database Viewer",
    link: "/day012",
    day: "Day 12",
  },
  {
    title: "Pic-Spot",
    description: "外部サイトから画像をドラッグ＆ドロップしてコレクション",
    link: "/day020",
    day: "Day 20",
  },
  {
    title: "MindFlow",
    description: "気分記録アプリ",
    link: "/day021",
    day: "Day 21",
  },
  {
    title: "SQL Drill",
    description: "SQL練習アプリ",
    link: "/day023",
    day: "Day 23",
  },
  {
    title: "Glassmorphism Gen",
    description: "Glassmorphism CSSジェネレーター",
    link: "/day028",
    day: "Day 28",
  },
  {
    title: "Gravity Dash",
    description: "障害物を避けるゲーム",
    link: "/day030",
    day: "Day 30",
  },
  {
    title: "YT_LOG.exe",
    description: "YouTubeメモアプリ",
    link: "/day031",
    day: "Day 31",
  },
  {
    title: "Text Stats App",
    description: "テキスト統計アプリ",
    link: "/day032",
    day: "Day 32",
  },
  {
    title: "Debugging Tavern",
    description: "_debuggingクイズゲーム",
    link: "/day033",
    day: "Day 33",
  },
  {
    title: "MyBatis Tutor",
    description: "MyBatis学習アプリ",
    link: "/day034",
    day: "Day 34",
  },
  {
    title: "Quick Markdown",
    description: "マークダウンエディタ",
    link: "/day035",
    day: "Day 35",
  },
  {
    title: "Lyric Studio",
    description: "歌詞管理アプリ",
    link: "/day036",
    day: "Day 36",
  },
  {
    title: "Simple Tango",
    description: "単語帳アプリ",
    link: "/day037",
    day: "Day 37",
  },
  {
    title: "Whiteboard",
    description: "リアルタイムホワイトボード",
    link: "/day039",
    day: "Day 39",
  },
  {
    title: "Reflection App",
    description: "振り返りログアプリ",
    link: "/day040",
    day: "Day 40",
  },
  {
    title: "TechPulse",
    description: "ニュースアグリゲーター",
    link: "/day041",
    day: "Day 41",
  },
  // 元のhono-nextプロジェクト
  {
    title: "Grass Editor",
    description: "GitHub風の草を生やすことができるエディタ。",
    link: "/day042",
    day: "Day 42",
  },
  {
    title: "Docker Prompt Maker",
    description: "Dockerのプロンプトを生成するアプリ。",
    link: "/day044",
    day: "Day 44",
  },
  {
    title: "Drizzle Stable Typist",
    description: "Drizzle ORMのタイピング練習アプリ。正確な構文入力をトレーニング。",
    link: "/day046",
    day: "Day 46",
  },
  {
    title: "Real-time Chat Room",
    description: "WebSocketを使用したリアルタイムチャット。参加人数も同期。",
    link: "/day047",
    day: "Day 47",
  },
  {
    title: "VPN Defender Game",
    description: "VPNの脆弱性をパッチしてサーバーを守る防衛ゲーム。",
    link: "/day048",
    day: "Day 48",
  },
  {
    title: "Draft Manager",
    description: "文字数カウント機能付きの下書き管理ツール。プリセット設定も可能。",
    link: "/day049",
    day: "Day 49",
  },
  {
    title: "GoF Design Patterns",
    description: "GoFのデザインパターン（生成・構造・振る舞い）を図解やコード、出力結果と共に学べる学習アプリを作成しました。",
    link: "/day051",
    day: "Day 51",
  },
  {
    title: "Clipboard Manager",
    description: "よく使うプロンプトや定型文をクリップボード感覚で管理！アカウント紐付けでデータを管理。",
    link: "/day052",
    day: "Day 52",
  },
  {
    title: "SmartTango",
    description: "単語帳。裏面はAIが自動生成。アカウント紐付けでデータを管理。",
    link: "/day053",
    day: "Day 53",
  },
  {
    title: "SQL Index Simulator",
    description: "インデックスの効果をブラウザで体感。",
    link: "/day054",
    day: "Day 54",
  },
  {
    title: "JWT Decoder Playground",
    description: "JWTの生成・デコード・有効期限カウントダウンで仕組みを体験学習。",
    link: "/day055",
    day: "Day 55",
  },
  {
    title: "ずんだもんNEWS",
    description: "はてブ話題のニュースをずんだもんの声で聴けるオーディオプレイヤー。",
    link: "/day056",
    day: "Day 56",
  },
  {
    title: "Draw App",
    description: "shadcn/uiを使用したライトテーマのお絵描きアプリ。レイヤー機能やUndo/Redo等の本格的な描画機能を搭載。",
    link: "/day057",
    day: "Day 57",
  },
  {
    title: "AI Canvas App",
    description: "Antigravityで作成！Google AI StudioのAPIでアプリが一気に花咲くお絵描き＆画像生成アプリ。2枚目の画像追加で背景指定やポーズ変更が容易に。",
    link: "/day058",
    day: "Day 58",
  },
  {
    title: "OAuth Troubleshooting",
    description: "Next.jsとHono(Workers)間のOAuth連携トラブルまとめ。CORS、stateエラー、さらにドメイン越えクッキーを実現するセッションブリッジの実装記録。",
    link: "/day059",
    day: "Day 59",
  },
  {
    title: "Mini X Clone",
    description: "動画や画像もアップできる、X風のミニポストアプリ。Cloudflare R2を使用したメディアアップロードの実装。",
    link: "/day060",
    day: "Day 60",
  },
  {
    title: "VS Code Shortcuts",
    description: "VS Codeのショートカットキーをまとめたアプリ。",
    link: "/day061",
    day: "Day 61",
  },
  {
    title: "Animated Cash Book",
    description: "JSONデータとキャラクターの読み上げアニメーション付きで出納帳をプレビューし、Excel形式でダウンロードできるアプリ。",
    link: "/day062",
    day: "Day 62",
  },
  {
    title: "Strategy Pattern - 会計帳票",
    description: "ストラテジーパターンを使った帳票出力デモ。CSV、XML、Markdown形式で出力可能。",
    link: "/day063",
    day: "Day 63",
  },
  {
    title: "NDL OCR API",
    description: "Cloud Runで動かすOCR APIサーバー。国会図書館のOCRライブラリ「ndlocr-lite」を使用。",
    link: "/day064",
    day: "Day 64",
  },
  {
    title: "LFM 2.5 Chat",
    description: "Ollamaを利用したローカルAIチャットアプリ。ストリーミング応答とMarkdownレンダリングに対応。",
    link: "/day065",
    day: "Day 65",
  },
  {
    title: "NDL OCR Parser",
    description: "画像からOCRを実行し、レシート解析やAIでの内容解釈を行うアプリ。",
    link: "/day066",
    day: "Day 66",
  },
  {
    title: "Rails VPS Deploy",
    description: "Rails 8 アプリを VPS にデプロイ。Kamal を使用したデプロイ自動化。",
    link: "/vps",
    day: "Day 67",
  },
  {
    title: "Rails VPS Reverse Proxy",
    description: "Hono API + Rails のリバースプロキシで assets の 404 エラーを解消。VPS へのデプロイ。",
    link: "/vps",
    day: "Day 68",
  },
]

export default function DashboardPage() {
  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/roadmap">Roadmap</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/logout">ログアウト</Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.title} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="text-sm font-medium text-primary mb-1">{project.day}</div>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" className="w-full" asChild>
                <Link href={project.link}>ページを開く</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}