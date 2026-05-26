# Server Functions 规范文档

**最后更新:** 2026-05-22  
**版本:** 1.0.0

本文档定义项目中 Server Functions 的架构模式、使用规范和最佳实践。Server Functions 是 TanStack Start 的核心概念，用于在服务器端执行数据操作。

---

## 1. 架构概述

### 1.1 目录结构

```
src/
├── data/                    # Server Functions 定义
│   ├── articles.ts          # 文章相关 Server Functions
│   ├── user.ts              # 用户相关 Server Functions
│   └── index.ts             # 统一导出
│
├── middlewares/             # 中间件定义
│   └ auth.ts                # 认证中间件
│
├── lib/validators/          # Zod schemas
│   ├── article.ts           # 文章验证
│   ├── auth.ts              # 认证验证
│   └ profile.ts             # 用户资料验证
│
├── db.ts                    # Prisma Client 实例
└── lib/auth.ts              # Better Auth 配置
```

**设计原则:**
- `data/` 目录按业务领域分组 Server Functions
- `validators/` 与 Server Functions 分离，便于复用和类型推断
- `middlewares/` 集中管理认证逻辑

### 1.2 Server Functions 分类

| 类型 | HTTP 方法 | 认证要求 | 缓存行为 | 用途 |
|------|-----------|----------|----------|------|
| 写操作 | POST | 必须 (`authMiddleware`) | 不可缓存 | 创建、更新、删除 |
| 读操作-私有 | GET | 必须 (`authMiddleware`) | 可缓存 | 用户私有数据 |
| 读操作-公开 | GET | 可选 | 可缓存 | 公开数据 |

### 1.3 Server Functions 清单

#### 文章 Server Functions (`src/data/articles.ts`)

| 名称 | 方法 | 认证 | 功能 |
|------|------|------|------|
| `createArticleFn` | POST | 必须 | 创建草稿文章 |
| `updateArticleFn` | POST | 必须 | 更新文章内容 |
| `publishArticleFn` | POST | 必须 | 发布草稿文章 |
| `archiveArticleFn` | POST | 必须 | 归档已发布文章 |
| `deleteArticleFn` | POST | 必须 | 删除文章 |
| `getArticleByIdFn` | GET | 混合 | 获取文章详情（公开无需认证） |
| `getMyArticlesFn` | GET | 必须 | 获取用户文章列表 |
| `getPublishedArticlesFn` | GET | 无需 | 获取公开文章列表 |
| `getArticlesByAuthorFn` | GET | 无需 | 获取作者文章列表 |

#### 用户 Server Functions (`src/data/user.ts`)

| 名称 | 方法 | 认证 | 功能 |
|------|------|------|------|
| `uploadAvatarFn` | POST | 必须 | 上传用户头像 |
| `updateProfileFn` | POST | 必须 | 更新用户资料 |

---

## 2. 写操作模式 (POST)

### 2.1 标准写操作结构

```typescript
// ✅ 标准模式: POST + authMiddleware + inputValidator + handler
import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from '#/middlewares/auth'
import { createArticleSchema } from '#/lib/validators/article'

export const createArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])           // 1. 认证中间件
  .inputValidator(createArticleSchema)    // 2. 输入验证
  .handler(async ({ data, context }) => { // 3. 业务处理
    const userId = context.session.user.id
    // ... 业务逻辑
    return result
  })
```

**链式调用顺序:**
1. `createServerFn({ method: 'POST' })` - 定义 HTTP 方法
2. `.middleware([authMiddleware])` - 认证保护
3. `.inputValidator(schema)` - 输入验证
4. `.handler(...)` - 业务处理

**重要:** 中间件必须在 `inputValidator` 之前，否则无法注入 `context`。

### 2.2 Context 类型推断

中间件注入的 `context` 自动获得 TypeScript 类型:

```typescript
// middlewares/auth.ts 注入的 context
export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers })
    if (!session) throw redirect({ to: '/login' })
    return next({ context: { session } })
  },
)

// handler 中使用
.handler(async ({ data, context }) => {
  const userId = context.session.user.id  // 类型安全!
})
```

### 2.3 所有权验证模式

写操作必须验证资源所有权:

