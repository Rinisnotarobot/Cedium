import { PageContainer } from "#/components/layout";
import { Button } from "#/components/ui/button";
import { useState, useEffect, useRef, useCallback } from "react";
import { Save, Eye, ChevronDown, ChevronUp, Check, PenLine, Send } from "lucide-react";
import { ArticleEditor } from "#/components/editor";
import { cn } from "#/lib/utils";
import { Link } from "@tanstack/react-router";
import { useCreateArticle, useUpdateArticle, usePublishArticle, useArticle } from "#/hooks";
import { useEditorContent, useEditorContentValue } from "#/components/editor/context";
import { Route } from "#/routes/_app/write";
import { Skeleton } from "#/components/ui/skeleton";
import type { Article } from "#/types/article";

export function WritePage() {
  const { id } = Route.useSearch();
  const { data: existingArticle, isLoading: isLoadingArticle } = useArticle(id || "");

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  const content = useEditorContentValue();
  const [, setContent] = useEditorContent();

  // 使用 ref 存储最新值，用于离开时保存
  const titleRefValue = useRef(title);
  const excerptRefValue = useRef(excerpt);
  const contentRefValue = useRef(content);
  const articleIdRefValue = useRef(articleId);

  useEffect(() => {
    titleRefValue.current = title;
    excerptRefValue.current = excerpt;
    contentRefValue.current = content;
    articleIdRefValue.current = articleId;
  }, [title, excerpt, content, articleId]);

  const createArticle = useCreateArticle({
    onSuccess: (article: Article) => {
      setArticleId(article.id);
      articleIdRefValue.current = article.id;
      setLastSaved(new Date());
    },
  });
  const updateArticle = useUpdateArticle({
    onSuccess: () => setLastSaved(new Date()),
  });
  const publishArticle = usePublishArticle();

  // 加载已有文章数据
  useEffect(() => {
    if (existingArticle?.data && id) {
      setTitle(existingArticle.data.title);
      setExcerpt(existingArticle.data.excerpt || "");
      setArticleId(existingArticle.data.id);

      // 解析并设置编辑器内容
      try {
        const parsedContent = JSON.parse(existingArticle.data.content);
        setContent(parsedContent);
      } catch {
        setContent(existingArticle.data.content);
      }

      setLastSaved(new Date(existingArticle.data.updatedAt));
    }
  }, [existingArticle?.data, id, setContent]);

  useEffect(() => {
    if (!id) {
      titleRef.current?.focus();
    }
  }, [id]);

  const saving = createArticle.isPending || updateArticle.isPending;

  const handleSaveDraft = useCallback(async (): Promise<string | null> => {
    const currentTitle = titleRefValue.current;
    const currentExcerpt = excerptRefValue.current;
    const currentContent = contentRefValue.current;
    const currentArticleId = articleIdRefValue.current;

    if (!currentTitle.trim()) return null;

    const contentStr = typeof currentContent === "string" ? currentContent : JSON.stringify(currentContent);

    if (currentArticleId) {
      try {
        await updateArticle.mutateAsync({
          id: currentArticleId,
          title: currentTitle,
          excerpt: currentExcerpt || undefined,
          content: contentStr,
        });
        return currentArticleId;
      } catch {
        return null;
      }
    } else {
      try {
        const result = await createArticle.mutateAsync({
          title: currentTitle,
          excerpt: currentExcerpt || undefined,
          content: contentStr,
        });
        return result.article.id;
      } catch {
        return null;
      }
    }
  }, [createArticle, updateArticle]);

  const handlePublish = async () => {
    let publishId = articleIdRefValue.current;
    if (!publishId) {
      publishId = await handleSaveDraft();
      if (!publishId) return;
    }
    publishArticle.mutate({ id: publishId });
  };

  // Ctrl+S 保存
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        handleSaveDraft();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSaveDraft]);

  // 离开页面时提示保存
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (titleRefValue.current.trim()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // 页面隐藏时尝试保存（visibilitychange 比 beforeunload 更可靠）
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && titleRefValue.current.trim()) {
        handleSaveDraft();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [handleSaveDraft]);

  // 加载已有文章时显示 Skeleton
  if (id && isLoadingArticle) {
    return (
      <PageContainer width="4xl" variant="spaced" className="bg-muted/30">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Link to="/me/drafts" className="text-muted-foreground hover:text-foreground transition-colors text-sm">
              草稿
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <Skeleton className="h-4 w-12" />
          </div>
        </header>
        <main className="space-y-6">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-64 w-full" />
        </main>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="4xl" variant="spaced" className="bg-muted/30">
      {/* 顶部工具栏 - 极简设计 */}
      <header className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3">
          {id ? (
            <>
              <Link
                to="/me/drafts"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                草稿
              </Link>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-sm font-medium">编辑</span>
            </>
          ) : (
            <>
              <Link
                to="/articles"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                文章
              </Link>
              <span className="text-muted-foreground/40">/</span>
              <span className="text-sm font-medium">新建</span>
            </>
          )}
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
              disabled={saving || !title.trim()}
              className="gap-1.5"
            >
              <Save className={cn("size-4", saving && "animate-pulse")} />
              {saving ? "保存中" : "保存"}
            </Button>
            {articleId && (
              <Button
                variant="default"
                size="sm"
                onClick={handlePublish}
                disabled={publishArticle.isPending}
                className="gap-1.5"
              >
                <Send className="size-4" />
                {publishArticle.isPending ? "发布中" : "发布"}
              </Button>
            )}
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

        {/* 摘要输入 */}
        <div className="mb-4">
          <input
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="摘要（可选，最多200字）"
            className={cn(
              "w-full bg-transparent border-0 outline-none",
              "text-sm text-muted-foreground",
              "placeholder:text-muted-foreground/30",
              "transition-colors duration-200"
            )}
            maxLength={200}
          />
        </div>

        {/* 分隔线 - 淡雅 */}
        <div className="h-px bg-border/40 mb-6" />

        {/* 编辑器工具栏折叠控制 */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <PenLine className="size-3" />
            <span>Markdown</span>
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