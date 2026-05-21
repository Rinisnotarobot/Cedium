import { Link } from "@tanstack/react-router";
import { ModeToggle } from "#/components/theme";

export function AuthNavbar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-4 md:px-6">
      <div className="flex h-16 items-center justify-between">
        <Link
          to="/"
          className="text-xl font-bold text-foreground hover:text-foreground/80 transition-colors"
        >
          Cedium
        </Link>
        <div className="flex items-center">
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}