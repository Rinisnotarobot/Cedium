# Plan: Profile Page Implementation

## Summary
构建用户个人资料页面,允许已登录用户查看和编辑自己的个人信息(姓名、头像、邮箱)。页面位于 `/_app/profile` 路由下,需要认证保护。

## User Story
作为已登录用户,我希望能够查看和编辑我的个人资料信息,以便更新我的显示姓名和头像。

## Problem → Solution
当前用户无法管理个人信息 → 用户可以在专门的 profile 页面查看和编辑姓名、头像等个人资料。

## Metadata
- **Complexity**: Medium
- **Source PRD**: N/A
- **PRD Phase**: N/A
- **Estimated Files**: 5

---

## UX Design

### Before
```
┌─────────────────────────────┐
│  用户只能通过 navbar 的      │
│  dropdown 查看基本信息       │
│  无法编辑任何个人资料        │
└─────────────────────────────┘
```

### After
```
┌─────────────────────────────┐
│  Profile Page               │
│  ┌─────────────────────┐    │
│  │ Avatar (可上传)      │    │
│  │ 姓名 (可编辑)        │    │
│  │ 邮箱 (显示)          │    │
│  │ [保存更改按钮]       │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| Sidebar Profile Link | 链接不存在 | 导航到 `/profile` 页面 | 添加路由 |
| User Info Display | 仅 navbar dropdown 显示 | 专门的 profile 页面展示 | 更丰富的展示 |
| Edit Capability | 无法编辑 | 可以编辑姓名和头像 | 使用 better-auth API |

---

## Mandatory Reading

Files that MUST be read before implementing:

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 (critical) | `src/routes/_app.tsx` | 1-22 | 受保护路由布局模式 |
| P0 (critical) | `src/components/signup-form.tsx` | 1-166 | 表单实现模式参考 |
| P1 (important) | `src/lib/auth-client.ts` | 1-4 | better-auth 客户端使用 |
| P1 (important) | `src/components/app-navbar.tsx` | 28-30, 61-86 | 会话获取和用户信息展示 |
| P2 (reference) | `src/lib/validators/auth.ts` | 1-24 | Zod 验证模式 |
| P2 (reference) | `src/generated/prisma/models/User.ts` | 633-641 | User 类型定义 |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| better-auth updateUser | [better-auth docs](https://github.com/better-auth/better-auth/blob/main/docs/content/docs/concepts/users-accounts.mdx) | `authClient.updateUser({ name, image })` 更新用户信息 |
| TanStack Form | [tanstack/form](https://tanstack.com/form/latest) | 使用 `useForm` hook 管理表单状态 |
| Zod validation | [zod docs](https://zod.dev) | 使用 `.refine()` 进行自定义验证 |

---

## Patterns to Mirror

Code patterns discovered in the codebase. Follow these exactly.

### NAMING_CONVENTION
// SOURCE: src/components/signup-form.tsx:22-23, src/routes/_app/index.tsx:5
```tsx
// 组件命名: PascalCase
export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {}
export function Home() {}

// 路由文件命名: 路径对应
// src/routes/_app/profile.tsx → /profile 路由
```

### FORM_PATTERN
// SOURCE: src/components/signup-form.tsx:25-50
```tsx
const form = useForm({
  defaultValues: {
    name: '',
    email: '',
  },
  validators: {
    onChange: profileSchema, // 使用 Zod schema
  },
  onSubmit: async ({ value }) => {
    const { data, error } = await authClient.updateUser({
      name: value.name,
      image: value.image,
    })

    if (error) {
      return // 错误处理
    }

    if (data) {
      // 成功后的操作
    }
  },
})
```

### AUTH_HOOK_USAGE
// SOURCE: src/components/app-navbar.tsx:28-30
```tsx
// 在组件中使用 hook 获取会话
const { data: session, isPending } = authClient.useSession()

// 条件渲染
{isPending ? (
  <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
) : session?.user ? (
  // 显示用户信息
) : (
  // 未登录状态
)}
```

### FIELD_COMPONENT_USAGE
// SOURCE: src/components/signup-form.tsx:66-84
```tsx
<form.Field name="name">
  {(field) => (
    <Field>
      <FieldLabel htmlFor="name">姓名</FieldLabel>
      <Input
        id="name"
        type="text"
        placeholder="张三"
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.errors.length > 0 && (
        <FieldError errors={field.state.meta.errors} />
      )}
    </Field>
  )}
</form.Field>
```

### ROUTE_DEFINITION
// SOURCE: src/routes/_app/index.tsx:1-5
```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({
  component: Home,
});

function Home() {
  return (
    // 组件内容
  );
}
```

### VALIDATION_SCHEMA
// SOURCE: src/lib/validators/auth.ts:1-21
```tsx
import { z } from 'zod'

export const profileSchema = z.object({
  name: z.string().min(2, '姓名至少需要2个字符'),
  image: z.string().url('请输入有效的图片URL').optional().or(z.literal('')),
})

