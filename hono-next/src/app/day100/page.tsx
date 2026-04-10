import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LogoTimelineDemo, { programmingLanguageHistory } from "@/components/logo-timeline-demo"

export const metadata = {
  title: "Programming Language History Timeline - Day 100",
  description: "Animated programming language history timeline built with Next.js, shadcn/ui, Tailwind CSS, and Motion.",
}

const highlights = [
  "A-0 System から Swift までの系譜を横断表示",
  "shadcn/ui + Tailwind 4 の既存構成へ統合",
  "言語ごとの誕生時期・開発者・目的・比較対象を詳細カードで補足",
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
            A-0 System から Swift まで、代表的なプログラミング言語の登場と背景を流れるタイムラインと詳細カードで眺められるページです。
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
            に配置し、ページ側では歴史年表データだけを差し替えて再利用しています。
          </p>
          <ul className="space-y-2">
            {highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight">言語ごとの補足情報</h2>
          <p className="text-sm text-muted-foreground">
            誕生した時期、誰が作ったか、何のために作られたか、何と比べられてきたかを一覧できます。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {programmingLanguageHistory.map((language) => (
            <Card key={language.name} className="border-border/60 bg-card/80 backdrop-blur-sm">
              <CardHeader className="space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-lg">{language.name}</CardTitle>
                    <CardDescription>{language.period}</CardDescription>
                  </div>
                  <Badge variant="secondary" className="font-mono">
                    {language.yearLabel}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">誰が</p>
                  <p className="text-muted-foreground">{language.creator}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">なぜ</p>
                  <p className="text-muted-foreground">{language.purpose}</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">対抗馬・比較対象</p>
                  <p className="text-muted-foreground">{language.comparison}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  )
}
