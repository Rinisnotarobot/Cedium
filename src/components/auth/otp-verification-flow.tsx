import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "#/components/ui/card";
import { Button } from "#/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "#/components/ui/input-otp";
import { cn } from "#/lib/utils";
import { useOtpCountdown } from "#/hooks";
import { OTP_RESEND_COUNTDOWN, ERROR_MESSAGES } from "#/lib/constants";

interface OTPVerificationFlowProps {
  email: string;
  type: "forget-password" | "email-verification";
  onVerified: () => void;
  /** 请求 OTP mutation */
  requestOtpMutation: {
    mutate: (params: { email: string }, options?: { onSuccess?: () => void }) => void;
    isPending: boolean;
  };
  /** 验证 OTP 函数 */
  verifyOtpFn: (email: string, otp: string) => Promise<{ error?: { message?: string } | null }>;
}

export function OTPVerificationFlow({
  email,
  type,
  onVerified,
  requestOtpMutation,
  verifyOtpFn,
}: OTPVerificationFlowProps) {
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { countdown, startCountdown, canResend } = useOtpCountdown({
    initialCountdown: OTP_RESEND_COUNTDOWN,
  });

  // 组件挂载时自动发送 OTP
  useEffect(() => {
    handleSendOtp();
  }, []);

  const handleSendOtp = () => {
    if (!canResend) return;
    setError(null);
    requestOtpMutation.mutate({ email }, {
      onSuccess: () => startCountdown(),
    });
  };

  const handleVerify = async () => {
    if (otp.length !== 6) return;

    setIsVerifying(true);
    setError(null);

    try {
      const result = await verifyOtpFn(email, otp);

      if (result.error) {
        setError(result.error.message ?? ERROR_MESSAGES.OTP_INVALID_OR_EXPIRED);
        return;
      }

      onVerified();
    } catch {
      setError(ERROR_MESSAGES.OTP_INVALID_OR_EXPIRED);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader>
        <CardTitle>
          {type === "forget-password" ? "修改密码" : "验证邮箱"}
        </CardTitle>
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

          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}

          <Button
            variant="outline"
            onClick={handleSendOtp}
            disabled={requestOtpMutation.isPending || !canResend}
            className={cn(
              "w-full",
              "transition-[transform,opacity] duration-150 ease-out",
              "active:scale-[0.97]",
              !canResend && "opacity-70",
            )}
          >
            {requestOtpMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : canResend ? (
              "发送验证码"
            ) : (
              <span className="tabular-nums">{countdown}秒后可重发</span>
            )}
          </Button>

          {otp.length === 6 && (
            <Button
              onClick={handleVerify}
              disabled={isVerifying}
              className={cn(
                "w-full",
                "transition-[transform,opacity] duration-150 ease-out",
                "active:scale-[0.97]",
              )}
            >
              {isVerifying ? (
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