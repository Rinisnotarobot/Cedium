# Plan: 登录和注册功能实现

## Summary
使用 better-auth、TanStack Form 和 Zod 在现有 TanStack Start 项目中实现完整的用户认证流程，包括登录和注册功能。

## User Story
作为一个用户，我想要能够注册新账户并登录到系统，以便访问需要认证的功能。

## Problem → Solution
当前状态：静态表单组件，无表单验证，无实际认证逻辑
目标状态：功能完整的认证系统，包含表单验证、错误处理、导航跳转

## Metadata
- **Complexity**: Medium
- **Source PRD**: N/A
- **PRD Phase**: standalone
- **Estimated Files**: 6

---

## UX Design

### Before
```
用户访问 /login 或 /sign-up
  → 看到静态表单
  → 无法提交
  → 无法验证输入
  → 无错误提示
```

### After
```
用户访问 /login
  → 输入邮箱和密码
  → Zod 实时验证（邮箱格式、密码长度）
  → 点击登录按钮
  → 显示加载状态
  → 成功：跳转到首页
  → 失败：显示错误信息

用户访问 /sign-up
  → 输入姓名、邮箱、密码、确认密码
  → Zod 实时验证
  → 点击注册按钮
  → 显示加载状态
  → 成功：跳转到首页
  → 失败：显示错误信息
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| 表单输入 | 无验证 | Zod 实时验证 | 邮箱格式、密码长度 |
| 提交按钮 | 静态 | 动态状态 | 加载中禁用、显示状态 |
| 错误处理 | 无 | 显示错误信息 | 字段级和表单级错误 |
| 成功跳转 | 无 | 路由跳转 | 使用 TanStack Router |
| 导航链接 | 静态链接 | 动态路由链接 | 登录↔注册互相跳转 |

---

## Mandatory Reading

Files that MUST be read before implementing:

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 (critical) | `src/lib/auth-client.ts` | 1-4 | better-auth 客户端实例 |
| P0 (critical) | `src/lib/auth.ts` | 1-14 | better-auth 服务端配置 |
| P1 (important) | `src/components/ui/field.tsx` | 79-247 | Field 组件 API |
| P1 (important) | `src/components/ui/button.tsx` | 1-65 | Button 组件和 variants |
| P2 (reference) | `src/routes/_auth/route.tsx` | 1-23 | 认证布局结构 |
| P2 (reference) | `src/router.tsx` | all | 路由配置 |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| TanStack Form + Zod | `/tanstack/form` | Zod schema 可直接用于 `validators.onChange` |
| better-auth signIn | `/llmstxt/better-auth_llms_txt` | `authClient.signIn.email()` 返回 `{ data, error }` |
| better-auth signUp | `/llmstxt/better-auth_llms_txt` | `authClient.signUp.email()` 支持 name, email, password |

---

## Patterns to Mirror

### NAMING_CONVENTION
// SOURCE: src/lib/auth-client.ts:1
```typescript
import { createAuthClient } from 'better-auth/react'
export const authClient = createAuthClient()
```

### COMPONENT_STRUCTURE
// SOURCE: src/components/login-form.tsx:18-67
```typescript
export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        // ... CardHeader, CardContent
      </Card>
    </div>
  )
}
```

### FIELD_PATTERN
// SOURCE: src/components/ui/field.tsx:79-93
```typescript
function Field({ className, orientation = "vertical", ...props }: React.ComponentProps<"div"> & VariantProps<typeof fieldVariants>) {
  return (
    <div role="group" data-slot="field" data-orientation={orientation} className={cn(fieldVariants({ orientation }), className)} {...props} />
  )
}
```

### IMPORT_PATTERN
// SOURCE: src/routes/_auth/login.tsx:1
```typescript
import { LoginForm } from "#/components/login-form";
import { createFileRoute } from "@tanstack/react-router";
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `src/lib/validators/auth.ts` | CREATE | Zod schemas for login and signup validation |
| `src/components/login-form.tsx` | UPDATE | 重写使用 TanStack Form |
| `src/components/signup-form.tsx` | UPDATE | 重写使用 TanStack Form |
| `src/routes/_auth/login.tsx` | UPDATE | 添加导航跳转链接 |
| `src/routes/_auth/sign-up.tsx` | UPDATE | 添加导航跳转链接 |
| `src/lib/utils.ts` | REFERENCE | 使用 cn() 函数合并样式 |

## NOT Building

- 密码重置功能
- OAuth 社交登录
- 邮箱验证流程
- 记住我功能
- 用户头像上传
- 路由守卫/认证状态检查

---

## Step-by-Step Tasks

### Task 1: 创建 Zod 验证 Schemas
- **ACTION**: 创建新文件 `src/lib/validators/auth.ts`
- **IMPLEMENT**:
  ```typescript
  import { z } from 'zod'

  export const loginSchema = z.object({
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(8, '密码至少需要8个字符'),
  })

  export const signupSchema = z.object({
    name: z.string().min(2, '姓名至少需要2个字符'),
    email: z.string().email('请输入有效的邮箱地址'),
    password: z.string().min(8, '密码至少需要8个字符').max(128, '密码不能超过128个字符'),
    confirmPassword: z.string().min(8, '密码至少需要8个字符'),
  }).refine((data) => data.password === data.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  })

  export type LoginInput = z.infer<typeof loginSchema>
  export type SignupInput = z.infer<typeof signupSchema>
  ```