```typescript
export const updateArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(updateArticleSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    // 1. 查询资源并验证所有权
    const existing = await prisma.article.findUnique({
      where: { id: data.id },
      select: { authorId: true },
    })

    // 2. 资源不存在检查
    if (!existing) {
      throw new Error('文章不存在')
    }

    // 3. 所有权验证
    if (existing.authorId !== userId) {
      throw new Error('无权限编辑此文章')
    }

    // 4. 执行操作
    const article = await prisma.article.update({
      where: { id: data.id },
      data: { title: data.title, ... },
    })

    return article
  })
```

### 2.4 状态验证模式

某些操作需要验证资源状态:

```typescript
export const publishArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(publishArticleSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id
    const existing = await prisma.article.findUnique({
      where: { id: data.id },
      select: { authorId: true, status: true },
    })

    if (!existing) throw new Error('文章不存在')
    if (existing.authorId !== userId) throw new Error('无权限发布此文章')
    
    // 状态验证: 只能发布草稿状态的文章
    if (existing.status !== ArticleStatus.DRAFT) {
      throw new Error('只能发布草稿状态的文章')
    }

    // 执行发布
    await prisma.article.update({
      where: { id: data.id },
      data: { status: ArticleStatus.PUBLISHED, publishedAt: new Date() },
    })
  })
```

### 2.5 事务处理模式

涉及多表更新的操作使用 Prisma 事务:

```typescript
export const createArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createArticleSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    // 1. 前置检查
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { draftCount: true },
    })

    if (user?.draftCount >= 10) {
      throw new Error('草稿数量已达上限（10篇）')
    }

    // 2. 事务执行
    const [article] = await prisma.$transaction([
      prisma.article.create({
        data: {
          title: data.title,
          content: data.content,
          authorId: userId,
          status: ArticleStatus.DRAFT,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { draftCount: { increment: 1 } },
      }),
    ])

    return article
  })
```

---

## 3. 读操作模式 (GET)

### 3.1 公开读操作

无需认证的读操作:

```typescript
export const getPublishedArticlesFn = createServerFn({ method: 'GET' })
  .inputValidator(getPublishedArticlesSchema)  // 仅验证，无中间件
  .handler(async ({ data }) => {
    const skip = (data.page - 1) * data.limit

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: data.limit,
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
      }),
      prisma.article.count({ where: { status: ArticleStatus.PUBLISHED } }),
    ])

    return {
      articles,
      meta: { total, page: data.page, limit: data.limit },
    }
  })
```

### 3.2 私有读操作

需要认证的读操作:

```typescript
export const getMyArticlesFn = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])  // 认证保护
  .inputValidator(getMyArticlesSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id
    const skip = (data.page - 1) * data.limit

    const whereClause = data.status
      ? { authorId: userId, status: data.status }
      : { authorId: userId }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: whereClause,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: data.limit,
      }),
      prisma.article.count({ where: whereClause }),
    ])

    return { articles, meta: { total, page: data.page, limit: data.limit } }
  })
```

### 3.3 混合认证读操作

根据资源状态决定是否需要认证:

```typescript
import { getRequest } from '@tanstack/react-start/server'
import { auth } from '#/lib/auth'

export const getArticleByIdFn = createServerFn({ method: 'GET' })
  .inputValidator(getArticleByIdSchema)
  .handler(async ({ data }) => {
    // 可选的 session 检查（不通过中间件强制）
    const request = getRequest()
    const session = await auth.api.getSession({ headers: request.headers })

    const article = await prisma.article.findFirst({
      where: { OR: [{ slug: data.id }, { id: data.id }] },
      include: { author: { select: { id: true, name: true, image: true } } },
    })

    if (!article) throw new Error('文章不存在')

    // 公开文章无需认证
    if (article.status === ArticleStatus.PUBLISHED) {
      return article
    }

    // 私有文章需要认证 + 所有权验证
    if (!session?.user) throw new Error('未登录')
    if (session.user.id !== article.authorId) throw new Error('无权限查看此文章')

    return article
  })
```

**关键点:**
- 使用 `getRequest()` 获取请求对象
- 使用 `auth.api.getSession()` 手动检查 session
- 根据资源状态分支处理

---

## 4. FormData 验证模式

### 4.1 文件上传验证

文件上传使用 FormData，需要自定义验证器:

