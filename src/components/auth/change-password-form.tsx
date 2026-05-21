"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { authClient } from "#/lib/auth-client";
import { newPasswordSchema } from "#/lib/validators/auth";
import { OTP_RESEND_COUNTDOWN, ERROR_MESSAGES } from "#/lib/constants";
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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "#/components/ui/input-otp";
import { Skeleton } from "#/components/ui/skeleton";
import { cn } from "#/lib/utils";
import { Loader2 } from "lucide-react";
import {
  useRequestPasswordResetOtp,
  useResetPasswordWithOtp,
} from "#/hooks/mutations";
import { toast } from "sonner";

export interface ChangePasswordFormProps extends React.ComponentProps<
  typeof Card
> {
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
  const [otp, setOtp] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
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
      if (otp.length !== 6) return;
      await resetPassword.mutateAsync({
        email,
        otp,
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

  // 倒计时逻辑
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      if (mountedRef.current) {
        setCountdown((prev) => prev - 1);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // 步骤切换时重置
  useEffect(() => {
    if (step === "verify") {
      setOtp("");
      setCountdown(0);
    }
  }, [step]);

  const handleSendOtp = () => {
    if (countdown > 0 || !email) return;
    requestOtp.mutate({ email }, {
      onSuccess: () => {
        if (mountedRef.current) {
          setCountdown(OTP_RESEND_COUNTDOWN);
        }
      },
    });
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6 || !email) return;

    setIsVerifyingOtp(true);
    try {
      const { error } = await authClient.emailOtp.checkVerificationOtp({
        email,
        type: "forget-password",
        otp,
      });

      if (!mountedRef.current) return;

      if (error) {
        toast.error(error.message ?? ERROR_MESSAGES.OTP_INVALID_OR_EXPIRED);
        return;
      }

      setStep("password");
    } catch {
      if (mountedRef.current) {
        toast.error(ERROR_MESSAGES.OTP_INVALID_OR_EXPIRED);
      }
    } finally {
      if (mountedRef.current) {
        setIsVerifyingOtp(false);
      }
    }
  };

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
      <Card className={cn("w-full border-0 shadow-none", className)} {...props}>
        <CardHeader>
          <CardTitle>修改密码</CardTitle>
          <CardDescription>
            验证码将发送至 <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-5">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => setOtp(value)}
              disabled={isVerifyingOtp}
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
              disabled={requestOtp.isPending || countdown > 0}
              className={cn(
                "w-full",
                "transition-[transform,opacity] duration-150 ease-out",
                "active:scale-[0.97]",
                countdown > 0 && "opacity-70"
              )}
            >
              {requestOtp.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : countdown > 0 ? (
                <span className="tabular-nums">{countdown}秒后可重发</span>
              ) : (
                "发送验证码"
              )}
            </Button>

            {otp.length === 6 && (
              <Button
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp}
                className={cn(
                  "w-full",
                  "transition-[transform,opacity] duration-150 ease-out",
                  "active:scale-[0.97]"
                )}
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    验证中...
                  </>
                ) : (
                  "验证并继续"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 密码步骤
  return (
    <Card className={cn("w-full border-0 shadow-none", className)} {...props}>
      <CardHeader>
        <CardTitle>设置新密码</CardTitle>
        <CardDescription>
          验证成功，请设置新密码
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