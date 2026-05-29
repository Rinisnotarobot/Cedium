import { Check } from "lucide-react";
import { cn } from "#/lib/utils";

interface SavedStatusProps {
  lastSaved: Date | null;
  isSaving: boolean;
}

export function SavedStatus({ lastSaved, isSaving }: SavedStatusProps) {
  if (!lastSaved) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs text-muted-foreground transition-opacity",
        isSaving && "opacity-0",
      )}
    >
      <Check className="size-3 text-emerald-500" />
      <span className="tabular-nums">{formatTime(lastSaved)}</span>
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "刚刚";
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}