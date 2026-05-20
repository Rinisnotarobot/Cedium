"use client";

import { useForm } from "@tanstack/react-form";
import { authClient } from "#/lib/auth-client";
import { profileSchema } from "#/lib/validators/profile";
import { useNavigate } from "@tanstack/react-router";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
  FieldDescription,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Skeleton } from "#/components/ui/skeleton";
import { FileInput } from "#/components/ui/file-input";
import { Badge } from "#/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "#/components/ui/dialog";
import { cn } from "#/lib/utils";
import { toast } from "sonner";
import { useState } from "react";
import { ChangePasswordForm } from "./change-password-form";

export interface ProfileFormProps extends React.ComponentProps<typeof Card> {}

export function ProfileForm({ className, ...props }: ProfileFormProps) {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();
  const [uploading, setUploading] = useState(false);
  const [resending, setResending] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  const isEmailVerified = session?.user?.emailVerified ?? false;

  const form = useForm({
    defaultValues: {
      name: session?.user?.name ?? "",
      image: session?.user?.image ?? "",
    },
    validators: {
      onChange: profileSchema,
    },
    onSubmit: async ({ value }) => {
      const { data, error } = await authClient.updateUser({
        name: value.name,
        image: value.image || undefined,
      });

      if (error) {
        toast.error(error.message ?? "更新失败，请稍后重试");
        return;
      }

      if (data) {
        toast.success("个人信息已更新");
      }
    },
  });

  const handleFileUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!result.success) {
        toast.error(result.error || "上传失败");
        return;
      }

      form.setFieldValue("image", result.url);
      toast.success("头像已更新");
    } catch {
      toast.error("上传失败，请稍后重试");
    } finally {
      setUploading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!session?.user?.email) return;

    setResending(true);
    try {
      const { error } = await authClient.emailOtp.sendVerificationOtp({
        email: session.user.email,
        type: "email-verification",
      });

      if (error) {
        toast.error(error.message ?? "发送失败，请稍后重试");
        return;
      }

      toast.success("验证码已发送");
      navigate({
        to: "/verify-email",
        search: { email: session.user.email },
      });
    } finally {
      setResending(false);
    }
  };

  if (isPending) {
    return (
      <Card className={cn("w-full", className)} {...props}>
        <CardHeader>
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-40 mt-2" />
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-9 w-full" />
            </Field>
            <Field>
              <Skeleton className="h-4 w-8 mb-2" />
              <Skeleton className="h-9 w-full" />
            </Field>
            <Skeleton className="h-9 w-full" />
          </FieldGroup>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full", className)} {...props}>
      <CardHeader className="pb-4">
        <CardTitle className="text-base">个人资料</CardTitle>
        <CardDescription>查看和编辑您的个人信息</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field name="name">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="name">姓名</FieldLabel>
                  <Input
                    id="name"
                    type="text"
                    placeholder="您的姓名"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            </form.Field>

            <Field>
              <FieldLabel htmlFor="email">邮箱</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  id="email"
                  type="email"
                  value={session?.user?.email ?? ""}
                  disabled
                  className="bg-muted/50"
                />
                {isEmailVerified ? (
                  <Badge variant="default" className="shrink-0">
                    已验证
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="shrink-0">
                    未验证
                  </Badge>
                )}
              </div>
              {!isEmailVerified && (
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="mt-1 h-auto p-0"
                  onClick={handleResendVerification}
                  disabled={resending}
                >
                  {resending ? "发送中..." : "发送验证码"}
                </Button>
              )}
              <FieldDescription>邮箱地址不可修改</FieldDescription>
            </Field>

            <form.Field name="image">
              {(field) => (
                <Field>
                  <FieldLabel>头像</FieldLabel>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={field.state.value || undefined}
                        alt={session?.user?.name ?? "User"}
                      />
                      <AvatarFallback className="text-xs">
                        {session?.user?.name?.charAt(0).toUpperCase() ?? "U"}
                      </AvatarFallback>
                    </Avatar>
                    <FileInput
                      onFileSelect={handleFileUpload}
                      onError={(error) => toast.error(error)}
                      disabled={uploading}
                    >
                      <Button type="button" variant="outline" size="sm" disabled={uploading}>
                        {uploading ? "上传中..." : "更换头像"}
                      </Button>
                    </FileInput>
                  </div>
                </Field>
              )}
            </form.Field>

            <Dialog
              open={passwordDialogOpen}
              onOpenChange={setPasswordDialogOpen}
            >
              <DialogTrigger asChild>
                <Button type="button" variant="outline" className="w-full">
                  修改密码
                </Button>
              </DialogTrigger>
              <DialogContent showCloseButton={false} className="max-w-md p-0">
                <DialogTitle className="sr-only">修改密码</DialogTitle>
                <DialogDescription className="sr-only">
                  输入当前密码验证身份，然后设置新密码
                </DialogDescription>
                <ChangePasswordForm
                  onSuccess={() => setPasswordDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <Field>
                  <Button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? "保存中..." : "保存更改"}
                  </Button>
                </Field>
              )}
            </form.Subscribe>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
