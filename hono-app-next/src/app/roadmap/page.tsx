
import { PostCard } from "@/components/post-card";
import { TechStackChart } from "@/components/tech-stack-chart";
import { Button } from "@/components/ui/button";
import posts from '@/data/posts.json';
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto py-10 space-y-8 p-6">
      <header className="flex justify-between items-center">
        <h1 className="text-4xl font-bold tracking-tight">100 Days Roadmap</h1>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/dashboard">Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/logout">ログアウト</Link>
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-2">
        
        <p className="text-muted-foreground text-lg">
          学習とアウトプットの軌跡。
        </p>
      </div>

      <TechStackChart />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {posts.map((post) => (
          <PostCard key={post.day} post={post} />
        ))}
      </div>
    </div>
  );
}