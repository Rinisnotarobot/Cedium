import { TagSelector } from "#/components/ui/tag-selector";
import { cn } from "#/lib/utils";

interface WriteMetaProps {
  title: string;
  excerpt: string;
  selectedTags: string[];
  onTitleChange: (title: string) => void;
  onExcerptChange: (excerpt: string) => void;
  onTagsChange: (tags: string[]) => void;
  titleRef?: React.RefObject<HTMLInputElement | null>;
}

export function WriteMeta({
  title,
  excerpt,
  selectedTags,
  onTitleChange,
  onExcerptChange,
  onTagsChange,
  titleRef,
}: WriteMetaProps) {
  return (
    <div className="space-y-0 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
      {/* 标题输入 */}
      <div className="mb-6">
        <input
          ref={titleRef}
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
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
          onChange={(e) => onExcerptChange(e.target.value)}
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
        onChange={onTagsChange}
        maxTags={5}
      />
      <div className="h-px bg-border/40 mb-6" />
    </div>
  );
}