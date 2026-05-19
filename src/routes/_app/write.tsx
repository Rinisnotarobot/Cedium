import { createFileRoute, redirect } from "@tanstack/react-router";
import { ArticleEditor } from "#/components/editor";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { Separator } from "#/components/ui/separator";
import { Field, FieldLabel } from "#/components/ui/field";
import { useState } from "react";
import {
  Save,
  Clock,
  FileText,
  Tag,
  ImageIcon,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { cn } from "#/lib/utils";

export const Route = createFileRoute("/_app/write")({
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login", search: { redirect: "/write" } });
    }
  },
  component: WritePage,
});

function WritePage() {
  const [title, setTitle] = useState("");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const availableTags = [
    "React", "TypeScript", "Rust", "CSS", "架构",
    "性能优化", "状态管理", "数据库",
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    // 模拟保存
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastSaved(new Date());
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">写作</h1>
            <p className="text-muted-foreground text-sm mt-1">
              创作并发布您的技术文章
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span>已保存于 {formatTime(lastSaved)}</span>
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={saving}
            >
              <Save className="size-4 mr-1" />
              {saving ? "保存中" : "保存草稿"}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Editor Column */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden">
              {/* Title Input */}
              <div className="border-b px-6 py-4 bg-muted/30">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="文章标题..."
                  className="text-xl font-semibold border-0 bg-transparent focus-visible:ring-0 placeholder:text-muted-foreground/50"
                />
                <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <FileText className="size-3.5" />
                    <span>Markdown 支持</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    <span>自动保存已开启</span>
                  </div>
                </div>
              </div>

              {/* Editor */}
              <CardContent className="p-0">
                <ArticleEditor />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Column */}
          <div className="lg:col-span-1">
            <Card>
              {/* Collapsible Header for Mobile */}
              <CardHeader
                className="cursor-pointer hover:bg-muted/50 transition-colors lg:cursor-default lg:hover:bg-transparent"
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    文章设置
                  </CardTitle>
                  <ChevronDown
                    className={cn(
                      "size-4 text-muted-foreground lg:hidden transition-transform",
                      sidebarExpanded && "rotate-180"
                    )}
                  />
                </div>
              </CardHeader>

              {/* Content - Collapsible on Mobile */}
              <CardContent className={cn(
                "space-y-4",
                !sidebarExpanded && "hidden lg:block"
              )}>
                {/* Tags */}
                <Field>
                  <FieldLabel className="flex items-center gap-2">
                    <Tag className="size-4" />
                    标签
                  </FieldLabel>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {availableTags.map(tag => (
                      <Badge
                        key={tag}
                        variant={selectedTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer transition-colors"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    选择 {selectedTags.length}/3 个标签
                  </p>
                </Field>

                <Separator />

                {/* Cover Image */}
                <Field>
                  <FieldLabel className="flex items-center gap-2">
                    <ImageIcon className="size-4" />
                    封面图
                  </FieldLabel>
                  <div className="mt-2 border-2 border-dashed rounded-lg p-4 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <ImageIcon className="size-6 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mt-2">
                      点击上传或拖放图片
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      推荐 1200×630 尺寸
                    </p>
                  </div>
                </Field>

                <Separator />

                {/* Status */}
                <div className="rounded-lg bg-muted/50 p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">状态</span>
                    <Badge variant="secondary">草稿</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">字数</span>
                    <span className="font-medium">0</span>
                  </div>
                </div>

                {/* Publish Button */}
                <Button className="w-full" disabled={!title.trim()}>
                  发布文章
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  发布后将公开显示
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}