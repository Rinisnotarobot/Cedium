"use client";

import { useForm } from "@tanstack/react-form";
import { authClient } from "#/lib/auth-client";
import { profileSchema } from "#/lib/validators/profile";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "#/components/ui/card";
import { Field, FieldLabel, FieldError, FieldGroup, FieldDescription } from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "#/components/ui/avatar";
import { Skeleton } from "#/components/ui/skeleton";
import { cn } from "#/lib/utils";
import { toast } from "sonner";

export interface ProfileFormProps extends React.ComponentProps<typeof Card> {}

export function ProfileForm({ className, ...props }: ProfileFormProps) {
  const { data: session, isPending } = authClient.useSession();

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

  if (isPending) {
    return (
      <Card className={cn("w-full max-w-md", className)} {...props}>
        <CardHeader className="text-center">
          <Skeleton className="h-6 w-24 mx-auto" />
          <Skeleton className="h-4 w-40 mx-auto mt-2" />
        </CardHeader>
        <CardContent>
          <FieldGroup>
            {/* Avatar Skeleton */}
            <div className="flex justify-center mb-6">
              <Skeleton className="h-16 w-16 rounded-full" />
            </div>

            {/* Name Field Skeleton */}
            <Field>
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-9 w-full" />
            </Field>

            {/* Image URL Field Skeleton */}
            <Field>
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-4 w-32 mt-2" />
            </Field>

            {/* Email Field Skeleton */}
            <Field>
              <Skeleton className="h-4 w-8 mb-2" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-4 w-28 mt-2" />
            </Field>

            {/* Submit Button Skeleton */}
            <Skeleton className="h-9 w-full" />
          </FieldGroup>
        </CardContent>
      </Card>
    );
  }

  if (!session?.user) {
    return (
      <Card className={cn("w-full max-w-md", className)} {...props}>
        <CardHeader>
          <CardTitle>个人资料</CardTitle>
          <CardDescription>请先登录</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-md", className)} {...props}>
      <CardHeader className="text-center">
        <CardTitle>个人资料</CardTitle>
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
            {/* Avatar Preview */}
            <form.Field name="image">
              {(field) => (
                <div className="flex justify-center mb-6">
                  <Avatar size="lg" className="h-16 w-16">
                    <AvatarImage
                      src={field.state.value || undefined}
                      alt={session.user.name ?? "User"}
                    />
                    <AvatarFallback className="text-lg">
                      {session.user.name?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}
            </form.Field>

            {/* Name Field */}
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

            {/* Image URL Field */}
            <form.Field name="image">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="image">头像 URL</FieldLabel>
                  <Input
                    id="image"
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FieldDescription>
                    输入头像图片的 URL 地址
                  </FieldDescription>
                  {field.state.meta.errors.length > 0 && (
                    <FieldError errors={field.state.meta.errors} />
                  )}
                </Field>
              )}
            </form.Field>

            {/* Email Field (Read-only) */}
            <Field>
              <FieldLabel htmlFor="email">邮箱</FieldLabel>
              <Input
                id="email"
                type="email"
                value={session.user.email}
                disabled
                className="bg-muted/50"
              />
              <FieldDescription>
                邮箱地址不可修改
              </FieldDescription>
            </Field>

            {/* Submit Button */}
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