import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navbar, AppSidebar } from "#/components/layout";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    return { session };
  },
  component: AppLayout,
});

function AppLayout() {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Navbar />
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
    </>
  );
}
