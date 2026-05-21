import { Outlet } from "@tanstack/react-router";
import { AuthNavbar } from "./auth-navbar";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background">
      <AuthNavbar />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Outlet />
      </div>
    </div>
  );
}