export type ProfileInput = z.infer<typeof profileSchema>
```

### ERROR_DISPLAY
// SOURCE: src/components/ui/field.tsx:184-233
```tsx
function FieldError({
  errors,
}: {
  errors?: Array<{ message?: string } | undefined>
}) {
  if (!errors?.length) {
    return null
  }

  return (
    <div role="alert" className="text-sm font-normal text-destructive">
      {errors[0]?.message}
    </div>
  )
}
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `src/routes/_app/profile.tsx` | CREATE | 创建 profile 路由页面 |
| `src/components/profile-form.tsx` | CREATE | 创建个人资料编辑表单组件 |
| `src/lib/validators/profile.ts` | CREATE | 创建 profile 表单验证 schema |
| `src/routes/routeTree.gen.ts` | AUTO-GENERATE | TanStack Router 自动生成路由树 |

## NOT Building

- 头像上传功能(仅支持 URL 输入)
- 邮箱修改功能(better-auth 不支持客户端直接修改邮箱)
- 密码修改功能(需要单独的页面)
- 账户删除功能
- 两步验证设置

---

## Step-by-Step Tasks

### Task 1: Create Profile Validation Schema
- **ACTION**: 创建 Zod schema 用于验证 profile 表单输入
- **IMPLEMENT**:
  ```tsx
  import { z } from 'zod'

  export const profileSchema = z.object({
    name: z.string().min(2, '姓名至少需要2个字符').max(50, '姓名不能超过50个字符'),
    image: z.string().url('请输入有效的图片URL').optional().or(z.literal('')),
  })

  export type ProfileInput = z.infer<typeof profileSchema>
  ```
- **MIRROR**: VALIDATION_SCHEMA pattern from `src/lib/validators/auth.ts`
- **IMPORTS**: `z` from 'zod'
- **GOTCHA**: `image` 字段允许空字符串或可选的 URL,使用 `.or(z.literal(''))` 处理空值
- **VALIDATE**: TypeScript 类型检查通过,schema 能正确验证输入

### Task 2: Create Profile Form Component
- **ACTION**: 创建 profile 编辑表单组件,显示和编辑用户姓名、头像
- **IMPLEMENT**:
  - 使用 `authClient.useSession()` 获取当前用户信息作为初始值
  - 使用 `@tanstack/react-form` 的 `useForm` hook
  - 包含姓名字段(可编辑)、头像 URL 字段(可编辑)、邮箱字段(仅显示)
  - 使用 Field、FieldLabel、FieldError、Input、Button、Card 组件
  - 提交时调用 `authClient.updateUser({ name, image })`
  - 显示加载状态和成功/错误消息
- **MIRROR**: FORM_PATTERN, FIELD_COMPONENT_USAGE patterns from `signup-form.tsx`
- **IMPORTS**:
  ```tsx
  import { useForm } from '@tanstack/react-form'
  import { authClient } from '#/lib/auth-client'
  import { profileSchema } from '#/lib/validators/profile'
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
  import { Field, FieldLabel, FieldError, FieldGroup, FieldDescription } from '#/components/ui/field'
  import { Input } from '#/components/ui/input'
  import { Button } from '#/components/ui/button'
  import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
  ```
- **GOTCHA**:
  - 初始值从 session 获取,需要处理 `isPending` 状态
  - `image` 可能为 null,转换为空字符串
  - 邮箱字段使用 `disabled` 属性,不允许编辑
- **VALIDATE**: 表单能正确显示当前用户信息,提交后能更新用户数据

### Task 3: Create Profile Route Page
- **ACTION**: 创建 profile 路由页面,使用 ProfileForm 组件
- **IMPLEMENT**:
  ```tsx
  import { ProfileForm } from "#/components/profile-form";
  import { createFileRoute } from "@tanstack/react-router";

  export const Route = createFileRoute("/_app/profile")({
    component: ProfilePage,
  });

  function ProfilePage() {
    return (
      <div className="flex items-center justify-center p-8">
        <ProfileForm className="w-full max-w-md" />
      </div>
    );
  }
  ```
- **MIRROR**: ROUTE_DEFINITION pattern from `src/routes/_app/index.tsx`
- **IMPORTS**: `createFileRoute`, `ProfileForm` component
- **GOTCHA**: 路由路径为 `/_app/profile`,对应文件位置 `src/routes/_app/profile.tsx`
- **VALIDATE**: 路由正确注册,可通过 sidebar 的 Profile 链接访问

### Task 4: Add Success Feedback
- **ACTION**: 在 ProfileForm 中添加成功反馈,更新后显示成功消息
- **IMPLEMENT**:
  - 使用 `useState` 管理 `successMessage` 状态
  - 提交成功后设置成功消息
  - 使用 FieldDescription 组件显示绿色成功消息
  - 3秒后自动清除消息
