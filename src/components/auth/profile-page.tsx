import { PageContainer, PageHeader } from "#/components/layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "#/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Badge } from "#/components/ui/badge";
import { Skeleton } from "#/components/ui/skeleton";
import { Separator } from "#/components/ui/separator";
import { authClient } from "#/lib/auth-client";
import { ProfileForm } from "#/components/auth";
import { Shield, Calendar, KeyRound, Bell, History, UserRound } from "lucide-react";

export function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <PageContainer width="2xl">
        <div className="mx-auto max-w-2xl px-6 py-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
          <div className="mt-8 grid gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-14 w-14 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-40 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer width="2xl">
      <PageHeader title="个人设置" description="管理您的账户信息和安全设置" />

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src={session?.user?.image ?? undefined}
                  alt={session?.user?.name ?? "User"}
                />
                <AvatarFallback className="text-lg">
                  {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="font-medium truncate">
                  {session?.user?.name ?? "用户"}
                </h2>
                <p className="text-sm text-muted-foreground truncate">
                  {session?.user?.email}
                </p>
              </div>
              {session?.user?.emailVerified ? (
                <Badge variant="default" className="shrink-0 bg-emerald-600 text-white">
                  已验证
                </Badge>
              ) : (
                <Badge variant="secondary" className="shrink-0">未验证</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="mt-6">
          <ProfileForm className="w-full" />
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">账户信息</CardTitle>
            <CardDescription>注册时间与安全状态</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <AccountInfoItem
                icon={<Calendar className="size-4" />}
                label="注册时间"
                value={formatDate(session?.user?.createdAt)}
              />
              <AccountInfoItem
                icon={<Shield className="size-4" />}
                label="邮箱状态"
                value={session?.user?.emailVerified ? "已验证" : "未验证"}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">快捷操作</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-1">
            <QuickActionItem
              icon={<UserRound className="size-4" />}
              label="个人资料"
              description="编辑姓名和头像"
            />
            <QuickActionItem
              icon={<KeyRound className="size-4" />}
              label="修改密码"
              description="更新您的登录密码"
            />
            <QuickActionItem
              icon={<Bell className="size-4" />}
              label="通知设置"
              description="管理邮件和推送通知"
            />
            <QuickActionItem
              icon={<History className="size-4" />}
              label="登录记录"
              description="查看最近的登录活动"
            />
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <div className="mb-8">
          <p className="text-xs text-muted-foreground">
            如需帮助，请联系 <a href="#" className="underline underline-offset-2 hover:text-foreground">客服支持</a>
          </p>
        </div>
    </PageContainer>
  );
}

function AccountInfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="text-muted-foreground mt-0.5">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-medium text-sm">{value}</div>
      </div>
    </div>
  );
}

function QuickActionItem({
  icon,
  label,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg p-2.5 hover:bg-muted/50 transition-colors cursor-pointer group">
      <div className="text-muted-foreground group-hover:text-foreground transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground truncate">{description}</div>
      </div>
    </div>
  );
}

function formatDate(date: string | Date | undefined): string {
  if (!date) return "未知";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}