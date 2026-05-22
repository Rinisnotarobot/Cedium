import { createMiddleware } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { auth } from '#/lib/auth'

/**
 * 认证中间件
 *
 * 验证用户 session，将 session 注入到 context 供下游使用。
 * 这是一个请求级中间件（request middleware），可以应用于：
 * - Server Function (通过 .middleware() 链式调用)
 * - Server Routes (通过 server.middleware 配置)
 *
 * 重要：路由级 beforeLoad 不保护 Server Function 的直接 RPC 调用，
 * 必须在每个需要认证的 Server Function 上添加此中间件。
 */
export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session) {
      throw redirect({ to: '/login' })
    }

    return next({ context: { session } })
  },
)

