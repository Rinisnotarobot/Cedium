import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Navbar } from "#/components/app-navbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "#/components/app-sidebar";

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
