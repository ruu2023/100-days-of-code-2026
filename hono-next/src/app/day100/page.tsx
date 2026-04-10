import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LogoTimelineDemo from "@/components/logo-timeline-demo"

export const metadata = {
  title: "Programming Language History Timeline - Day 100",
  description: "Animated programming language history timeline built with Next.js, shadcn/ui, Tailwind CSS, and Motion.",
}

const highlights = [
  "A-0 System から Swift までの系譜を横断表示",
  "shadcn/ui + Tailwind 4 の既存構成へ統合",
  "タイムライン上の各ラベルにホバーすると詳細カードを表示",
]

export default function Day100Page() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <div className="space-y-4">
        <Badge className="font-mono">Day 100</Badge>
        <div className="space-y-3">
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            プログラミング言語の歴史年表
          </h1>
          <p className="max-w-3xl text-base text-muted-foreground sm:text-lg">
            A-0 System から Swift まで、代表的なプログラミング言語の登場と背景を流れるタイムライン上で確認できるページです。
          </p>
        </div>
      </div>

      <LogoTimelineDemo />

      <Card>
        <CardHeader>
          <CardTitle>この実装について</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            コンポーネント本体は
            <span className="mx-1 font-mono text-foreground">src/components/ui/logo-timeline.tsx</span>
            に配置し、ページ側では歴史年表データだけを差し替えて再利用しています。動くラベルへホバーすると、その場で詳細を読めます。
          </p>
          <ul className="space-y-2">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </main>
  )
}
