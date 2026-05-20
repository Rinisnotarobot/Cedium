import { BookOpen, PenSquare, User, Heart, FileText, Sun, Moon } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "#/components/theme/theme-provider";

const navItems = [
  {
    title: "文章列表",
    icon: BookOpen,
    to: "/articles",
  },
  {
    title: "写作",
    icon: PenSquare,
    to: "/write",
  },
  {
    title: "草稿箱",
    icon: FileText,
    to: "/me/drafts",
  },
];

const readItems = [
  {
    title: "收藏",
    icon: Heart,
    to: "/me/favorites",
  },
];

const settingsItems = [
  {
    title: "个人资料",
    icon: User,
    to: "/me/profile",
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  // const { session, isPending } = useRouteState();

  const isActive = (to: string) => location.pathname === to;

  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="border-b border-border/40">
        <div className="flex items-center justify-between px-2 py-3">
          <div className="flex items-center gap-2">
            {isDark ? (
              <Moon className="size-4 text-muted-foreground" />
            ) : (
              <Sun className="size-4 text-muted-foreground" />
            )}
            <span className="text-sm font-medium">
              {isDark ? "暗色" : "亮色"}
            </span>
          </div>
          <Switch
            checked={isDark}
            onCheckedChange={toggleTheme}
            aria-label="切换主题"
          />
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>创作</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive(item.to)}
                  >
                    <Link to={item.to}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>阅读</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {readItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive(item.to)}
                  >
                    <Link to={item.to}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>设置</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={isActive(item.to)}
                  >
                    <Link to={item.to}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2 text-xs text-muted-foreground text-center">
          Cedium v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
