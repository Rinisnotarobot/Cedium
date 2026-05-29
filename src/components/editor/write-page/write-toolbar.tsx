import { ChevronDown, ChevronUp, PenLine } from "lucide-react";

interface WriteToolbarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function WriteToolbar({ collapsed, onToggle }: WriteToolbarProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <PenLine className="size-3" />
        <span>Markdown</span>
      </div>
      <button
        onClick={onToggle}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? (
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
  );
}