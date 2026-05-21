"use client";

import { authClient } from "#/lib/auth-client";
import { cn } from "#/lib/utils";
import { Badge } from "#/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Skeleton } from "#/components/ui/skeleton";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { ChangePasswordForm } from "#/components/auth/change-password-form";

export function SecuritySettings() {
  const { data: session, isPending } = authClient.useSession();
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  if (isPending) {
    return <SecuritySettingsSkeleton />;
  }

  const user = session?.user;

  return (
    <div className="space-y-12">
      {/* 密码与认证组 */}
      <div className="space-y-0">
        <SettingsRow onClick={() => setPasswordDialogOpen(true)}>
          <SettingsLabelWithSubtitle subtitle="定期更新密码可以提高账户安全性">
            修改密码
          </SettingsLabelWithSubtitle>
          <ArrowUpRight className="size-4 text-muted-foreground" />
        </SettingsRow>

        <SettingsRow>
          <SettingsLabelWithSubtitle subtitle="添加额外的身份验证步骤，防止账户被盗">
            两步验证
          </SettingsLabelWithSubtitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs text-muted-foreground">
              未启用
            </Badge>
          </div>
        </SettingsRow>

        <SettingsRow>
          <SettingsLabelWithSubtitle subtitle="查看最近登录设备和位置">
            登录历史
          </SettingsLabelWithSubtitle>
          <ArrowUpRight className="size-4 text-muted-foreground" />
        </SettingsRow>
      </div>

      {/* 安全状态总览 */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">安全状态</h3>
        <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
          <ShieldCheck className="size-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {user?.emailVerified
              ? "您的账户安全等级为标准。建议启用两步验证以获得更高保护。"
              : "请先验证邮箱以提高账户安全性。"}
          </span>
        </div>
      </div>

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent showCloseButton={false} className="max-w-md p-0">
          <DialogHeader className="sr-only">
            <DialogTitle>修改密码</DialogTitle>
            <DialogDescription>
              输入当前密码验证身份，然后设置新密码
            </DialogDescription>
          </DialogHeader>
          <ChangePasswordForm
            onSuccess={() => setPasswordDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SecuritySettingsSkeleton() {
  return (
    <div className="space-y-12">
      <div className="space-y-0">
        {[1, 2, 3].map((i) => (
          <SettingsRow key={i}>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-4 w-8" />
          </SettingsRow>
        ))}
      </div>
      <div className="space-y-3">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    </div>
  );
}

interface SettingsRowProps {
  children: React.ReactNode;
  onClick?: () => void;
}

function SettingsRow({ children, onClick }: SettingsRowProps) {
  const handleClick = () => {
    onClick?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex items-start justify-between py-5 px-4 -mx-4 rounded-lg",
        "transition-[background-color,transform] duration-150 ease-out",
        onClick &&
          "cursor-pointer hover:bg-muted/50 active:scale-[0.995] focus-visible:ring-2 focus-visible:ring-ring/50",
      )}
    >
      {children}
    </div>
  );
}

function SettingsLabelWithSubtitle({
  children,
  subtitle,
}: {
  children: React.ReactNode;
  subtitle: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-foreground">{children}</span>
      <span className="text-muted-foreground text-sm text-wrap-pretty">
        {subtitle}
      </span>
    </div>
  );
}