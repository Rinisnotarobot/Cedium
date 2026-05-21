import { Link, useNavigate } from "@tanstack/react-router";
import {
  LogOut,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Button } from "#/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu";
import { authClient } from "#/lib/auth-client";

interface NavbarUserMenuProps {
  session: {
    user: { name: string | null; email: string; image?: string | null };
  } | null;
  isPending: boolean;
}

export function NavbarUserMenu({ session, isPending }: NavbarUserMenuProps) {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await authClient.signOut();
    navigate({ to: "/login" });
  };

  if (isPending) {
    return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />;
  }

  if (!session?.user) {
    return (
      <Button size="default" asChild>
        <Link to="/login">登录</Link>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative rounded-full h-11 w-11">
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
        <DropdownMenuLabel className="font-normal flex space-x-2">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={session.user.image ?? undefined}
              alt={session.user.name ?? "User"}
            />
          </Avatar>
          <div className="flex flex-col justify-evenly space-y-1">
            <p className="text-sm font-medium leading-none">
              {session.user.name}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/me/settings">
            <Settings className="mr-2 h-4 w-4" />
            设置
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link to="/about">
            <HelpCircle className="mr-2 h-4 w-4" />
            帮助
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
