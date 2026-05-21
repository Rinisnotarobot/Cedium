# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Cedium 是一个基于 TanStack Start 构建的全栈 Web 应用，定位为创作/写作平台。

## 技术栈

- **框架**: TanStack Start (React SSR)
- **路由**: TanStack Router (文件路由)
- **数据获取**: TanStack Query
- **表单**: TanStack Form + Zod
- **数据库**: Prisma + PostgreSQL
- **认证**: Better Auth (email/password + OTP)
- **样式**: Tailwind CSS v4 + Shadcn/UI (new-york style)
- **编辑器**: Tiptap (minimal-tiptap)
- **存储**: Cloudflare R2 (头像上传)
- **邮件**: Resend
- **包管理**: pnpm

## 常用命令

```bash
pnpm dev              # 开发服务器 (端口 3000)
pnpm build            # 生产构建
pnpm test             # Vitest 测试
pnpm db:generate      # 生成 Prisma Client
pnpm db:push          # 推送数据库结构 (开发)
pnpm db:migrate       # 创建迁移
pnpm db:studio        # Prisma Studio
pnpm db:seed          # 种子数据
```

## 路径别名

```typescript
// 两种别名都指向 src/
import { Button } from '#/components/ui/button'
import { auth } from '@/lib/auth'
```

## 路由架构

采用文件路由，路由布局通过路由组实现：

| 路由目录 | 用途 |
|---------|------|
| `_app/` | 需要认证的页面，包含 AppLayout |
| `_auth/` | 认证页面 (login/signup)，已登录用户自动重定向到首页 |
| `api/` | API 路由，使用 server.handlers |

### 路由保护模式

```tsx
// _app/route.tsx - 认证路由组
beforeLoad: async () => {
  const { data: session } = await authClient.getSession()
  return { session }
}

// _auth/route.tsx - 未认证路由组
beforeLoad: async () => {
  const { data: session } = await authClient.getSession()
  if (session) throw redirect({ to: '/' })
}
```

### API 路由模式

```tsx
// routes/api/auth/$.ts - Better Auth 处理所有 auth/* 路径
export const Route = createFileRoute('/api/auth/$')({
  server: {
    handlers: {
      GET: ({ request }) => auth.handler(request),
      POST: ({ request }) => auth.handler(request),
    },
  },
})
```

## 认证系统

Better Auth 配置在 `src/lib/auth.ts`:
- Email/password 登录
- Email OTP 验证
- 密码重置邮件

客户端使用 `src/lib/auth-client.ts` 导出的 `authClient`。

## 数据库

Prisma schema 在 `prisma/schema.prisma`，Client 生成到 `src/generated/prisma/`。

数据库连接使用 PrismaPg adapter (适合 SSR)：
```tsx
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
export const prisma = new PrismaClient({ adapter })
```

## UI 组件

Shadcn/UI 组件安装在 `src/components/ui/`：
```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add dialog
```

组件配置在 `components.json`，使用 new-york 风格和 lucide 图标。

## 环境变量

必需变量 (见 `.env.example`):
- `DATABASE_URL` - PostgreSQL 连接
- `BETTER_AUTH_SECRET` - Auth 密钥
- `BETTER_AUTH_URL` - Auth URL
- R2 相关变量 - 头像上传
- `RESEND_API_KEY` - 邮件服务

## 编辑器架构

Tiptap 富文本编辑器封装在 `src/components/ui/minimal-tiptap/`，用于写作功能 (`src/routes/_app/write.tsx`)。

## React Compiler

项目启用了 React Compiler (Babel preset)，无需手动 memo/useMemo。