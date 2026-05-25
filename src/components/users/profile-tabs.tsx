import { cn } from "#/lib/utils"

interface ProfileTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const tabs = [
  { id: "home", label: "Home" },
  { id: "activity", label: "Activity" },
  { id: "lists", label: "Lists" },
  { id: "about", label: "About" },
]

export function ProfileTabs({
  activeTab,
  onTabChange,
}: ProfileTabsProps) {
  return (
    <nav className="flex items-center gap-8 border-b border-border/30" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`${tab.id}-panel`}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "relative pb-4 -mb-px text-sm font-medium transition-colors",
            "hover:text-foreground",
            activeTab === tab.id
              ? "text-foreground"
              : "text-muted-foreground"
          )}
        >
          {tab.label}
          {/* 选中状态指示线 */}
          {activeTab === tab.id && (
            <span
              className={cn(
                "absolute bottom-0 left-0 right-0 h-0.5 bg-foreground",
                "rounded-full"
              )}
            />
          )}
        </button>
      ))}
    </nav>
  )
}