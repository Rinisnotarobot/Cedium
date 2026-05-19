import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { prisma } from '#/db'
import { sendEmail, generateResetPasswordEmailHtml } from '#/lib/email'

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
        html: generateResetPasswordEmailHtml(user.name, url),
      })
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour
  },
  plugins: [tanstackStartCookies()],
})
