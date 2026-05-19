# Plan: 用户系统完善

## Summary
分阶段完善用户系统，包括密码重置、邮箱验证、修改密码、错误提示优化等功能，提升安全性和用户体验。

## User Story
As a 用户, I want 能够重置密码、验证邮箱、修改密码并看到清晰的错误提示, so that 账户安全得到保障且操作体验流畅。

## Problem → Solution
当前用户系统完成度约60%，缺少关键安全功能（密码重置、邮箱验证）和错误提示 → 完善安全功能链路，统一错误处理机制。

## Metadata
- **Complexity**: Large
- **Source PRD**: N/A
- **PRD Phase**: N/A
- **Estimated Files**: 15+

---

## Implementation Phases

### Phase 1: 密码重置功能 (P0 - 安全核心)
**状态**: ✓ complete
**优先级**: HIGH
**预估工时**: 2-3小时
**实际工时**: 1.5小时
**报告**: `.claude/PRPs/reports/password-reset-phase1-report.md`

#### 功能描述
实现完整的密码重置流程：
1. 用户点击"忘记密码"，输入邮箱
2. 系统发送重置链接到邮箱
3. 用户点击链接，进入重置页面
4. 用户输入新密码，完成重置

#### 涉及文件
| 文件 | Action | 说明 |
|---|---|---|
| `src/lib/auth.ts` | UPDATE | 配置 sendResetPassword |
| `src/lib/validators/auth.ts` | UPDATE | 添加 resetPasswordSchema |
| `src/routes/_auth/forgot-password.tsx` | CREATE | 忘记密码页面 |
| `src/routes/_auth/reset-password.tsx` | CREATE | 重置密码页面 |
| `src/components/auth/forgot-password-form.tsx` | CREATE | 忘记密码表单组件 |
| `src/components/auth/reset-password-form.tsx` | CREATE | 重置密码表单组件 |
| `src/lib/email.ts` | CREATE | 邮件发送服务 |

#### 依赖
- 需要配置邮件发送服务（Resend/SendGrid 等）

---

### Phase 2: 邮箱验证功能 (P0 - 安全核心)
**状态**: ✓ complete
**优先级**: HIGH
**预估工时**: 2-3小时
**实际工时**: 1小时
**报告**: `.claude/PRPs/reports/email-verification-phase2-report.md`

#### 功能描述
实现邮箱验证流程：
1. 用户注册后自动发送验证邮件
2. 用户点击链接验证邮箱
3. Profile 页面显示验证状态
4. 支持重新发送验证邮件

#### 涉及文件
| 文件 | Action | 说明 |
|---|---|---|
| `src/lib/auth.ts` | UPDATE | 配置 emailVerification |
| `src/routes/_auth/verify-email.tsx` | CREATE | 验证结果页面 |
| `src/components/auth/profile-form.tsx` | UPDATE | 显示验证状态，重发按钮 |
| `src/lib/validators/auth.ts` | UPDATE | 添加 resendVerificationSchema |

---

### Phase 3: 修改密码功能 (P1 - 安全增强)
**状态**: ✓ complete
**优先级**: MEDIUM
**预估工时**: 1-2小时
**实际工时**: 20分钟
**报告**: `.claude/PRPs/reports/change-password-phase3-report.md`

#### 功能描述
在 Profile 页面添加修改密码入口：
1. 用户输入当前密码验证身份
2. 输入新密码并确认
3. 完成密码修改

#### 涉及文件
| 文件 | Action | 说明 |
|---|---|---|
| `src/lib/validators/auth.ts` | UPDATE | 添加 changePasswordSchema |
| `src/components/auth/change-password-form.tsx` | CREATE | 修改密码表单组件 |
| `src/components/auth/profile-form.tsx` | UPDATE | 添加修改密码入口 |
| `src/routes/_app/profile.tsx` | UPDATE | 可能需要调整布局 |

---

### Phase 4: 错误提示完善 (P1 - UX优化)
**状态**: ✓ complete
**优先级**: MEDIUM
**预估工时**: 1小时
**实际工时**: 5分钟
**报告**: `.claude/PRPs/reports/error-toast-phase4-report.md`

#### 功能描述
完善登录/注册表单的错误提示：
1. 登录失败显示 toast 提示
2. 注册失败显示 toast 提示
3. 统一错误消息格式

#### 涉及文件
| 文件 | Action | 说明 |
|---|---|---|
| `src/components/auth/login-form.tsx` | UPDATE | 添加错误 toast |
| `src/components/auth/signup-form.tsx` | UPDATE | 添加错误 toast |

---

### Phase 5: OAuth 登录 (P2 - 扩展功能)
**状态**: deferred
**优先级**: LOW
**预估工时**: 2-3小时
**备注**: 暂不实现

#### 功能描述
添加第三方登录支持：
1. Google OAuth
2. GitHub OAuth
3. 登录/注册页面添加 OAuth 按钮

#### 涉及文件
| 文件 | Action | 说明 |
|---|---|---|
| `src/lib/auth.ts` | UPDATE | 配置 socialProviders |
| `src/components/auth/oauth-buttons.tsx` | CREATE | OAuth 登录按钮组件 |
| `src/components/auth/login-form.tsx` | UPDATE | 添加 OAuth 按钮 |
| `src/components/auth/signup-form.tsx` | UPDATE | 添加 OAuth 按钮 |

---

## UX Design

### Before - 密码重置
```
┌─────────────────────────────┐
│  登录页面                    │
│  "忘记密码？" ← 点击无反应    │
│  用户无法找回密码            │
└─────────────────────────────┘
```

