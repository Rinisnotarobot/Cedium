import { useEffect, useState } from "react";
import type { Content } from "@tiptap/react";
import { MinimalTiptapEditor } from "#/components/ui/minimal-tiptap";
import { useIsBreakpoint } from "#/hooks/use-is-breakpoint";
import { useThrottledCallback } from "#/hooks/use-throttled-callback";
import { useEditorContent } from "./context";
import { loadDraft, saveDraft, clearDraft } from "./draft-storage";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Button } from "#/components/ui/button";

export function ArticleEditor() {
  const [content, setContent] = useEditorContent();
  const [showClearDialog, setShowClearDialog] = useState(false);
  const isLargeScreen = useIsBreakpoint("min", 1024);

  const throttledSave = useThrottledCallback(
    (value: Content) => saveDraft(value),
    500,
    [],
  );

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setContent(draft);
    }
  }, [setContent]);

  useEffect(() => {
    throttledSave(content);
  }, [content, throttledSave]);

  const handleClearRequest = () => {
    setShowClearDialog(true);
  };

  const handleClearConfirm = () => {
    setContent("");
    clearDraft();
    setShowClearDialog(false);
  };

  return (
    <>
      <MinimalTiptapEditor
        value={content}
        onChange={setContent}
        onClear={handleClearRequest}
        className="min-h-[400px] lg:min-h-[500px]"
        editorContentClassName="p-5 prose prose-sm max-w-none"
        output="html"
        placeholder="开始写作..."
        autofocus={true}
        editable={true}
        editorClassName="focus:outline-hidden"
        toolbarVariant={isLargeScreen ? "full" : "minimal"}
      />

      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>清空内容</DialogTitle>
            <DialogDescription>
              确定要清空所有内容吗？此操作不可撤销，草稿将被删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowClearDialog(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleClearConfirm}>
              清空
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
