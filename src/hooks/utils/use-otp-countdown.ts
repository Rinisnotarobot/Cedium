import { useState, useEffect, useCallback } from "react";

interface UseOtpCountdownOptions {
  /** 初始倒计时秒数 */
  initialCountdown?: number;
  /** 对话框关闭时重置 */
  resetOnClose?: boolean;
  /** 监听的对话框状态 */
  dialogOpen?: boolean;
}

interface UseOtpCountdownReturn {
  /** 当前倒计时值 */
  countdown: number;
  /** 开始倒计时 */
  startCountdown: (seconds?: number) => void;
  /** 重置倒计时 */
  resetCountdown: () => void;
  /** 是否可以重发 */
  canResend: boolean;
}

export function useOtpCountdown(options: UseOtpCountdownOptions = {}): UseOtpCountdownReturn {
  const { initialCountdown = 60, resetOnClose = false, dialogOpen } = options;

  const [countdown, setCountdown] = useState(0);

  // 倒计时逻辑
  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  // 对话框关闭时重置
  useEffect(() => {
    if (resetOnClose && dialogOpen === false) {
      setCountdown(0);
    }
  }, [resetOnClose, dialogOpen]);

  const startCountdown = useCallback((seconds?: number) => {
    setCountdown(seconds ?? initialCountdown);
  }, [initialCountdown]);

  const resetCountdown = useCallback(() => {
    setCountdown(0);
  }, []);

  const canResend = countdown <= 0;

  return {
    countdown,
    startCountdown,
    resetCountdown,
    canResend,
  };
}