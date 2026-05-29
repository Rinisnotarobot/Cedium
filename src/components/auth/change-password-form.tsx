"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { authClient } from "#/lib/auth-client";
import { newPasswordSchema } from "#/lib/validators/auth";
import { ERROR_MESSAGES } from "#/lib/constants";
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
import { Skeleton } from "#/components/ui/skeleton";
import { cn } from "#/lib/utils";
import { Loader2 } from "lucide-react";
import {
  useRequestPasswordResetOtp,
  useResetPasswordWithOtp,
} from "#/hooks/mutations";
import { OTPVerificationFlow } from "./otp-verification-flow";

export interface ChangePasswordFormProps extends React.ComponentProps<typeof Card> {
  onSuccess?: () => void;
}

type Step = "verify" | "password";

export function ChangePasswordForm({
  className,
  onSuccess,
  ...props
}: ChangePasswordFormProps) {
  const { data: session, isPending } = authClient.useSession();
  const email = session?.user?.email ?? "";

  const [step, setStep] = useState<Step>("verify");
  const mountedRef = useRef(true);

  const requestOtp = useRequestPasswordResetOtp();
  const resetPassword = useResetPasswordWithOtp({
    onSuccess: () => {
      form.reset();
      onSuccess?.();
    },
  });

  const form = useForm({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    validators: {
      onChange: newPasswordSchema,
    },
    onSubmit: async ({ value }) => {
      // OTP 已在验证步骤验证，这里直接使用
      await resetPassword.mutateAsync({
        email,
        otp: "verified", // OTP 已在前一步验证
        password: value.newPassword,
      });
    },
  });

  // 组件卸载时清理
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Session 加载中
  if (isPending) {
    return (
      <Card className={cn("w-full border-0 shadow-none", className)} {...props}>
        <CardHeader>
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-48 mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  // 未登录
  if (!session) {
    return (
      <Card className={cn("w-full border-0 shadow-none", className)} {...props}>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            {ERROR_MESSAGES.SESSION_REQUIRED}
          </p>
        </CardContent>
      </Card>
    );
  }

  // 验证步骤
  if (step === "verify") {
    return (
      <OTPVerificationFlow
        email={email}
        type="forget-password"
        onVerified={() => {
          setStep("password");
        }}
        requestOtpMutation={requestOtp}
        verifyOtpFn={async (email, otp) => {
          const result = await authClient.emailOtp.checkVerificationOtp({
            email,
            type: "forget-password",
            otp,
          });
          return { error: result.error };
        }}
      />
    );
  }

  // 密码步骤
  return (
    <Card className={cn("w-full border-0 shadow-none", className)} {...props}>
      <CardHeader>
        <CardTitle>设置新密码</CardTitle>
        <CardDescription>验证成功，请设置新密码</CardDescription>
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
                    {isSubmitting ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        修改中...
                      </>
                    ) : (
                      "修改密码"
                    )}
                  </Button>
                </Field>
              )}
            </form.Subscribe>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setStep("verify")}
              className="w-full"
            >
              返回上一步
            </Button>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}