import { createFileRoute } from '@tanstack/react-router'
import { ResetPasswordForm } from '#/components/auth/reset-password-form'

export const Route = createFileRoute('/_auth/reset-password')({
  validateSearch: (search) => ({
    token: search.token as string | undefined,
    error: search.error as string | undefined,
  }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  return <ResetPasswordForm className="w-full max-w-sm" />
}