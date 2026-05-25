import { BookOpen, PenSquare, Heart, FolderOpen, Sun, Moon, User } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { authClient } from "#/lib/auth-client";

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
    title: "文章管理",
    icon: FolderOpen,
    to: "/me/articles",
  },
];

const readItems = [
  {
    title: "收藏",
    icon: Heart,
    to: "/me/favorites",
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { data: session } = authClient.useSession();

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
      </SidebarContent>

      <SidebarFooter>
        {session?.user && (
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                tooltip="我的主页"
                isActive={isActive(`/users/${session.user.name}`)}
              >
                <Link to="/users/$username" params={{ username: session.user.name }}>
                  <User />
                  <span>我的主页</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <div className="p-2 text-xs text-muted-foreground text-center">
          Cedium v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
