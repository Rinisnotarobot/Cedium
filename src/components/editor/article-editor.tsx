import { useState, useRef } from "react";
import { MinimalTiptapEditor } from "#/components/ui/minimal-tiptap";
import { useIsBreakpoint } from "#/hooks/use-is-breakpoint";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import type { Content } from "@tiptap/react";

interface ArticleEditorProps {
  value: Content;
  onChange: (content: Content) => void;
  toolbarCollapsed?: boolean;
}

export function ArticleEditor({
  value,
  onChange,
  toolbarCollapsed = false,
}: ArticleEditorProps) {
  const [showClearDialog, setShowClearDialog] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const isLargeScreen = useIsBreakpoint("min", 1024);

  const handleClearRequest = () => {
    setShowClearDialog(true);
  };

  const handleClearConfirm = () => {
    onChange("");
    setShowClearDialog(false);
  };

  return (
    <>
      <div ref={editorRef} className="relative rounded-lg">
        <MinimalTiptapEditor
          value={value}
          onChange={onChange}
          onClear={handleClearRequest}
          editorContentClassName={cn(
            "prose prose-sm max-w-none min-h-[50vh] p-6",
            "prose-headings:font-semibold prose-headings:tracking-tight",
            "prose-p:text-muted-foreground prose-p:leading-relaxed",
            "focus:outline-none"
          )}
          output="json"
          placeholder="开始写作..."
          autofocus={false}
          editable={true}
          editorClassName="focus:outline-hidden"
          toolbarVariant={toolbarCollapsed ? "minimal" : (isLargeScreen ? "full" : "minimal")}
          className="border-0 shadow-none bg-transparent"
        />
      </div>

      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>清空内容</DialogTitle>
            <DialogDescription>
              确定要清空所有内容吗？此操作不可撤销。
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