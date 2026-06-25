import { Outlet } from "@tanstack/react-router";
import { AuthNavbar } from "./auth-navbar";

export function AuthLayout() {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Soft warm glow up top to echo the starfield home page and reduce
          the empty-canvas feel around the centered card. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,oklch(0.62_0.14_39.04/0.12),transparent_70%)]"
        aria-hidden
      />
      <AuthNavbar />
      <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Outlet />
      </div>
    </div>
  );
}