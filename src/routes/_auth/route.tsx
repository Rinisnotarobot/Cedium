import { createFileRoute, Outlet, Link, redirect } from '@tanstack/react-router'
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

function AuthLayout() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur px-4 md:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold text-foreground">
            Aedium
          </Link>
        </div>
      </nav>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
        <Outlet />
      </div>
    </div>
  )
}
