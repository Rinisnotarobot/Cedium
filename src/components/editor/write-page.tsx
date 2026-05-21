import { PageContainer } from "#/components/layout";
import { Button } from "#/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { Save, Eye, ChevronDown, ChevronUp, Check, PenLine } from "lucide-react";
import { ArticleEditor } from "#/components/editor";
import { cn } from "#/lib/utils";
import { Link } from "@tanstack/react-router";

export function WritePage() {
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);

  // 自动聚焦标题
  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const handleSaveDraft = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setLastSaved(new Date());
    setSaving(false);
  };

  // 键盘快捷键保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSaveDraft();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <PageContainer width="4xl" variant="spaced" className="bg-muted/30">
      {/* 顶部工具栏 - 极简设计 */}
      <header className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3">
          <Link
            to="/articles"
            className="text-muted-foreground hover:text-foreground transition-colors text-sm"
          >
            文章
          </Link>
          <span className="text-muted-foreground/40">/</span>
          <span className="text-sm font-medium">新建</span>
        </div>

        <div className="flex items-center gap-4">
          {/* 保存状态 - 静默反馈 */}
          <div className="flex items-center gap-2">
            {lastSaved && (
              <div
                className={cn(
                  "flex items-center gap-1.5 text-xs text-muted-foreground transition-opacity",
                  saving && "opacity-0"
                )}
              >
                <Check className="size-3 text-emerald-500" />
                <span className="tabular-nums">{formatTime(lastSaved)}</span>
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              <Eye className="size-4 mr-1.5" />
              预览
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={saving}
              className="gap-1.5"
            >
              <Save className={cn("size-4", saving && "animate-pulse")} />
              {saving ? "保存中" : "保存"}
            </Button>
          </div>
        </div>
      </header>

      {/* 写作区域 - 一体化设计 */}
      <main className="space-y-0 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        {/* 标题输入 - 大号字体，无边框 */}
        <div className="mb-6">
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="标题"
            className={cn(
              "w-full bg-transparent border-0 outline-none",
              "text-3xl font-semibold tracking-tight",
              "placeholder:text-muted-foreground/30 placeholder:font-normal",
              "focus:placeholder:text-muted-foreground/50",
              "transition-colors duration-200",
              title.trim() && "text-foreground"
            )}
            style={{ caretColor: "var(--color-primary)" }}
          />
        </div>

        {/* 分隔线 - 淡雅 */}
        <div className="h-px bg-border/40 mb-6" />

        {/* 编辑器工具栏折叠控制 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <PenLine className="size-3" />
            <span>Markdown · 快捷键 Ctrl+S 保存</span>
          </div>
          <button
            onClick={() => setToolbarCollapsed(!toolbarCollapsed)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {toolbarCollapsed ? (
              <>
                <ChevronDown className="size-3" />
                <span>展开工具栏</span>
              </>
            ) : (
              <>
                <ChevronUp className="size-3" />
                <span>收起工具栏</span>
              </>
            )}
          </button>
        </div>

        {/* 编辑器 */}
        <ArticleEditor toolbarCollapsed={toolbarCollapsed} />
      </main>

      {/* 底部留白 */}
      <footer className="h-24" />
    </PageContainer>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}
