import { PageContainer, PageHeader } from "#/components/layout";
import { Card, CardContent } from "#/components/ui/card";
import { Badge } from "#/components/ui/badge";
import { Clock, Edit3, Trash2 } from "lucide-react";
import { Button } from "#/components/ui/button";

interface Draft {
  id: string;
  title: string;
  excerpt: string;
  updatedAt: string;
  tags: string[];
}

const drafts: Draft[] = [
  {
    id: "1",
    title: "React 19 新特性深度解析",
    excerpt: "React 19 带来了许多激动人心的新特性，包括...",
    updatedAt: "2024-03-15",
    tags: ["React", "前端"],
  },
  {
    id: "2",
    title: "TypeScript 5.0 类型系统改进",
    excerpt: "TypeScript 5.0 引入了新的类型推断机制...",
    updatedAt: "2024-03-10",
    tags: ["TypeScript", "类型系统"],
  },
];

function DraftCard({ draft }: { draft: Draft }) {
  return (
    <Card className="hover:shadow-md hover:border-border/80 transition-all duration-200 cursor-pointer group">
      <CardContent className="p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between">
            <h2 className="font-semibold leading-snug group-hover:text-primary transition-colors">
              {draft.title}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <Edit3 className="size-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-destructive hover:text-destructive">
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {draft.excerpt}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {draft.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              <span>{draft.updatedAt}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DraftsPage() {
  return (
    <PageContainer width="3xl" variant="spaced">
      <PageHeader
        title="草稿箱"
        description="继续编辑您未完成的文章"
      />

      {drafts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">暂无草稿</p>
          <Button variant="outline" className="mt-4" asChild>
            <a href="/write">开始写作</a>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground tabular-nums">
              {drafts.length} 篇草稿
            </span>
          </div>
          <div className="grid gap-4">
            {drafts.map((draft) => (
              <DraftCard key={draft.id} draft={draft} />
            ))}
          </div>
        </div>
      )}
    </PageContainer>
  );
}