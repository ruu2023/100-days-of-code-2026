import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Calendar } from "lucide-react"

export function PostCard({ post }: { post: any }) {
  return (
    <Card className="group hover:ring-2 hover:ring-primary/30 transition-all flex flex-col h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center mb-2">
          <Badge variant={post.day > 40 ? "default" : "secondary"} className="font-mono">
            Day {String(post.day).padStart(3, '0')}
          </Badge>
          <div className="flex items-center text-[10px] text-muted-foreground">
            <Calendar className="w-3 h-3 mr-1" />
            {post.date.split(' ')[0]}
          </div>
        </div>
        <CardTitle className="text-lg line-clamp-1">{post.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2.5rem]">
          {post.description || "制作の詳細はXをチェック"}
        </p>
        
        {post.features.length > 0 && (
          <ul className="text-[11px] space-y-1 border-l-2 border-muted pl-2">
            {post.features.slice(0, 2).map((f: string, i: number) => (
              <li key={i} className="line-clamp-1 text-secondary-foreground">・{f}</li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-1">
          {post.tags.slice(0, 3).map((tag: string) => (
            <span key={tag} className="text-[9px] text-primary/70">{tag}</span>
          ))}
        </div>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <a 
          href={post.url} 
          target="_blank" 
          className="text-[10px] flex items-center justify-center w-full py-2 bg-secondary hover:bg-secondary/80 rounded-md transition-colors"
        >
          View on X <ExternalLink className="w-3 h-3 ml-1" />
        </a>
      </div>
    </Card>
  )
}