```typescript
import { MAX_FILE_SIZE, validateFileType } from '#/lib/r2'

export const uploadAvatarFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator((input: unknown) => {
    // 1. 类型检查
    if (!(input instanceof FormData)) {
      throw new Error('Expected FormData')
    }

    // 2. 提取文件
    const file = input.get('file')
    if (!file || !(file instanceof File)) {
      throw new Error('请选择文件')
    }

    // 3. 文件大小检查
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('文件大小不能超过 10MB')
    }

    return { file }
  })
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id

    // 4. 文件签名验证（在 handler 中执行）
    const buffer = Buffer.from(await data.file.arrayBuffer())
    if (!validateFileType(buffer, data.file.type)) {
      throw new Error('仅支持 JPEG、PNG、WebP 格式')
    }

    // 5. 上传处理
    const { url } = await uploadAvatar(userId, buffer, data.file.type)
    
    // 6. 数据库更新
    await prisma.user.update({
      where: { id: userId },
      data: { image: url },
    })

    return { url }
  })
```

**验证分工:**
- `inputValidator`: 基础类型检查、大小限制
- `handler`: 文件签名验证（需要读取 buffer）

---

## 5. 认证中间件

### 5.1 中间件定义

```typescript
// src/middlewares/auth.ts
import { createMiddleware } from '@tanstack/react-start'
import { redirect } from '@tanstack/react-router'
import { auth } from '#/lib/auth'

export const authMiddleware = createMiddleware().server(
  async ({ next, request }) => {
    const session = await auth.api.getSession({ headers: request.headers })

    if (!session) {
      throw redirect({ to: '/login' })
    }

    return next({ context: { session } })
  },
)
```

### 5.2 中间件类型

| 类型 | 定义方式 | 参数 | 用途 |
|------|----------|------|------|
| 请求级 | `createMiddleware().server()` | `request`, `next` | Server Function 和 Server Routes |
| 函数级 | `createMiddleware({ type: 'function' })` | `data`, `next`, `.client()` | 仅 Server Function |

**当前项目使用请求级中间件。**

### 5.3 重要安全说明

**路由级 `beforeLoad` 不保护 Server Function 的直接 RPC 调用!**

```typescript
// ❌ 错误: 路由 beforeLoad 不阻止直接调用
export const Route = createFileRoute('/dashboard/')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session) throw redirect({ to: '/login' })
    return { session }
  },
})

// 客户端仍可直接调用: createArticleFn({ data: {...} })
// 无需经过路由!

// ✅ 正确: Server Function 必须添加中间件
export const createArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])  // 每个需要认证的 Server Function 都要加
  .handler(...)
```

---

## 6. 路由 Loader 集成

### 6.1 阻塞加载模式

详情页面使用阻塞加载，确保数据存在:

```typescript
// routes/_app/articles/$id.tsx
import { createFileRoute, notFound } from '@tanstack/react-router'
import { getArticleByIdFn } from '#/data'

export const Route = createFileRoute('/_app/articles/$id')({
  loader: async ({ params }) => {
    try {
      const article = await getArticleByIdFn({ data: { id: params.id } })
      return { article }
    } catch (error) {
      if (error instanceof Error && error.message === '文章不存在') {
        throw notFound()
      }
      throw error
    }
  },
  component: ArticleDetailPage,
})

function ArticleDetailPage() {
  const { article } = Route.useLoaderData()  // 直接是数据，非 Promise
  return <ArticleView article={article} />
}
```

**适用场景:**
- 详情页面
- 需要验证数据存在性
- SEO 关键页面

### 6.2 Promise + Suspense 模式

列表页面使用 Promise，避免阻塞导航:

```typescript
// routes/_app/articles/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { Suspense } from 'react'
import { getPublishedArticlesFn } from '#/data'

export const Route = createFileRoute('/_app/articles/')({
  loader: () => ({
    articlesPromise: getPublishedArticlesFn({ data: { page: 1, limit: 10 } }),
  }),
  component: ArticlesPage,
})

function ArticlesPage() {
  const { articlesPromise } = Route.useLoaderData()

  return (
    <Suspense fallback={<ArticlesGridSkeleton />}>
      <ArticlesList promise={articlesPromise} />
    </Suspense>
  )
}

// 使用 React 19 的 use() hook 解包 Promise
import { use } from 'react'

function ArticlesList({ promise }: { promise: ReturnType<typeof getPublishedArticlesFn> }) {
  const { articles, meta } = use(promise)
  return (
    <div className="grid gap-6">
      {articles.map(article => <ArticleCard key={article.id} article={article} />)}
    </div>
  )
}
```

