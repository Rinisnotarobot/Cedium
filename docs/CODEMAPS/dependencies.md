<!-- Generated: 2026-05-26 | Files scanned: 251 | Token estimate: ~500 -->

# Dependencies & External Services

## Core Framework Stack

| Package | Version | Purpose |
|---------|---------|---------|
| @tanstack/react-start | latest | SSR 框架核心 |
| @tanstack/react-router | latest | 文件路由系统 |
| @tanstack/react-query | latest | 数据获取/缓存 |
| @tanstack/react-form | latest | 表单管理 |
| react | 19.2.0 | UI 运行时 |
| tailwindcss | 4.1.18 | CSS 样式 |

## Database & ORM

| Package | Version | Purpose |
|---------|---------|---------|
| @prisma/client | 7.4.2 | ORM |
| @prisma/adapter-pg | 7.4.2 | PostgreSQL adapter (SSR) |

## Authentication

| Package | Version | Purpose |
|---------|---------|---------|
| better-auth | 1.5.3 | 认证框架 |
| resend | 6.12.3 | 邮件发送 |

## Storage

| Package | Version | Purpose |
|---------|---------|---------|
| @aws-sdk/client-s3 | 3.1048.0 | R2/S3 存储 |

## Editor

| Package | Version | Purpose |
|---------|---------|---------|
| @tiptap/react | 3.23.4 | 富文本编辑器核心 |
| @tiptap/starter-kit | 3.23.4 | 基础扩展 |
| @tiptap/extension-* | 3.23.4 | 各种编辑器扩展 |
| lowlight | 3.3.0 | 代码高亮 |

## UI Components

| Package | Version | Purpose |
|---------|---------|---------|
| @radix-ui/react-* | various | 无障碍 UI 基础 |
| lucide-react | 0.577.0 | 图标库 |
| framer-motion | 12.38.0 | 动画 |
| sonner | 2.0.7 | Toast 通知 |
| next-themes | 0.4.6 | 主题管理 |

## State & Utilities

| Package | Version | Purpose |
|---------|---------|---------|
| jotai | 2.20.0 | 原子化状态 |
| zod | 4.3.6 | Schema 验证 |
| date-fns | 4.3.0 | 日期处理 |
| clsx + tailwind-merge | various | CSS 类名合并 |

## External Services

### Cloudflare R2
- 用途: 图片存储 (头像、文章图片)
- 配置: `src/lib/r2.ts`
- 端点: S3-compatible API

### Resend
- 用途: 邮件发送 (验证、OTP、密码重置)
- 配置: `src/lib/email.ts`
- 模板: 验证码、重置链接

### PostgreSQL
- 用途: 主数据库
- 连接: `DATABASE_URL` 环境变量
- ORM: Prisma with adapter-pg

## Build Tools

| Package | Version | Purpose |
|---------|---------|---------|
| vite | 8.0.0 | 构建工具 |
| nitro | 3.0.260522-beta | SSR 服务器 |
| typescript | 6.0.2 | 类型检查 |
| babel-plugin-react-compiler | 1.0.0 | React 编译优化 |