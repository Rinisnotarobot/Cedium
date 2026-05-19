import { ProfileForm } from "#/components/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Badge } from "#/components/ui/badge";
import { Skeleton } from "#/components/ui/skeleton";
import { Separator } from "#/components/ui/separator";
import { authClient } from "#/lib/auth-client";
import { FileText, Settings, Shield, Calendar } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login", search: { redirect: "/profile" } });
    }
  },
  component: ProfilePage,
});

function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-24 mx-auto mt-4" />
                  <Skeleton className="h-4 w-32 mx-auto mt-2" />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-40 w-full" />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
            个人主页
          </h1>
          <p className="text-muted-foreground mt-2">
            管理您的账户信息和偏好设置
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Left: Profile Summary Card */}
          <div className="lg:col-span-1 order-1 lg:order-1">
            <Card className="overflow-hidden">
              {/* Avatar Section */}
              <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background pt-8 pb-6">
                <div className="flex justify-center">
                  <Avatar className="h-20 w-20 ring-2 ring-background shadow-lg">
                    <AvatarImage
                      src={session?.user?.image ?? undefined}
                      alt={session?.user?.name ?? "User"}
                    />
                    <AvatarFallback className="text-2xl bg-primary/20">
                      {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="text-center mt-4">
                  <h2 className="font-semibold text-lg">
                    {session?.user?.name ?? "用户"}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {session?.user?.email}
                  </p>
                  <div className="flex justify-center mt-3">
                    {session?.user?.emailVerified ? (
                      <Badge variant="default" className="bg-emerald-600">
                        已验证
                      </Badge>
                    ) : (
                      <Badge variant="secondary">未验证</Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Quick Stats */}
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <StatItem
                    icon={<FileText className="size-4" />}
                    label="文章"
                    value="0"
                  />
                  <StatItem
                    icon={<Calendar className="size-4" />}
                    label="注册"
                    value={formatDate(session?.user?.createdAt)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="mt-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">快捷操作</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2">
                <QuickActionItem
                  icon={<Settings className="size-4" />}
                  label="账户设置"
                  description="修改密码、通知偏好"
                />
                <QuickActionItem
                  icon={<Shield className="size-4" />}
                  label="安全设置"
                  description="登录记录、两步验证"
                />
              </CardContent>
            </Card>
          </div>

          {/* Right: Profile Form */}
          <div className="lg:col-span-2 order-2 lg:order-2">
            <ProfileForm className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
      <div className="text-muted-foreground">{icon}</div>
      <div>
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
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
      <div className="text-muted-foreground group-hover:text-foreground transition-colors">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </div>
  );
}

function formatDate(date: string | Date | undefined): string {
  if (!date) return "未知";
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}