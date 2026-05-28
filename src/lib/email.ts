import '@tanstack/react-start/server-only'

import { Resend } from 'resend'

let resend: Resend | null = null

function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null
  }

  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY)
  }

  return resend
}

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

const TEST_EMAIL = 'onboarding@resend.dev'
const TEST_FROM = 'Cedium <onboarding@resend.dev>'

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const client = getResendClient()

  if (!client) {
    console.warn('RESEND_API_KEY not configured, email not sent')
    return { success: false, error: 'Email service not configured' }
  }

  // 开发模式：使用测试发件人和收件人地址
  const isDev = process.env.NODE_ENV !== 'production'
  const recipient = isDev ? TEST_EMAIL : to
  const sender = isDev ? TEST_FROM : 'Cedium <noreply@cedium.inari-jinja.org>'

  if (isDev && to !== TEST_EMAIL) {
    console.log(`[DEV] Email to "${to}" redirected to "${TEST_EMAIL}"`)
  }

  try {
    const { data, error } = await client.emails.send({
      from: sender,
      to: recipient,
      subject,
      html,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    console.log(`[DEV] Email sent successfully, check https://resend.com/inbox for OTP`)
    return { success: true, id: data?.id }
  } catch (err) {
    console.error('Email send error:', err)
    return { success: false, error: 'Failed to send email' }
  }
}

export function generateVerificationCodeEmailHtml(
  userName: string,
  code: string,
  purpose: string = '验证您的邮箱'
) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 8px; text-align: center; }
    .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0070f3; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Cedium</h1>
    </div>
    <div class="content">
      <h2>${purpose}</h2>
      <p>您好，${userName}！</p>
      <p>您的验证码是：</p>
      <div class="code">${code}</div>
      <p style="margin-top: 20px; font-size: 14px; color: #666;">
        此验证码将在 10 分钟后失效。如果您没有请求此操作，请忽略此邮件。
      </p>
    </div>
    <div class="footer">
      <p>Cedium - 您的创作空间</p>
    </div>
  </div>
</body>
</html>
  `
}

export function generateResetPasswordEmailHtml(
  userName: string,
  resetUrl: string
) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 8px; }
    .button { display: inline-block; background: #0070f3; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
    .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Cedium</h1>
    </div>
    <div class="content">
      <h2>重置您的密码</h2>
      <p>您好，${userName}！</p>
      <p>我们收到了重置您密码的请求。请点击下方按钮设置新密码：</p>
      <a href="${resetUrl}" class="button">重置密码</a>
      <p style="margin-top: 20px; font-size: 14px; color: #666;">
        此链接将在 1 小时后失效。如果您没有请求重置密码，请忽略此邮件。
      </p>
    </div>
    <div class="footer">
      <p>Cedium - 您的创作空间</p>
    </div>
  </div>
</body>
</html>
  `
}