<!-- Generated: 2026-05-26 | Files scanned: 251 | Token estimate: ~700 -->

# Backend Architecture

## API Routes

```
routes/api/auth/$.ts
├── GET  /api/auth/*  → auth.handler (Better Auth)
└── POST /api/auth/*  → auth.handler (Better Auth)
```

Better Auth 处理所有认证路径:
- `/api/auth/sign-in/email` - Email 登录
- `/api/auth/sign-up/email` - 注册
- `/api/auth/sign-in/email-otp` - OTP 登录
- `/api/auth/reset-password` - 密码重置
- `/api/auth/session` - Session 查询

## Data Layer

```
src/db.ts
└── PrismaPg adapter → PrismaClient
    └── src/generated/prisma/ (models)

src/data/
├── articles.ts      → Article CRUD + 查询
├── bookmark.ts      → Bookmark 增删
├── comment.ts       → Comment CRUD + 嵌套回复
├── follow.ts        → Follow/Unfollow
├── like.ts          → Article/Comment Like
├── image.ts         → R2 图片上传
└── tags.ts          → Tag 管理
```

## Auth System

```
src/lib/auth.ts
├── betterAuth()
│   ├── database: prismaAdapter
│   ├── emailAndPassword: enabled
│   ├── emailVerification: sendEmail
│   └── resetPassword: enabled
└── emailOTP配置

src/lib/auth-client.ts
└── createAuthClient() → authClient
    ├── signIn.email()
    ├── signUp.email()
    ├── signIn.emailOTP()
    ├── resetPassword()
    └── getSession()
```

## Auth Guards

```typescript
// src/lib/auth-guards.ts
requireAuth(session) → 抛出 401 未认证错误
optionalAuth(session) → 可选认证，返回 session 或 null
```

## External Services

### R2 Storage (src/lib/r2.ts)
- 头像上传: `/avatars/{userId}`
- 文章图片: `/articles/{articleId}`

### Email (src/lib/email.ts)
- Resend API
- 验证邮件、OTP、密码重置

## Validators (src/lib/validators/)

| File | Purpose |
|------|---------|
| `auth.ts` | loginSchema, signupSchema, passwordSchema |
| `article.ts` | createArticleSchema, updateArticleSchema |
| `profile.ts` | updateProfileSchema |
| `comment.ts` | createCommentSchema |
| `bookmark.ts` | bookmarkSchema |
| `follow.ts` | followSchema |
| `like.ts` | likeSchema |
| `tag.ts` | tagSchema |