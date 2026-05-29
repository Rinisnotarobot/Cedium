import { useRef, useCallback, useEffect } from "react";
import { PageContainer } from "#/components/layout";
import { ArticleEditor } from "#/components/editor";
import { WriteHeader, WriteMeta, WriteToolbar } from "./write-page/index";
import { useDraftState, useAutosave, useCreateArticle, useUpdateArticle, usePublishArticle } from "#/hooks";
import { Route } from "#/routes/_app/write";
import type { Article } from "#/types/article";

export function WritePage() {
  const { id } = Route.useSearch();
  const loaderData = Route.useLoaderData();
  const existingArticle = loaderData?.article;

  // 草稿状态管理
  const { draft, setters, draftRef, lastSaved, setLastSaved } = useDraftState({
    existingArticle,
    id,
  });

  const titleRef = useRef<HTMLInputElement>(null);

  // Mutation hooks
  const createArticle = useCreateArticle({
    onSuccess: (article: Article) => {
      setters.setArticleId(article.id);
      draftRef.current.articleId = article.id;
      setLastSaved(new Date());
    },
  });
  const updateArticle = useUpdateArticle({
    onSuccess: () => setLastSaved(new Date()),
  });
  const publishArticle = usePublishArticle();

  // 保存草稿核心逻辑
  const handleSaveDraft = useCallback(async (): Promise<string | null> => {
    const { title, excerpt, content, articleId, selectedTags } = draftRef.current;
    if (!title.trim()) return null;

    const contentStr =
      typeof content === "string" ? content : JSON.stringify(content);

    if (articleId) {
      try {
        await updateArticle.mutateAsync({
          id: articleId,
          title,
          excerpt: excerpt || undefined,
          content: contentStr,
          tags: selectedTags,
        });
        return articleId;
      } catch {
        return null;
      }
    } else {
      try {
        const result = await createArticle.mutateAsync({
          title,
          excerpt: excerpt || undefined,
          content: contentStr,
          tags: selectedTags,
        });
        return result.id;
      } catch {
        return null;
      }
    }
  }, [createArticle, updateArticle]);

  // 自动保存
  const { isSaving } = useAutosave({
    saveFn: handleSaveDraft,
    shouldSave: () => draftRef.current.title.trim().length > 0,
  });

  // 发布
  const handlePublish = async () => {
    let publishId = draftRef.current.articleId;
    if (!publishId) {
      publishId = await handleSaveDraft();
      if (!publishId) return;
    }
    publishArticle.mutate({ id: publishId });
  };

  // 新建文章时聚焦标题
  useEffect(() => {
    if (!id) {
      titleRef.current?.focus();
    }
  }, [id]);

  const saving = isSaving || createArticle.isPending || updateArticle.isPending;

  return (
    <PageContainer width="4xl" variant="spaced" className="bg-muted/30">
      <WriteHeader
        isEdit={Boolean(id)}
        isSaving={saving}
        lastSaved={lastSaved}
        hasArticleId={Boolean(draft.articleId)}
        publishPending={publishArticle.isPending}
        onSave={handleSaveDraft}
        onPublish={handlePublish}
        canSave={draft.title.trim().length > 0}
      />

      <main className="space-y-0">
        <WriteMeta
          title={draft.title}
          excerpt={draft.excerpt}
          selectedTags={draft.selectedTags}
          onTitleChange={setters.setTitle}
          onExcerptChange={setters.setExcerpt}
          onTagsChange={setters.setSelectedTags}
          titleRef={titleRef}
        />

        <WriteToolbar
          collapsed={draft.toolbarCollapsed}
          onToggle={() => setters.setToolbarCollapsed(!draft.toolbarCollapsed)}
        />

        <ArticleEditor
          value={draft.content}
          onChange={setters.setContent}
          toolbarCollapsed={draft.toolbarCollapsed}
        />
      </main>

      <footer className="h-24" />
    </PageContainer>
  );
}