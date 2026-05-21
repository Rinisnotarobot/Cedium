"use client";

import * as React from "react";
import { cn } from "#/lib/utils.ts";
import { useRouteState } from "#/hooks/use-route-state";
import { useHasContent } from "#/components/editor";
import { NavbarBrand } from "./navbar-brand";
import { NavbarSearch } from "./navbar-search";
import { NavbarActions } from "./navbar-actions";
import { NavbarUserMenu } from "./navbar-user-menu";

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {}

export const Navbar = ({ className, ...props }: NavbarProps) => {
  const { isWriteRoute, isArticlesRoute, session, isPending } = useRouteState();
  const hasContent = useHasContent();

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4",
        className,
      )}
      {...props}
    >
      <div className="flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <NavbarBrand />
          <NavbarSearch visible={isArticlesRoute} />
        </div>
        <div className="flex items-center gap-3">
          <NavbarActions isWriteRoute={isWriteRoute} hasContent={hasContent} />
          <NavbarUserMenu session={session} isPending={isPending} />
        </div>
      </div>
    </nav>
  );
};

Navbar.displayName = "Navbar";
