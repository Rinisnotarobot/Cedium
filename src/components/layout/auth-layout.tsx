import { Outlet, Link } from "@tanstack/react-router";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold text-foreground">
            Cedium
          </Link>
        </div>
      </nav>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Outlet />
      </div>
    </div>
  );
}