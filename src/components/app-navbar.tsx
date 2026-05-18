"use client";

import * as React from "react";
import { Search, LogOut, PenLine, Send } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "#/components/ui/button.tsx";
import { Input } from "#/components/ui/input.tsx";
import { SidebarTrigger } from "#/components/ui/sidebar.tsx";
import { ModeToggle } from "#/components/mode-toggle.tsx";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "#/components/ui/avatar.tsx";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx";
import { cn } from "#/lib/utils.ts";
import { authClient } from "#/lib/auth-client.ts";
import { useHasContent } from "#/components/editor-context";

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {}

export const Navbar = ({ className, ...props }: NavbarProps) => {
  const { data: session, isPending } = authClient.useSession();
  const location = useLocation();
  const isWriteRoute = location.pathname === "/write";
  const hasContent = useHasContent();

  return (
    <nav
      className={cn(
        "sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4 md:px-6",
        className,
      )}
      {...props}
    >
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left */}
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <span className="text-xl font-bold text-foreground">Cedium</span>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-9 w-full"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          {isWriteRoute ? (
            <Button size="default" disabled={!hasContent}>
              <Send className="size-4 mr-1" />
              发布
            </Button>
          ) : (
            <Button size="default" asChild>
              <Link to="/write">
                <PenLine className="size-4 mr-1" />
                写作
              </Link>
            </Button>
          )}
          <ModeToggle />
          {isPending ? (
            <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
          ) : session?.user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={session.user.image ?? undefined}
                      alt={session.user.name ?? "User"}
                    />
                    <AvatarFallback>
                      {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session.user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => authClient.signOut()}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button size="sm" asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
};

Navbar.displayName = "Navbar";
