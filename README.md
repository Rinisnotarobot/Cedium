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

创建 `.env.local` 文件：

```bash
# 数据库连接
DATABASE_URL="postgresql://user:password@localhost:5432/cedium"

# Better Auth 密钥（运行以下命令生成）
npx -y @better-auth/cli secret
```

### 初始化数据库

```bash
pnpm db:generate   # 生成 Prisma Client
pnpm db:push       # 推送数据库结构
pnpm db:seed       # 填充种子数据（可选）
```

### 启动开发服务器

```bash
pnpm dev
```

访问 http://localhost:3000

## 项目结构

```
src/
├── components/     # UI 组件
├── hooks/          # 自定义 Hooks
├── lib/            # 工具函数
├── routes/         # 路由文件（文件路由）
├── generated/      # Prisma 生成的类型
├── router.tsx      # 路由配置
├── styles.css      # 全局样式
└── db.ts           # 数据库连接
prisma/
├── schema.prisma   # 数据库模型
└── seed.ts         # 种子数据
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm preview` | 预览生产构建 |
| `pnpm test` | 运行测试 |
| `pnpm db:studio` | 打开 Prisma Studio |
| `pnpm db:migrate` | 创建迁移 |

## 路由系统

采用文件路由，在 `src/routes/` 目录下创建文件自动生成路由：

```
src/routes/
├── __root.tsx      # 根布局
├── index.tsx       # / 首页
├── about.tsx       # /about
├── posts/
│   ├── index.tsx   # /posts
│   └── $id.tsx     # /posts/:id
```

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