### After - 密码重置
```
┌─────────────────────────────┐
│  登录页面                    │
│  "忘记密码？" ← 点击跳转      │
├─────────────────────────────┤
│  忘记密码页面                 │
│  输入邮箱 → 发送重置链接      │
├─────────────────────────────┤
│  重置密码页面                 │
│  输入新密码 → 完成重置        │
└─────────────────────────────┘
```

### Before - 邮箱验证
```
┌─────────────────────────────┐
│  注册后直接进入应用           │
│  emailVerified=false         │
│  无任何提示                   │
└─────────────────────────────┘
```

### After - 邮箱验证
```
┌─────────────────────────────┐
│  注册后显示验证提示           │
│  "请验证您的邮箱"             │
├─────────────────────────────┤
│  Profile 页面                │
│  显示验证状态徽章             │
│  未验证 → 重发验证邮件按钮    │
└─────────────────────────────┘
```

---

## Mandatory Reading

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 | `src/lib/auth.ts` | 1-14 | better-auth 服务端配置 |
| P0 | `src/lib/auth-client.ts` | 1-4 | authClient API 用法 |
| P0 | `src/lib/validators/auth.ts` | 1-24 | Zod schema 模式 |
| P0 | `src/routes/api/upload/avatar.ts` | 1-61 | API 路由模式 |
| P1 | `src/components/auth/login-form.tsx` | 1-134 | 表单组件模式 |
| P1 | `src/routes/_auth/route.tsx` | 1-29 | Auth 路由布局模式 |
| P1 | `prisma/schema.prisma` | 1-73 | 数据库 schema |

---

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| Password Reset | better-auth docs | `sendResetPassword` 配置 + `authClient.resetPassword()` API |
| Email Verification | better-auth docs | `emailVerification.sendVerificationEmail` + `authClient.verifyEmail()` |
| Client APIs | better-auth docs | `requestPasswordReset({ email, redirectTo })`, `resetPassword({ newPassword, token })` |

---

## Patterns to Mirror

### NAMING_CONVENTION
// SOURCE: src/components/auth/login-form.tsx:23-52
```tsx
export function LoginForm({ className, ...props }: React.ComponentProps<'div'>) {
  const form = useForm({
    defaultValues: { email: '', password: '' },
    validators: { onChange: loginSchema },
    onSubmit: async ({ value }) => {
      const { data, error } = await authClient.signIn.email({ ... })
    },
  })
}
```

### API_ROUTE_PATTERN
// SOURCE: src/routes/api/upload/avatar.ts:6-10
```ts
const json = (data: object, status: number) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' }
  })
```

### VALIDATOR_PATTERN
// SOURCE: src/lib/validators/auth.ts:1-24
```ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('请输入有效的邮箱地址'),
  password: z.string().min(8, '密码至少需要8个字符'),
})

export type LoginInput = z.infer<typeof loginSchema>
```

### FORM_FIELD_PATTERN
// SOURCE: src/components/auth/login-form.tsx:70-86
```tsx
<form.Field name="email">
  {(field) => (
    <Field>
      <FieldLabel htmlFor="email">邮箱</FieldLabel>
      <Input
        id="email"
        type="email"
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

### ROUTE_GUARD_PATTERN
// SOURCE: src/routes/_auth/route.tsx:4-12
```tsx
export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession()
    if (session) {
      throw redirect({ to: '/' })
    }
  },
  component: AuthLayout,
})
```

### SESSION_ACCESS_PATTERN
// SOURCE: src/routes/api/upload/avatar.ts:16-22
```ts
const session = await auth.api.getSession({
  headers: request.headers,
})

if (!session?.user) {
  return json({ success: false, error: '未登录' }, 401)
}
```

---

## NOT Building

- Two-factor authentication (2FA)
- Session management UI
- Account deletion
- "Remember Me" toggle
- OAuth providers beyond Google/GitHub
- Email OTP authentication

---

## Validation Commands

### Static Analysis
```bash
pnpm tsc --noEmit
```
EXPECT: Zero type errors

### Unit Tests
```bash
pnpm test
```
EXPECT: All tests pass

### Build
```bash
pnpm build
```
EXPECT: Build succeeds

### Dev Server
```bash
pnpm dev
```
EXPECT: Feature works in browser

---

## Acceptance Criteria

### Phase 1: 密码重置
- [ ] 点击"忘记密码"跳转到 forgot-password 页面
- [ ] 输入邮箱后发送重置邮件
- [ ] 点击邮件链接跳转到 reset-password 页面
- [ ] 输入新密码后成功重置
- [ ] 无效 token 显示错误提示

### Phase 2: 邮箱验证
- [ ] 注册后自动发送验证邮件
- [ ] 点击邮件链接完成验证
- [ ] Profile 页面显示验证状态
- [ ] 未验证用户可重发验证邮件

### Phase 3: 修改密码
- [ ] Profile 页面有修改密码入口
- [ ] 需验证当前密码
- [ ] 新密码确认后成功修改

### Phase 4: 错误提示
- [ ] 登录失败显示 toast 错误
- [ ] 注册失败显示 toast 错误
- [ ] 错误消息语义化（中文）

---

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 邮件服务配置复杂 | Medium | High | 优先使用 Resend，文档清晰 |
| better-auth API 变化 | Low | Medium | 使用 Context7 查阅最新文档 |
| Token 过期处理 | Medium | Medium | 添加过期提示，允许重新发送 |

---

## Notes

- better-auth 已内置 password reset 和 email verification 支持
- 数据库已有 Verification 模型，无需修改 schema
- 邮件服务推荐使用 Resend（免费额度 3000封/月）
- 所有错误消息使用中文，保持一致性

---

## Completion Checklist

- [ ] 所有 phase 按顺序完成
- [ ] 无 type errors
- [ ] 无 lint errors
- [ ] 功能在浏览器中验证通过
- [ ] 代码遵循现有模式