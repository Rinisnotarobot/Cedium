import { redirect } from "@tanstack/react-router";

interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  image?: string | null;
}

interface Session {
  user: SessionUser;
}

interface AuthContext {
  session: Session | null;
}

/**
 * 在 beforeLoad 中验证认证
 * 如果没有 session，抛出 redirect 到登录页
 */
export function requireAuth(context: AuthContext, redirectTo: string) {
  if (!context.session) {
    throw redirect({ to: "/login", search: { redirect: redirectTo } });
  }
}

/**
 * 在 loader 中提取 session
 * 如果没有 session，抛出 redirect 到登录页
 */
export function assertSession(context: unknown): Session {
  if (!context || typeof context !== "object" || !("session" in context)) {
    throw redirect({ to: "/login" });
  }

  const { session } = context as AuthContext;

  if (!session) {
    throw redirect({ to: "/login" });
  }

  return session;
}