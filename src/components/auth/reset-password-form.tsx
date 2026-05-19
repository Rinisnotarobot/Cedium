import { useForm } from "@tanstack/react-form";
import { authClient } from "#/lib/auth-client";
import { resetPasswordSchema } from "#/lib/validators/auth";
import { useNavigate, useSearch, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { cn } from "#/lib/utils";
import { Button } from "#/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "#/components/ui/field";
import { Input } from "#/components/ui/input";

export interface ResetPasswordFormProps extends React.ComponentProps<"div"> {}

export function ResetPasswordForm({
  className,
  ...props
}: ResetPasswordFormProps) {
  const navigate = useNavigate();
  const search = useSearch({ from: "/_auth/reset-password" });
  const [invalidToken, setInvalidToken] = useState(false);

  useEffect(() => {
    if (!search.token) {
      setInvalidToken(true);
    }
  }, [search.token]);

  const form = useForm({
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    validators: {
      onChange: resetPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      const { data, error } = await authClient.resetPassword({
        newPassword: value.password,
        token: search.token,
      });

      if (error) {
        if (
          error.message?.includes("invalid") ||
          error.message?.includes("expired")
        ) {
          setInvalidToken(true);
        }
        toast.error(error.message ?? "重置失败，请稍后重试");
        return;
      }

      if (data) {
        toast.success("密码已重置，请登录");
        navigate({ to: "/login" });
      }
    },
  });

  if (invalidToken) {
    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>链接无效或已过期</CardTitle>
            <CardDescription>该重置链接已失效，请重新申请</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <Button asChild>
                  <Link to="/forgot-password">重新申请重置链接</Link>
                </Button>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>重置密码</CardTitle>
          <CardDescription>输入您的新密码</CardDescription>
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
              <form.Field name="password">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="password">新密码</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldDescription>至少8个字符</FieldDescription>
                    {field.state.meta.errors.length > 0 && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )}
              </form.Field>

              <form.Field name="confirmPassword">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="confirm-password">确认密码</FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
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
                    <Button type="submit" disabled={!canSubmit || isSubmitting}>
                      {isSubmitting ? "重置中..." : "重置密码"}
                    </Button>
                    <FieldDescription className="text-center">
                      想起密码了？ <Link to="/login">返回登录</Link>
                    </FieldDescription>
                  </Field>
                )}
              </form.Subscribe>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
