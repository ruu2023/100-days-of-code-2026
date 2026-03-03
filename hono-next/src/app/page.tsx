import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function WelcomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <main className="text-center space-y-6 max-w-2xl">
        <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl">
          100 Days of Code
        </h1>
        <p className="text-xl text-muted-foreground">
          エンジニアリングの軌跡を記録する。各種ツールなど、日々の成果をここで公開しています。
        </p>
        <div className="flex gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/dashboard">ダッシュボードを見る</Link>
          </Button>
          <Button variant="outline" size="lg">
            <a href="https://github.com/ruu2023/100-days-of-code-2026/">GitHub</a>
          </Button>
        </div>
      </main>
    </div>
  )
}