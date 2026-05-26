import { cn } from "#/lib/utils";

interface ArticleStats {
  draft: number;
  published: number;
  archived: number;
  total: number;
}

interface StatsBarProps {
  stats: ArticleStats;
}

export function StatsBar({ stats }: StatsBarProps) {
  const items = [
    { label: "全部", value: stats.total },
    {
      label: "草稿",
      value: stats.draft,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "已发布",
      value: stats.published,
      color: "text-emerald-600 dark:text-emerald-400",
    },
    { label: "已归档", value: stats.archived, color: "text-muted-foreground" },
  ];

  return (
    <div className="flex items-center gap-6 pb-6 border-b border-border/40 mb-6">
      {items.map((item, i) => (
        <div key={item.label} className="flex items-baseline gap-2">
          <span
            className={cn(
              "text-2xl font-semibold tabular-nums tracking-tight",
              item.color,
            )}
          >
            {item.value}
          </span>
          <span className="text-sm text-muted-foreground">{item.label}</span>
          {i < items.length - 1 && (
            <span className="text-border/60 ml-4">·</span>
          )}
        </div>
      ))}
    </div>
  );
}
