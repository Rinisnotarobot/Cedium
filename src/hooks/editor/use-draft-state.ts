import { useState, useRef, useCallback, useEffect } from "react";
import type { Content } from "@tiptap/react";
import type { Article } from "#/types/article";

interface DraftData {
  title: string;
  excerpt: string;
  content: Content;
  selectedTags: string[];
  articleId: string | null;
}

interface UseDraftStateOptions {
  /** 已有文章数据（编辑模式） */
  existingArticle?: Article | null;
  /** 文章 ID from search params */
  id?: string;
}

interface DraftSetters {
  setTitle: (title: string) => void;
  setExcerpt: (excerpt: string) => void;
  setContent: (content: Content) => void;
  setSelectedTags: (tags: string[]) => void;
  setArticleId: (id: string | null) => void;
  setToolbarCollapsed: (collapsed: boolean) => void;
}

interface UseDraftStateReturn {
  draft: DraftData & { toolbarCollapsed: boolean };
  setters: DraftSetters;
  /** Ref for latest draft (useful for async callbacks) */
  draftRef: React.MutableRefObject<DraftData>;
  /** Last saved timestamp */
  lastSaved: Date | null;
  setLastSaved: (date: Date | null) => void;
  /** Reset draft to initial state */
  reset: () => void;
}

const INITIAL_DRAFT: DraftData = {
  title: "",
  excerpt: "",
  content: "",
  selectedTags: [],
  articleId: null,
};

export function useDraftState(options: UseDraftStateOptions): UseDraftStateReturn {
  const { existingArticle, id } = options;

  const [draft, setDraft] = useState<DraftData>(INITIAL_DRAFT);
  const [toolbarCollapsed, setToolbarCollapsed] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Ref for async callback access
  const draftRef = useRef<DraftData>(draft);

  // Keep ref synced
  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  // Load existing article or reset for new
  useEffect(() => {
    if (existingArticle && id) {
      // 编辑模式：加载已有文章
      const parsedContent = tryParseContent(existingArticle.content);
      setDraft({
        title: existingArticle.title,
        excerpt: existingArticle.excerpt || "",
        content: parsedContent,
        selectedTags: existingArticle.tags?.map((tag) => tag.slug) || [],
        articleId: existingArticle.id,
      });
      setLastSaved(new Date(existingArticle.updatedAt));
    } else if (!id) {
      // 新建模式：清空所有状态
      setDraft(INITIAL_DRAFT);
      setLastSaved(null);
    }
  }, [id, existingArticle]);

  // Individual setters for convenience
  const setTitle = useCallback((title: string) => {
    setDraft((prev) => ({ ...prev, title }));
  }, []);

  const setExcerpt = useCallback((excerpt: string) => {
    setDraft((prev) => ({ ...prev, excerpt }));
  }, []);

  const setContent = useCallback((content: Content) => {
    setDraft((prev) => ({ ...prev, content }));
  }, []);

  const setSelectedTags = useCallback((tags: string[]) => {
    setDraft((prev) => ({ ...prev, selectedTags: tags }));
  }, []);

  const setArticleId = useCallback((articleId: string | null) => {
    setDraft((prev) => ({ ...prev, articleId }));
  }, []);

  const reset = useCallback(() => {
    setDraft(INITIAL_DRAFT);
    setLastSaved(null);
    setToolbarCollapsed(false);
  }, []);

  return {
    draft: { ...draft, toolbarCollapsed },
    setters: {
      setTitle,
      setExcerpt,
      setContent,
      setSelectedTags,
      setArticleId,
      setToolbarCollapsed,
    },
    draftRef,
    lastSaved,
    setLastSaved,
    reset,
  };
}

/** 尝试解析 JSON 内容，失败则返回原字符串 */
function tryParseContent(content: string): Content {
  try {
    return JSON.parse(content);
  } catch {
    return content;
  }
}