- **MIRROR**: TypeScript types pattern from `src/generated/prisma/models/User.ts`
- **IMPORTS**: `import { z } from 'zod'`
- **GOTCHA**: Zod refine 用于密码确认验证，必须指定 path
- **VALIDATE**: 运行 `pnpm tsc --noEmit` 检查类型

### Task 2: 重写 LoginForm 使用 TanStack Form
- **ACTION**: 修改 `src/components/login-form.tsx`
- **IMPLEMENT**:
  ```typescript
  import { useForm } from '@tanstack/react-form'
  import { authClient } from '#/lib/auth-client'
  import { loginSchema, type LoginInput } from '#/lib/validators/auth'
  import { useNavigate } from '@tanstack/react-router'

  export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const navigate = useNavigate()
    
    const form = useForm<LoginInput>({
      defaultValues: {
        email: '',
        password: '',
      },
      validators: {
        onChange: loginSchema,
      },
      onSubmit: async ({ value }) => {
        const { data, error } = await authClient.signIn.email({
          email: value.email,
          password: value.password,
        })
        
        if (error) {
          // 设置表单错误
          return
        }
        
        if (data) {
          navigate({ to: '/' })
        }
      },
    })

    return (
      <div className={cn("flex flex-col gap-6", className)} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>登录账户</CardTitle>
            <CardDescription>输入您的邮箱和密码登录</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
              <FieldGroup>
                {/* Email Field */}
                <form.Field name="email">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="email">邮箱</FieldLabel>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
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
                
                {/* Password Field */}
                <form.Field name="password">
                  {(field) => (
                    <Field>
                      <FieldLabel htmlFor="password">密码</FieldLabel>
                      <Input
                        id="password"
                        type="password"
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
                
                {/* Submit Button */}
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                  {([canSubmit, isSubmitting]) => (
                    <Field>
                      <Button type="submit" disabled={!canSubmit || isSubmitting}>
                        {isSubmitting ? '登录中...' : '登录'}
                      </Button>
                      <FieldDescription className="text-center">
                        没有账户？ <Link to="/sign-up">注册</Link>
                      </FieldDescription>
                    </Field>
                  )}
                </form.Subscribe>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }
  ```
- **MIRROR**: Form structure from existing `src/components/login-form.tsx:18-67`
- **IMPORTS**: 
  - `import { useForm } from '@tanstack/react-form'`
  - `import { authClient } from '#/lib/auth-client'`
  - `import { loginSchema, type LoginInput } from '#/lib/validators/auth'`
  - `import { useNavigate, Link } from '@tanstack/react-router'`
  - Existing UI component imports
- **GOTCHA**: TanStack Form 的 children 是 render prop，使用 `field.state.value` 而不是 `field().state.value`（React 版本）
- **VALIDATE**: 
  - 运行 `pnpm tsc --noEmit` 检查类型
  - 测试表单验证：空输入、无效邮箱、短密码

### Task 3: 重写 SignupForm 使用 TanStack Form
- **ACTION**: 修改 `src/components/signup-form.tsx`
- **IMPLEMENT**:
  ```typescript
  import { useForm } from '@tanstack/react-form'
  import { authClient } from '#/lib/auth-client'
  import { signupSchema, type SignupInput } from '#/lib/validators/auth'
  import { useNavigate, Link } from '@tanstack/react-router'

  export function SignupForm({ className, ...props }: React.ComponentProps<typeof Card>) {
    const navigate = useNavigate()
    
    const form = useForm<SignupInput>({
      defaultValues: {
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      },
      validators: {
        onChange: signupSchema,
      },
      onSubmit: async ({ value }) => {
        const { data, error } = await authClient.signUp.email({
          name: value.name,
          email: value.email,
          password: value.password,
        })
        
        if (error) {
          return
        }
        
        if (data) {
          navigate({ to: '/' })
        }
      },
    })

    return (
      <Card className={className} {...props}>
        <CardHeader>
          <CardTitle>创建账户</CardTitle>
          <CardDescription>输入您的信息创建账户</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit() }}>
            <FieldGroup>
              {/* Name Field */}
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
              
              {/* Email Field */}
              <form.Field name="email">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="email">邮箱</FieldLabel>
                    <Input
                      id="email"
                      type="email"
                      placeholder="m@example.com"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldDescription>我们不会与他人分享您的邮箱</FieldDescription>
                    {field.state.meta.errors.length > 0 && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )}
              </form.Field>
              
              {/* Password Field */}
              <form.Field name="password">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="password">密码</FieldLabel>
                    <Input
                      id="password"
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    <FieldDescription>至少8个字符</FieldDescription>
                    {field.state.meta.errors.length > 0 && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                )}
              </form.Field>
              
              {/* Confirm Password Field */}
              <form.Field name="confirmPassword">
                {(field) => (
                  <Field>
                    <FieldLabel htmlFor="confirm-password">确认密码</FieldLabel>
                    <Input
                      id="confirm-password"
                      type="password"
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
              
              {/* Submit Button */}
              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Field>
                    <Button type="submit" disabled={!canSubmit || isSubmitting}>
                      {isSubmitting ? '创建中...' : '创建账户'}
                    </Button>
                    <FieldDescription className="text-center">
                      已有账户？ <Link to="/login">登录</Link>
                    </FieldDescription>
                  </Field>
                )}
              </form.Subscribe>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    )
  }
  ```