- **MIRROR**: 无现成模式,参考一般 React 状态管理模式
- **IMPORTS**: `useState` from 'react'
- **GOTCHA**: 成功消息应该在 session 更新后显示,避免使用 `disableSignal`
- **VALIDATE**: 更新成功后能看到成功提示,3秒后自动消失

### Task 5: Handle Error States
- **ACTION**: 在 ProfileForm 中添加错误处理,提交失败时显示错误消息
- **IMPLEMENT**:
  - 使用 `useState` 管理 `errorMessage` 状态
  - 检查 `authClient.updateUser` 返回的 `error`
  - 根据 `error.status` 和 `error.message` 显示具体错误
  - 使用 FieldError 组件显示红色错误消息
- **MIRROR**: ERROR_DISPLAY pattern
- **IMPORTS**: 无新增
- **GOTCHA**: better-auth 错误对象结构为 `{ status, message, statusText }`
- **VALIDATE**: 网络错误或 API 错误能正确显示给用户

### Task 6: Generate Route Tree
- **ACTION**: 运行 TanStack Router 的路由生成命令
- **IMPLEMENT**: 运行 `pnpm tsc --noEmit` 或启动 dev server 触发路由树生成
- **MIRROR**: N/A (自动化流程)
- **IMPORTS**: N/A
- **GOTCHA**: 确保路由文件命名正确,否则路由树不会正确生成
- **VALIDATE**: `src/routeTree.gen.ts` 包含 `/profile` 路由

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| Profile schema validates valid name | `{ name: "John Doe" }` | Pass | No |
| Profile schema rejects short name | `{ name: "J" }` | Error: "姓名至少需要2个字符" | Yes |
| Profile schema accepts empty image | `{ name: "John", image: "" }` | Pass | Yes |
| Profile schema validates URL image | `{ name: "John", image: "https://..." }` | Pass | No |
| Profile schema rejects invalid URL | `{ name: "John", image: "not-url" }` | Error: "请输入有效的图片URL" | Yes |
| ProfileForm displays user data | session with name/email | Form shows initial values | No |
| ProfileForm updates user | submit with new name | `authClient.updateUser` called | No |

### Edge Cases Checklist
- [ ] Empty name input
- [ ] Very long name (>50 chars)
- [ ] Invalid image URL
- [ ] Network failure during update
- [ ] Session not loaded (isPending)
- [ ] User image is null initially
- [ ] Concurrent form submissions

---

## Validation Commands

### Static Analysis
```bash
# Run TypeScript type check
pnpm tsc --noEmit
```
EXPECT: Zero type errors

### Build Check
```bash
# Verify build
pnpm build
```
EXPECT: Build succeeds without errors

### Dev Server
```bash
# Start dev server to verify route generation
pnpm dev
```
EXPECT:
- Route tree generated correctly
- `/profile` route accessible
- Page renders without errors

### Manual Validation
- [ ] 点击 sidebar 的 Profile 链接,导航到 `/profile` 页面
- [ ] 页面显示当前用户的姓名、头像、邮箱
- [ ] 编辑姓名并保存,姓名成功更新
- [ ] 编辑头像 URL 并保存,头像成功更新
- [ ] 输入无效的姓名(少于2字符),显示错误提示
- [ ] 输入无效的 URL,显示错误提示
- [ ] 保存成功后显示成功消息
- [ ] 网络错误时显示错误消息
- [ ] navbar 和 sidebar 的头像同步更新

---

## Acceptance Criteria
- [ ] 所有 tasks 完成
- [ ] 所有 validation commands 通过
- [ ] 验证 schema 正确工作
- [ ] 表单能正确显示和编辑用户信息
- [ ] 路由正确注册并可访问
- [ ] 无 TypeScript 类型错误
- [ ] 无 lint 错误
- [ ] 成功和错误消息正确显示
- [ ] UI 与现有设计风格一致

## Completion Checklist
- [ ] 代码遵循发现的 patterns
- [ ] 错误处理符合代码库风格
- [ ] 使用 Field 组件系统
- [ ] 表单验证使用 Zod schema
- [ ] 使用 better-auth API 正确
- [ ] 路由命名和位置正确
- [ ] 无不必要的 scope additions
- [ ] Self-contained — 实现时不需要额外搜索代码库

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| better-auth updateUser API 行为与预期不同 | Low | Medium | 已查阅官方文档确认 API |
| 路由树生成失败 | Low | High | 确保 TanStack Router 配置正确 |
| Avatar URL 上传功能需求超出当前 scope | Medium | Low | 明确标注不在 scope 中 |
| 表单初始值加载时闪烁 | Medium | Low | 使用 isPending 状态显示 skeleton |

## Notes
- better-auth 不支持客户端直接修改邮箱,需要通过后端流程验证
- 头像上传功能需要文件存储服务,当前仅支持 URL 输入
- 密码修改应该有单独的页面,不在本次实现范围内
- User 模型包含更多字段(createdAt, updatedAt, emailVerified),但这些不应在 profile 页面编辑