import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

// 実装済みのプロジェクト例
const projects = [
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