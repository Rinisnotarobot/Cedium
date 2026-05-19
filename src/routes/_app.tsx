import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navbar, AppSidebar } from "#/components/layout";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar";
import { authClient } from "#/lib/auth-client";

// 从 cookie 读取侧边栏初始状态
function getSidebarCookie(): boolean {
  if (typeof document === "undefined") return true;
  const match = document.cookie.match(/sidebar_state=([^;]+)/);
  return match ? match[1] === "true" : true;
}

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    return { session };
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <>
      <SidebarProvider defaultOpen={getSidebarCookie()}>
        <AppSidebar />
        <SidebarInset>
          <Navbar />
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
