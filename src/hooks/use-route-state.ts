import { useLocation, useNavigate } from '@tanstack/react-router'
import { authClient } from '#/lib/auth-client'

export function useRouteState() {
  const location = useLocation()
  const navigate = useNavigate()
  const { data: session, isPending } = authClient.useSession()

  return {
    pathname: location.pathname,
    isWriteRoute: location.pathname === '/write',
    isArticlesRoute: location.pathname === '/articles',
    isProfileRoute: location.pathname === '/profile',
    session,
    isPending,
    navigate,
  }
}