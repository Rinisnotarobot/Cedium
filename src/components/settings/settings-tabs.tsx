import { Link, useLocation } from "@tanstack/react-router";
import { cn } from "#/lib/utils";

const tabs = [
  { label: "账户", path: "/me/settings" },
  { label: "发布", path: "/me/settings/publishing" },
  { label: "通知", path: "/me/settings/notifications" },
  { label: "会员与支付", path: "/me/settings/membership" },
];

export function SettingsTabs() {
  const location = useLocation();

  return (
    <nav className="flex gap-1 border-b border-border/40 mb-6">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <Link
            key={tab.path}
            to={tab.path}
            className={cn(
              "px-4 py-2.5 text-sm relative",
              "transition-[color,opacity] duration-150 ease-out",
              isActive
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground",
              isActive &&
                "after:absolute after:-bottom-px after:left-0 after:right-0 after:h-[2px] after:bg-primary"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}