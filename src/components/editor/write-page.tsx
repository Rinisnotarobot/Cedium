import { useState, useEffect, useRef, useCallback } from "react";
import {
  Save,
  Eye,
  ChevronDown,
  ChevronUp,
  Check,
  PenLine,
  Send,
} from "lucide-react";
import { PageContainer } from "#/components/layout";
import { Button } from "#/components/ui/button";
import { TagSelector } from "#/components/ui/tag-selector";
import { ArticleEditor } from "#/components/editor";
import { cn } from "#/lib/utils";
import { Link } from "@tanstack/react-router";
import { useCreateArticle, useUpdateArticle, usePublishArticle } from "#/hooks";
import { Route } from "#/routes/_app/write";
import type { Article } from "#/types/article";
import type { Content } from "@tiptap/react";

export function WritePage() {
  const { id } = Route.useSearch();
  const loaderData = Route.useLoaderData();
  const existingArticle = loaderData?.article;

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [content, setContent] = useState<Content>("");
  const titleRef = useRef<HTMLInputElement>(null);

  const draftRef = useRef({ title, excerpt, content, articleId, selectedTags });

  useEffect(() => {
    draftRef.current = { title, excerpt, content, articleId, selectedTags };
  }, [title, excerpt, content, articleId, selectedTags]);

  const createArticle = useCreateArticle({
    onSuccess: (article: Article) => {
      setArticleId(article.id);
      draftRef.current.articleId = article.id;
      setLastSaved(new Date());
    },
  });
  const updateArticle = useUpdateArticle({
    onSuccess: () => setLastSaved(new Date()),
  });
  const publishArticle = usePublishArticle();

  // 加载已有文章数据
  useEffect(() => {
    if (existingArticle && id) {
      setTitle(existingArticle.title);
      setExcerpt(existingArticle.excerpt || "");
      setArticleId(existingArticle.id);

      // 加载现有标签
      if (existingArticle.tags && existingArticle.tags.length > 0) {
        setSelectedTags(existingArticle.tags.map((tag) => tag.slug));
      }

      // 解析并设置编辑器内容
      try {
        const parsedContent = JSON.parse(existingArticle.content);
        setContent(parsedContent);
      } catch {
        setContent(existingArticle.content);
      }

      setLastSaved(new Date(existingArticle.updatedAt));
    } else if (!id) {
      // 新建文章：清空所有状态
      setTitle("");
      setExcerpt("");
      setArticleId(null);
      setSelectedTags([]);
      setContent("");
      setLastSaved(null);
    }
  }, [id, existingArticle]);

  useEffect(() => {
    if (!id) {
      titleRef.current?.focus();
    }
  }, [id]);

  const saving = createArticle.isPending || updateArticle.isPending;

  const handleSaveDraft = useCallback(async (): Promise<string | null> => {
    const { title: currentTitle, excerpt: currentExcerpt, content: currentContent, articleId: currentArticleId, selectedTags: currentTags } = draftRef.current;

    if (!currentTitle.trim()) return null;

    const contentStr =
      typeof currentContent === "string"
        ? currentContent
        : JSON.stringify(currentContent);

    if (currentArticleId) {
      try {
        await updateArticle.mutateAsync({
          id: currentArticleId,
          title: currentTitle,
          excerpt: currentExcerpt || undefined,
          content: contentStr,
          tags: currentTags,
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
          tags: currentTags,
        });
        return result.id;
      } catch {
        return null;
      }
    }
  }, [createArticle, updateArticle]);

  const handlePublish = async () => {
    let publishId = draftRef.current.articleId;
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
      if (draftRef.current.title.trim()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // 页面隐藏时尝试保存
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        draftRef.current.title.trim()
      ) {
        handleSaveDraft();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [handleSaveDraft]);

  return (
    <PageContainer width="4xl" variant="spaced" className="bg-muted/30">
      {/* 顶部工具栏 */}
      <header className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="flex items-center gap-3">
          {id ? (
            <>
              <Link
                to="/me/articles"
                className="text-muted-foreground hover:text-foreground transition-colors text-sm"
              >
                文章管理
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
          {/* 保存状态 */}
          <div className="flex items-center gap-2">
            {lastSaved && (
              <div
                className={cn(
                  "flex items-center gap-1.5 text-xs text-muted-foreground transition-opacity",
                  saving && "opacity-0",
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

      {/* 写作区域 */}
      <main className="space-y-0 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
        {/* 标题输入 */}
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
              title.trim() && "text-foreground",
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
              "transition-colors duration-200",
            )}
            maxLength={200}
          />
        </div>

        <TagSelector
            selectedTags={selectedTags}
            onChange={setSelectedTags}
            maxTags={5}
          />
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
        <ArticleEditor
          value={content}
          onChange={setContent}
          toolbarCollapsed={toolbarCollapsed}
        />
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
