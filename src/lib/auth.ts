import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { emailOTP } from 'better-auth/plugins'
import { prisma } from '#/db'
import { sendEmail, generateResetPasswordEmailHtml, generateVerificationCodeEmailHtml } from '#/lib/email'

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: '重置您的密码',
        html: generateResetPasswordEmailHtml(user.name ?? user.email, url),
      })
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour
  },
  plugins: [
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === 'email-verification') {
          const result = await sendEmail({
            to: email,
            subject: '验证您的邮箱',
            html: generateVerificationCodeEmailHtml(email, otp),
          })
          if (!result.success) {
            throw new Error(result.error || '邮件发送失败')
          }
        }
      },
      otpLength: 6,
      expiresIn: 600, // 10 minutes
    }),
    tanstackStartCookies(),
  ],
})