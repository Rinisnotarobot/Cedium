import { useState, useEffect, useRef, useCallback } from "react";
import { useThrottledCallback } from "#/hooks/use-throttled-callback";

interface UseAutosaveOptions {
  /** 保存函数 */
  saveFn: () => Promise<string | null>;
  /** 是否应该保存的条件 */
  shouldSave: () => boolean;
  /** 防抖延迟（ms） */
  throttleDelay?: number;
  /** 启用 Ctrl+S 快捷键 */
  enableKeyboardShortcut?: boolean;
  /** 启用 beforeunload 提示 */
  enableBeforeUnload?: boolean;
  /** 启用 visibilitychange 自动保存 */
  enableVisibilitySave?: boolean;
}

interface UseAutosaveReturn {
  isSaving: boolean;
  /** 手动触发保存 */
  save: () => Promise<string | null>;
  /** 取消 pending 保存 */
  cancel: () => void;
}

export function useAutosave({
  saveFn,
  shouldSave,
  throttleDelay = 2000,
  enableKeyboardShortcut = true,
  enableBeforeUnload = true,
  enableVisibilitySave = true,
}: UseAutosaveOptions): UseAutosaveReturn {
  const [isSaving, setIsSaving] = useState(false);

  // Keep refs updated for async callbacks
  const saveRef = useRef(saveFn);
  const shouldSaveRef = useRef(shouldSave);

  useEffect(() => {
    saveRef.current = saveFn;
    shouldSaveRef.current = shouldSave;
  }, [saveFn, shouldSave]);

  // Throttled save for frequent triggers
  const throttledSave = useThrottledCallback(
    async () => {
      if (!shouldSaveRef.current()) return;
      setIsSaving(true);
      try {
        await saveRef.current();
      } finally {
        setIsSaving(false);
      }
    },
    throttleDelay,
    [throttleDelay]
  );

  // Ctrl+S keyboard shortcut
  useEffect(() => {
    if (!enableKeyboardShortcut) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        throttledSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enableKeyboardShortcut, throttledSave]);

  // beforeunload warning
  useEffect(() => {
    if (!enableBeforeUnload) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (shouldSaveRef.current()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [enableBeforeUnload]);

  // visibilitychange save
  useEffect(() => {
    if (!enableVisibilitySave) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden" && shouldSaveRef.current()) {
        throttledSave.flush();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [enableVisibilitySave, throttledSave]);

  // Manual save
  const save = useCallback(async () => {
    if (!shouldSaveRef.current()) return null;
    setIsSaving(true);
    try {
      const result = await saveRef.current();
      return result;
    } finally {
      setIsSaving(false);
    }
  }, []);

  return {
    isSaving,
    save,
    cancel: throttledSave.cancel,
  };
}