// OTP 相关常量
export const OTP_RESEND_COUNTDOWN = 60 // 重发验证码倒计时（秒）

// 错误消息
export const ERROR_MESSAGES = {
  OTP_SEND_FAILED: '发送验证码失败，请稍后重试',
  OTP_INVALID_OR_EXPIRED: '验证码错误或已过期',
  SESSION_REQUIRED: '请先登录后再操作',
  PASSWORD_RESET_FAILED: '密码重置失败，请稍后重试',
}