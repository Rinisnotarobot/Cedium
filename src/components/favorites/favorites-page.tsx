import { PageContainer, PageHeader } from "#/components/layout";
import { Card, CardContent } from "#/components/ui/card";
import { Badge } from "#/components/ui/badge";
import { Clock, Heart, ExternalLink } from "lucide-react";
import { Button } from "#/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";

interface Favorite {
  id: string;
  title: string;
  excerpt: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  tags: string[];
}

const favorites: Favorite[] = [
  {
    id: "1",
    title: "深入理解 React Server Components",
    excerpt: "RSC 是 React 18 引入的新特性，它改变了...",
    author: {
      name: "张三",
      avatar: undefined,
    },
    publishedAt: "2024-03-12",
    tags: ["React", "RSC"],
  },
  {
    id: "2",
    title: "构建高性能 Next.js 应用",
    excerpt: "性能优化是每个前端开发者都需要关注的话题...",
    author: {
      name: "李四",
      avatar: undefined,
    },
    publishedAt: "2024-03-08",
    tags: ["Next.js", "性能"],
  },
];

function FavoriteCard({ favorite }: { favorite: Favorite }) {
  return (
    <Card className="hover:shadow-md hover:border-border/80 transition-all duration-200 group">
      <CardContent className="p-5">
        <div className="flex gap-4">
          <Avatar className="size-10">
            <AvatarImage src={favorite.author.avatar} />
            <AvatarFallback>{favorite.author.name.charAt(0)}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{favorite.author.name}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                <span>{favorite.publishedAt}</span>
              </div>
            </div>

            <h2 className="font-semibold leading-snug group-hover:text-primary transition-colors line-clamp-2">
              {favorite.title}
            </h2>

            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {favorite.excerpt}
            </p>

            <div className="flex items-center justify-between mt-3">
              <div className="flex flex-wrap gap-1">
                {favorite.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-destructive hover:text-destructive"
                >
                  <Heart className="size-4 fill-current" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 px-2">
                  <ExternalLink className="size-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FavoritesPage() {
  return (
    <PageContainer width="3xl" variant="spaced">
      <PageHeader
        title="收藏"
        description="您收藏的文章列表"
      />

      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">暂无收藏</p>
          <Button variant="outline" className="mt-4" asChild>
            <a href="/articles">探索文章</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground tabular-nums">
              {favorites.length} 篇收藏
            </span>
          </div>
          <div className="grid gap-4">
            {favorites.map((favorite) => (
              <FavoriteCard key={favorite.id} favorite={favorite} />
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}