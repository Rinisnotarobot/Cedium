import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { authClient } from "#/lib/auth-client";
import { cn } from "#/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "#/components/ui/input-otp";
import { Skeleton } from "#/components/ui/skeleton";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { ProfileEditDialog } from "#/components/settings/profile-edit-dialog";

export function AccountSettings() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  if (isPending) {
    return <AccountSettingsSkeleton />;
  }

  const user = session?.user;

  return (
    <div className="space-y-12">
      {/* 基础信息组 */}
      <div className="space-y-0">
        <SettingsRow onClick={() => setProfileDialogOpen(true)}>
          <SettingsLabelWithSubtitle subtitle="编辑头像、昵称、简介等个人信息">
            个人资料
          </SettingsLabelWithSubtitle>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">{user?.name ?? "—"}</span>
            <Avatar size="sm">
              <AvatarImage
                src={user?.image || undefined}
                alt={user?.name ?? "User"}
              />
              <AvatarFallback>
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </SettingsRow>

        <SettingsRow>
          <SettingsLabel>用户名与子域名</SettingsLabel>
          <span className="text-muted-foreground">{user?.name ?? "—"}</span>
        </SettingsRow>

        <SettingsRow>
          <div className="flex flex-col gap-1">
            <SettingsLabel>邮箱地址</SettingsLabel>
            <EmailVerificationStatus
              emailVerified={user?.emailVerified ?? false}
              email={user?.email ?? ""}
              onVerified={refetch}
            />
          </div>
          <span className="text-muted-foreground">{user?.email ?? "—"}</span>
        </SettingsRow>

        <SettingsRow>
          <SettingsLabelWithSubtitle subtitle="自定义个人主页的外观样式">
            主页设计
          </SettingsLabelWithSubtitle>
          <ArrowUpRight className="size-4 text-muted-foreground" />
        </SettingsRow>
      </div>

      {/* 危险操作组 */}
      <div className="space-y-0">
        <SettingsRow>
          <SettingsLabelWithSubtitle
            subtitle="停用将暂停账户，重新登录后可恢复"
            destructive
          >
            停用账户
          </SettingsLabelWithSubtitle>
          <span className="text-muted-foreground">—</span>
        </SettingsRow>

        <SettingsRow>
          <SettingsLabelWithSubtitle
            subtitle="永久删除账户及所有内容，此操作不可恢复"
            destructive
          >
            删除账户
          </SettingsLabelWithSubtitle>
          <span className="text-muted-foreground">—</span>
        </SettingsRow>
      </div>

      <ProfileEditDialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen} />
    </div>
  );
}

function EmailVerificationStatus({
  emailVerified,
  email,
  onVerified,
}: {
  emailVerified: boolean;
  email: string;
  onVerified: () => void;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 倒计时逻辑
  useEffect(() => {
    if (countdown <= 0 || !dialogOpen) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, dialogOpen]);

  // 对话框关闭时重置
  useEffect(() => {
    if (!dialogOpen) {
      setOtp("");
      setCountdown(0);
    }
  }, [dialogOpen]);

  const handleSendOtp = useCallback(async () => {
    if (countdown > 0) return;

    setIsSending(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "email-verification",
      });

      if (error) {
        toast.error(error.message ?? "发送验证码失败，请稍后重试");
        return;
      }

      setCountdown(60);
      toast.success("验证码已发送");
    } finally {
      setIsSending(false);
    }
  }, [countdown, email]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      toast.error("请输入 6 位验证码");
      return;
    }
    setIsVerifying(true);
    try {
      await authClient.$fetch("/email-otp/verify-email", {
        method: "POST",
        body: { email, otp },
      });
      toast.success("邮箱验证成功");
      setDialogOpen(false);
      onVerified();
    } catch {
      toast.error("验证码错误或已过期");
    } finally {
      setIsVerifying(false);
    }
  };

  if (emailVerified) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          已验证
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className="text-xs text-muted-foreground">
        未验证
      </Badge>
      <Button
        variant="link"
        size="xs"
        className="h-auto p-0 text-xs text-primary hover:text-primary/80 transition-colors duration-150"
        onClick={() => {
          setDialogOpen(true);
        }}
      >
        去验证
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader className="text-center">
            <DialogTitle className="text-wrap-balance">验证邮箱</DialogTitle>
            <DialogDescription className="text-wrap-pretty">
              验证码将发送至 <span className="font-medium text-foreground">{email}</span>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center gap-5 py-2">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              disabled={isVerifying}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <Button
              variant="outline"
              onClick={handleSendOtp}
              disabled={isSending || countdown > 0}
              className={cn(
                "w-full",
                "transition-[transform,opacity] duration-150 ease-out",
                "active:scale-[0.97]",
                countdown > 0 && "opacity-70"
              )}
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : countdown > 0 ? (
                <span className="tabular-nums">{countdown}秒后可重发</span>
              ) : (
                "发送验证码"
              )}
            </Button>
          </div>

          <DialogFooter className="justify-center">
            <Button
              onClick={handleVerify}
              disabled={isVerifying || otp.length !== 6}
              className={cn(
                "w-full",
                "transition-[transform,opacity] duration-150 ease-out",
                "active:scale-[0.97]",
                "disabled:opacity-50"
              )}
            >
              {isVerifying && <Loader2 className="size-4 animate-spin" />}
              验证
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AccountSettingsSkeleton() {
  return (
    <div className="space-y-12">
      <div className="space-y-0">
        {[1, 2, 3, 4].map((i) => (
          <SettingsRow key={i}>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              {i >= 3 && <Skeleton className="h-3 w-48" />}
            </div>
            <Skeleton className="h-4 w-20" />
          </SettingsRow>
        ))}
      </div>
      <div className="space-y-0">
        {[5, 6].map((i) => (
          <SettingsRow key={i}>
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-4 w-8" />
          </SettingsRow>
        ))}
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

function SettingsLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-foreground">{children}</span>;
}

function SettingsLabelWithSubtitle({
  children,
  subtitle,
  destructive,
}: {
  children: React.ReactNode;
  subtitle: string;
  destructive?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className={cn(destructive ? "text-destructive" : "text-foreground")}
      >
        {children}
      </span>
      <span className="text-muted-foreground text-sm text-wrap-pretty">
        {subtitle}
      </span>
    </div>
  );
}
