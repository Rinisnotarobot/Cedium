"use client";

import { useForm } from "@tanstack/react-form";
import { authClient } from "#/lib/auth-client";
import { changePasswordSchema } from "#/lib/validators/auth";
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
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { cn } from "#/lib/utils";
import { toast } from "sonner";

export interface ChangePasswordFormProps extends React.ComponentProps<
  typeof Card
> {
  onSuccess?: () => void;
}

export function ChangePasswordForm({
  className,
  onSuccess,
  ...props
}: ChangePasswordFormProps) {
  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onChange: changePasswordSchema,
    },
    onSubmit: async ({ value }) => {
      const { data, error } = await authClient.changePassword({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
      });

      if (error) {
        toast.error(error.message ?? "密码修改失败，请检查当前密码是否正确");
        return;
      }

      if (data) {
        toast.success("密码已修改");
        form.reset();
        onSuccess?.();
      }
    },
  });

  return (
    <Card className={cn("w-full border-0 shadow-none", className)} {...props}>
      <CardHeader>
        <CardTitle>修改密码</CardTitle>
        <CardDescription>
          请输入当前密码验证身份，然后设置新密码
        </CardDescription>
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
            <form.Field name="currentPassword">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="currentPassword">当前密码</FieldLabel>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="输入当前密码"
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

            <form.Field name="newPassword">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="newPassword">新密码</FieldLabel>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="输入新密码"
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

            <form.Field name="confirmPassword">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor="confirmPassword">确认新密码</FieldLabel>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="再次输入新密码"
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
                    {isSubmitting ? "修改中..." : "修改密码"}
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
