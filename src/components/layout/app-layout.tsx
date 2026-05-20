import { Outlet } from "@tanstack/react-router";
import { Navbar, AppSidebar } from "#/components/layout";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar";

function getSidebarCookie(): boolean {
  if (typeof document === "undefined") return true;
  const match = document.cookie.match(/sidebar_state=([^;]+)/);
  return match ? match[1] === "true" : true;
}

export function AppLayout() {
  return (
    <SidebarProvider defaultOpen={getSidebarCookie()}>
      <AppSidebar />
      <SidebarInset>
        <Navbar />
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}