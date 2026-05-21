import { redirect } from "@tanstack/react-router";

interface SessionUser {
  name: string | null;
  email: string;
  image?: string | null;
}

interface AuthContext {
  session: { user: SessionUser } | null;
}

export function requireAuth(context: AuthContext, redirectTo: string) {
  if (!context.session) {
    throw redirect({ to: "/login", search: { redirect: redirectTo } });
  }
}