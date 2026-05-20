import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthLayout } from '#/components/layout'
import { authClient } from '#/lib/auth-client'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession()
    if (session) {
      throw redirect({ to: '/' })
    }
  },
  component: AuthLayout,
})