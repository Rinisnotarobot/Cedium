import { Link } from "@tanstack/react-router";
import { Save, Eye, Send } from "lucide-react";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { SavedStatus } from "./saved-status";

interface WriteHeaderProps {
  isEdit: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  hasArticleId: boolean;
  publishPending: boolean;
  onSave: () => void;
  onPublish: () => void;
  canSave: boolean;
}

export function WriteHeader({
  isEdit,
  isSaving,
  lastSaved,
  hasArticleId,
  publishPending,
  onSave,
  onPublish,
  canSave,
}: WriteHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* 面包屑导航 */}
      <div className="flex items-center gap-3">
        {isEdit ? (
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

      {/* 操作按钮区 */}
      <div className="flex items-center gap-4">
        <SavedStatus lastSaved={lastSaved} isSaving={isSaving} />

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
            onClick={onSave}
            disabled={isSaving || !canSave}
            className="gap-1.5"
          >
            <Save className={cn("size-4", isSaving && "animate-pulse")} />
            {isSaving ? "保存中" : "保存"}
          </Button>
          {hasArticleId && (
            <Button
              variant="default"
              size="sm"
              onClick={onPublish}
              disabled={publishPending}
              className="gap-1.5"
            >
              <Send className="size-4" />
              {publishPending ? "发布中" : "发布"}
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}