**适用场景:**
- 列表页面
- 可延迟加载的数据
- 快速导航体验

---

## 7. 客户端使用模式

### 7.1 使用 TanStack Query

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMyArticlesFn, createArticleFn } from '#/data'

// 查询
function useMyArticles(status?: ArticleStatus) {
  return useQuery({
    queryKey: ['my-articles', status],
    queryFn: () => getMyArticlesFn({ data: { page: 1, limit: 20, status } }),
  })
}

// Mutation
function useCreateArticle() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateArticleInput) => createArticleFn({ data }),
    onSuccess: () => {
      // 刷新相关查询
      queryClient.invalidateQueries({ queryKey: ['my-articles'] })
    },
  })
}

// 组件中使用
function CreateArticleForm() {
  const createArticle = useCreateArticle()
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (data: CreateArticleInput) => {
    startTransition(async () => {
      await createArticle.mutateAsync(data)
      toast.success('文章创建成功!')
    })
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)}>
      <Button type="submit" disabled={isPending}>
        {isPending ? '创建中...' : '创建文章'}
      </Button>
    </form>
  )
}
```

### 7.2 直接调用（配合 useTransition）

```typescript
import { useTransition } from 'react'
import { createArticleFn } from '#/data'

function CreateArticlePage() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleCreate = async (data: CreateArticleInput) => {
    startTransition(async () => {
      try {
        await createArticleFn({ data })
        toast.success('文章创建成功!')
        router.invalidate()  // 刷新 loader 数据
      } catch (error) {
        toast.error(error instanceof Error ? error.message : '创建失败')
      }
    })
  }

  return (
    <Button onClick={() => handleCreate(formData)} disabled={isPending}>
      {isPending ? '创建中...' : '创建文章'}
    </Button>
  )
}
```

---

## 8. 错误处理模式

### 8.1 Server Function 错误

```typescript
// Server Function 中的错误
.handler(async ({ data, context }) => {
  // 业务错误
  if (!existing) {
    throw new Error('文章不存在')  // 中文错误消息
  }

  // 权限错误
  if (existing.authorId !== userId) {
    throw new Error('无权限编辑此文章')
  }

  // 状态错误
  if (existing.status !== ArticleStatus.DRAFT) {
    throw new Error('只能发布草稿状态的文章')
  }
})
```

### 8.2 客户端错误处理

```typescript
// 使用 try-catch
const handlePublish = async (id: string) => {
  try {
    await publishArticleFn({ data: { id } })
    toast.success('文章发布成功!')
  } catch (error) {
    // 统一错误处理
    const message = error instanceof Error ? error.message : '操作失败'
    toast.error(message)
  }
}

// 使用 mutation 的 onError
const publishArticle = useMutation({
  mutationFn: (id: string) => publishArticleFn({ data: { id } }),
  onSuccess: () => {
    toast.success('文章发布成功!')
    queryClient.invalidateQueries({ queryKey: ['my-articles'] })
  },
  onError: (error) => {
    toast.error(error.message)
  },
})
```

---

## 9. 响应格式规范

### 9.1 单资源响应

```typescript
// 返回完整资源
return {
  id: string,
  title: string,
  content: string,
  status: ArticleStatus,
  createdAt: Date,
  updatedAt: Date,
  author: {
    id: string,
    name: string,
    image: string | null,
  },
}
```

### 9.2 列表响应（带分页）

```typescript
return {
  articles: Article[],       // 数据列表
  meta: {
    total: number,           // 总数
    page: number,            // 当前页
    limit: number,           // 每页数量
  },
}

// 可选添加 author 信息
return {
  articles: Article[],
  meta: PaginationMeta,
  author: {                  // 作者信息（用于作者页面）
    id: string,
    name: string,
    image: string | null,
    bio: string | null,
  },
}
```

---

## 10. 常见错误模式

### 10.1 中间件顺序错误

```typescript
// ❌ 错误: middleware 在 inputValidator 之后
export const fn = createServerFn({ method: 'POST' })
  .inputValidator(schema)
  .middleware([authMiddleware])  // context 未注入!
  .handler(...)

// ✅ 正确: middleware 在 inputValidator 之前
export const fn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(schema)
  .handler(...)
```

### 10.2 缺少认证保护

```typescript
// ❌ 错误: 私有操作未添加中间件
export const createArticleFn = createServerFn({ method: 'POST' })
  .inputValidator(createArticleSchema)
  .handler(async ({ data }) => {
    // 任何人都能调用!
    return await prisma.article.create({ data })
  })

