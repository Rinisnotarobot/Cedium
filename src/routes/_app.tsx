import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navbar, AppSidebar } from "#/components/layout";
import { SidebarInset, SidebarProvider } from "#/components/ui/sidebar";

export const Route = createFileRoute("/_app")({
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
