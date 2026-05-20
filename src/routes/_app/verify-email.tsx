import { createFileRoute } from '@tanstack/react-router'
import { VerifyEmailPage } from '#/components/auth'

export const Route = createFileRoute('/_app/verify-email')({
  validateSearch: (search) => ({
    email: search.email as string | undefined,
  }),
  component: VerifyEmailPage,
})