// ✅ 正确: 添加认证中间件
export const createArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createArticleSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id
    return await prisma.article.create({
      data: { ...data, authorId: userId }
    })
  })
```

### 10.3 缺少所有权验证

```typescript
// ❌ 错误: 未验证所有权
export const deleteArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteArticleSchema)
  .handler(async ({ data }) => {
    await prisma.article.delete({ where: { id: data.id } })
    // 任何登录用户都能删除任何文章!
  })

// ✅ 正确: 验证所有权
export const deleteArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteArticleSchema)
  .handler(async ({ data, context }) => {
    const userId = context.session.user.id
    const existing = await prisma.article.findUnique({
      where: { id: data.id },
      select: { authorId: true },
    })

    if (!existing) throw new Error('文章不存在')
    if (existing.authorId !== userId) throw new Error('无权限删除此文章')

    await prisma.article.delete({ where: { id: data.id } })
  })
```

### 10.4 忽略状态验证

```typescript
// ❌ 错误: 未验证状态
export const publishArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(publishArticleSchema)
  .handler(async ({ data }) => {
    await prisma.article.update({
      where: { id: data.id },
      data: { status: ArticleStatus.PUBLISHED },
    })
    // 可能重复发布已发布的文章!
  })

// ✅ 正确: 验证状态
export const publishArticleFn = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(publishArticleSchema)
  .handler(async ({ data, context }) => {
    const existing = await prisma.article.findUnique({
      where: { id: data.id },
      select: { status: true, authorId: true },
    })

    if (existing?.status !== ArticleStatus.DRAFT) {
      throw new Error('只能发布草稿状态的文章')
    }
    // ...
  })
```

---

## 11. 最佳实践清单

### Server Function 定义

- [ ] 写操作使用 `method: 'POST'`
- [ ] 读操作使用 `method: 'GET'`
- [ ] 需认证的操作添加 `.middleware([authMiddleware])`
- [ ] 中间件在 `inputValidator` 之前
- [ ] Zod schema 定义在 `lib/validators/` 目录
- [ ] 导出类型别名 `export type XxxInput = z.infer<typeof schema>`
- [ ] 错误消息使用中文（面向用户）

### 写操作 Handler

- [ ] 验证资源所有权
- [ ] 验证资源状态（如需要）
- [ ] 使用事务处理多表更新
- [ ] 返回更新后的完整资源
- [ ] 前置检查放在事务之前

### 读操作 Handler

- [ ] 使用 `Promise.all` 并行查询数据和计数
- [ ] 返回 `{ data, meta }` 格式的列表响应
- [ ] 包含必要的关联数据（author 等）
- [ ] 公开接口不加中间件，私有接口加中间件
- [ ] 混合认证接口使用 `getRequest()` + 手动 session 检查

### FormData 验证

- [ ] 类型检查 `instanceof FormData`
- [ ] 文件大小检查在 `inputValidator`
- [ ] 文件签名验证在 `handler`
- [ ] 返回提取后的结构化数据

### 路由 Loader

- [ ] 详情页使用阻塞加载 + `notFound()` 处理
- [ ] 列表页使用 Promise + Suspense
- [ ] 使用 `router.invalidate()` 刷新数据

### 客户端调用

- [ ] 使用 `useTransition` 包装异步操作
- [ ] 使用 `router.invalidate()` 或 `queryClient.invalidateQueries()`
- [ ] 统一错误处理，显示用户友好消息

---

## 12. 扩展指南

### 12.1 添加新 Server Function

1. 在 `lib/validators/` 定义 Zod schema
2. 在 `data/` 目录添加 Server Function
3. 在 `data/index.ts` 导出
4. 根据认证需求决定是否添加中间件

### 12.2 添加新业务领域

1. 创建 `lib/validators/{domain}.ts`
2. 创建 `data/{domain}.ts`
3. 在 `data/index.ts` 添加导出
4. 需要新中间件时在 `middlewares/` 定义

---

## 13. 参考资料

- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - TanStack Start 详细最佳实践
- [Middleware.md](./Middleware.md) - 中间件详细说明
- [TanStack Start Server Functions](https://tanstack.com/start/latest/docs/framework/react/server-functions)
- [Zod v4 Documentation](https://zod.dev/v4)