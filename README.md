# Cedium

基于 TanStack Start 构建的全栈 Web 应用模板。

## 技术栈

| 类别 | 技术 |
|------|------|
| 框架 | TanStack Start (React) |
| 路由 | TanStack Router (文件路由) |
| 数据获取 | TanStack Query |
| 表格 | TanStack Table |
| 表单 | TanStack Form + Zod |
| 数据库 | Prisma + PostgreSQL |
| 认证 | Better Auth |
| 样式 | Tailwind CSS v4 |
| UI 组件 | Shadcn/UI |
| 测试 | Vitest |
| 包管理 | pnpm |

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 配置环境变量

创建 `.env.local` 文件，参考 `.env.example`：

<!-- AUTO-GENERATED -->
| 变量 | 必需 | 说明 | 示例 |
|------|------|------|------|
| `DATABASE_URL` | 是 | PostgreSQL 连接字符串 | `postgresql://user:password@localhost:5432/cedium` |
| `BETTER_AUTH_URL` | 是 | Auth 服务 URL | `http://localhost:3000` |
| `BETTER_AUTH_SECRET` | 是 | Auth 密钥（运行 `npx @better-auth/cli secret` 生成） | 32位随机字符串 |
| `R2_ENDPOINT` | 是 | Cloudflare R2 存储端点 | `https://<account_id>.r2.cloudflarestorage.com` |
| `R2_ACCESS_KEY_ID` | 是 | R2 访问密钥 ID | - |
| `R2_SECRET_ACCESS_KEY` | 是 | R2 访问密钥 | - |
| `R2_BUCKET_NAME` | 是 | R2 存储桶名称 | `cedium-avatars` |
| `R2_PUBLIC_URL` | 是 | R2 公开访问 URL | `https://<custom_domain>` |
| `RESEND_API_KEY` | 是 | Resend 邮件服务 API 密钥 | `re_xxx` |
<!-- AUTO-GENERATED -->

### 初始化数据库

```bash
pnpm db:generate   # 生成 Prisma Client
pnpm db:push       # 推送数据库结构（开发）
pnpm db:seed       # 填充种子数据（可选）
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 项目结构

<!-- AUTO-GENERATED -->
```
src/
├── components/     # UI 组件
│   ├── auth/       # 认证相关组件
│   ├── layout/     # 布局组件
│   ├── settings/   # 设置页面组件
│   └── ui/         # Shadcn/UI 基础组件
├── hooks/          # 自定义 Hooks
│   ├── mutations/  # TanStack Query mutations
│   └── utils/      # 工具 Hooks
├── lib/            # 工具函数和配置
│   ├── auth.ts     # Better Auth 配置
│   ├── email.ts    # Resend 邮件服务
│   └── validators/ # Zod 验证器
├── routes/         # 路由文件（文件路由）
│   ├── _app/       # 需认证的路由组
│   ├── _auth/      # 认证页面路由组
│   └── api/        # API 路由
├── generated/      # Prisma 生成的类型
├── types/          # TypeScript 类型定义
├── router.tsx      # 路由配置
├── db.ts           # 数据库连接
└── styles.css      # 全局样式
prisma/
├── schema.prisma   # 数据库模型
└── seed.ts         # 种子数据
```
<!-- AUTO-GENERATED -->

## 常用命令

<!-- AUTO-GENERATED -->
| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 (端口 3000) |
| `pnpm build` | 构建生产版本 |
| `pnpm preview` | 预览生产构建 |
| `pnpm test` | 运行 Vitest 测试 |
| `pnpm db:generate` | 生成 Prisma Client |
| `pnpm db:push` | 推送数据库结构（开发环境） |
| `pnpm db:migrate` | 创建迁移（生产环境） |
| `pnpm db:studio` | 打开 Prisma Studio |
| `pnpm db:seed` | 填充种子数据 |
<!-- AUTO-GENERATED -->

## 路由系统

采用文件路由，在 `src/routes/` 目录下创建文件自动生成路由：

<!-- AUTO-GENERATED -->
```
src/routes/
├── __root.tsx       # 根布局
├── index.tsx        # / 首页
├── about.tsx        # /about
├── _auth/           # 未认证路由组（登录页自动重定向）
│   ├── route.tsx    # 认证守卫
│   ├── login.tsx    # /login
│   ├── sign-up.tsx  # /sign-up
│   └── forgot-password.tsx
├── _app/            # 需认证路由组
│   ├── route.tsx    # 认证守卫 + AppLayout
│   ├── search.tsx   # /search
│   ├── write.tsx    # /write
│   ├── articles.tsx # /articles
│   └── me/          # 个人中心
│       ├── index.tsx      # /me
│       ├── favorites.tsx  # /me/favorites
│       ├── drafts.tsx     # /me/drafts
│       └── settings/      # /me/settings
│           ├── index.tsx       # 设置首页
│           ├── security.tsx    # 安全设置
│           ├── notifications.tsx
│           └── publishing.tsx
└── api/             # API 路由
    └── auth/$       # Better Auth 处理 /api/auth/*
```
<!-- AUTO-GENERATED -->

使用 `Link` 组件导航：

```tsx
import { Link } from "@tanstack/react-router";

<Link to="/posts/$id" params={{ id: "1" }}>文章详情</Link>
```

## 数据获取

### 使用 Loader（推荐）

在路由文件中定义 loader：

```tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts')({
  loader: async () => {
    const posts = await fetchPosts()
    return posts
  },
  component: PostsPage,
})

function PostsPage() {
  const posts = Route.useLoaderData()
  return <PostList posts={posts} />
}
```

### 使用 TanStack Query

```tsx
import { useQuery } from '@tanstack/react-query'

const { data, isLoading } = useQuery({
  queryKey: ['posts'],
  queryFn: fetchPosts,
})
```

## 认证系统

Better Auth 提供完整的认证解决方案：

1. 配置认证服务 `src/lib/auth.ts`
2. 创建认证客户端
3. 使用 React Hooks 管理登录状态

详细配置请参考 [Better Auth 文档](https://www.better-auth.com)。

## UI 组件

使用 Shadcn/UI 添加组件：

```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add card
pnpm dlx shadcn@latest add dialog
```

组件自动安装到 `src/components/ui/`。

## 测试

运行测试：

```bash
pnpm test
```

测试文件位于 `__tests__/` 目录或在源文件旁创建 `.test.ts` 文件。

## 部署

构建生产版本：

```bash
pnpm build
```

输出目录为 `dist/`。

## 学习资源

- [TanStack Start 文档](https://tanstack.com/start)
- [TanStack Router 文档](https://tanstack.com/router)
- [TanStack Query 文档](https://tanstack.com/query)
- [Prisma 文档](https://www.prisma.io/docs)
- [Better Auth 文档](https://www.better-auth.com)
- [Shadcn/UI 文档](https://ui.shadcn.com)

---

由 TanStack Start 模板创建。