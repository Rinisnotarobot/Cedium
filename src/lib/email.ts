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

export async function sendEmail({ to, subject, html }: SendEmailOptions) {
  const client = getResendClient()

  if (!client) {
    console.warn('RESEND_API_KEY not configured, email not sent')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { data, error } = await client.emails.send({
      from: 'Cedium <noreply@cedium.app>',
      to,
      subject,
      html,
    })

    if (error) {
      console.error('Email send error:', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    console.error('Email send error:', err)
    return { success: false, error: 'Failed to send email' }
  }
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