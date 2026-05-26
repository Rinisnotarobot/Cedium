<!-- Generated: 2026-05-26 | Files scanned: 251 | Token estimate: ~600 -->

# System Architecture

## Overview

Cedium - TanStack Start 全栈创作/写作平台

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                        │
│  React 19 + TanStack Router + TanStack Query + Tailwind v4  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   TanStack Start (SSR)                       │
│  File-based routing + Server handlers + SSR Query           │
└─────────────────────────────────────────────────────────────┘
                              │
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   PostgreSQL    │  │   Better Auth   │  │  Cloudflare R2  │
│   (Prisma)      │  │   (Email/OTP)   │  │  (Images)       │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │     Resend      │
                    │   (Email API)   │
                    └─────────────────┘
```

## Key Entry Points

| File | Purpose |
|------|---------|
| `src/router.tsx` | Router 初始化，全局状态 |
| `src/routes/__root.tsx` | 根布局，QueryClient |
| `src/routes/_app/route.tsx` | 认证路由组保护 |
| `src/routes/_auth/route.tsx` | 未认证路由组 |
| `src/lib/auth.ts` | Better Auth 服务端配置 |
| `src/db.ts` | Prisma Client 初始化 |

## Routing Groups

- `_app/` - 需认证的页面 (beforeLoad 验证 session)
- `_auth/` - 认证页面 (已登录自动重定向)
- `api/` - API 路由 (server.handlers)

## State Management

| Concern | Solution |
|---------|----------|
| Server state | TanStack Query (hooks/queries/, hooks/mutations/) |
| Client state | Jotai (路由状态、编辑器状态) |
| Form state | TanStack Form + Zod |
| URL state | TanStack Router (search params, route params) |

## Path Aliases

```typescript
import { Button } from '#/components/ui/button'  // → src/
import { auth } from '@/lib/auth'                 // → src/
```