- **MIRROR**: Form structure from existing `src/components/signup-form.tsx:17-74`
- **IMPORTS**: Same pattern as LoginForm
- **GOTCHA**: confirmPassword 的错误信息来自 schema 的 refine，path 指向 confirmPassword
- **VALIDATE**: 
  - 运行 `pnpm tsc --noEmit`
  - 测试密码不一致时的错误显示

### Task 4: 更新登录页面路由组件
- **ACTION**: 修改 `src/routes/_auth/login.tsx`
- **IMPLEMENT**: 保持现有结构，LoginForm 已包含导航链接
- **MIRROR**: Pattern from `src/routes/_auth/login.tsx:1-11`
- **IMPORTS**: No changes needed
- **VALIDATE**: 页面渲染正常

### Task 5: 更新注册页面路由组件
- **ACTION**: 修改 `src/routes/_auth/sign-up.tsx`
- **IMPLEMENT**: 保持现有结构，SignupForm 已包含导航链接
- **MIRROR**: Pattern from `src/routes/_auth/sign-up.tsx:1-11`
- **IMPORTS**: No changes needed
- **VALIDATE**: 页面渲染正常

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| loginSchema 验证空邮箱 | `{ email: '', password: 'test1234' }` | 验证失败 | ✓ |
| loginSchema 验证无效邮箱 | `{ email: 'invalid', password: 'test1234' }` | 验证失败 | ✓ |
| loginSchema 验证短密码 | `{ email: 'test@test.com', password: 'short' }` | 验证失败 | ✓ |
| signupSchema 验证密码不一致 | `{ ..., password: 'pass1', confirmPassword: 'pass2' }` | 验证失败 | ✓ |
| LoginForm 提交成功 | 有效数据 | 调用 authClient.signIn.email | |
| SignupForm 提交成功 | 有效数据 | 调用 authClient.signUp.email | |

### Edge Cases Checklist
- [ ] 空输入验证
- [ ] 无效邮箱格式
- [ ] 短密码（< 8 字符）
- [ ] 长密码（> 128 字符）
- [ ] 密码确认不匹配
- [ ] 网络错误处理
- [ ] 服务器返回错误
- [ ] 加载状态显示
- [ ] 导航跳转成功

---

## Validation Commands

### Static Analysis
```bash
pnpm tsc --noEmit --pretty false --incremental
```
EXPECT: Zero type errors

### Development Server
```bash
pnpm dev
```
EXPECT: Server starts on port 3000

### Browser Validation
1. 访问 http://localhost:3000/login
2. 测试登录表单验证和提交
3. 访问 http://localhost:3000/sign-up
4. 测试注册表单验证和提交

### Manual Validation
- [ ] 登录页面渲染正常
- [ ] 登录表单验证实时生效
- [ ] 登录按钮加载状态显示
- [ ] 登录成功后跳转到首页
- [ ] 登录失败显示错误信息
- [ ] 注册页面渲染正常
- [ ] 注册表单验证实时生效
- [ ] 密码确认验证正确
- [ ] 注册按钮加载状态显示
- [ ] 注册成功后跳转到首页
- [ ] 注册失败显示错误信息
- [ ] 登录↔注册导航链接正常

---

## Acceptance Criteria
- [ ] 所有任务完成
- [ ] 类型检查通过
- [ ] 登录表单使用 TanStack Form
- [ ] 注册表单使用 TanStack Form
- [ ] Zod 验证实时生效
- [ ] 错误信息正确显示
- [ ] 加载状态正确显示
- [ ] 导航跳转正常工作
- [ ] 代码风格与项目一致

## Completion Checklist
- [ ] 代码遵循项目 patterns
- [ ] 错误处理完整
- [ ] 无 console.log
- [ ] 无 hardcoded 值
- [ ] 自包含实现

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| better-auth API 变更 | 低 | 中 | 使用最新文档确认 API |
| TanStack Form children API 版本差异 | 中 | 高 | 确认 React 版本使用 `field` 而非 `field()` |
| 导航跳转失败 | 低 | 中 | 确认 navigate 函数正确调用 |

## Notes
- 项目已安装 better-auth、TanStack Form 和 Zod
- 认证 API 路由已配置 (`src/routes/api/auth/$.ts`)
- Prisma schema 已定义 User 模型
- UI 组件（Button, Input, Field, Card）已可用
- 使用中文作为 UI 语言，与项目风格一致