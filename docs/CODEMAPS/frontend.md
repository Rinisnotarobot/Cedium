<!-- Generated: 2026-05-26 | Files scanned: 251 | Token estimate: ~750 -->

# Frontend Architecture

## Page Tree

```
__root.tsx (QueryClient, ThemeProvider)
│
├── index.tsx              → 首页 (公开)
├── about.tsx              → 关于页面 (公开)
├── articles.$slug.tsx     → 文章详情 (公开)
│
├── _app/ (认证路由组)
│   ├── route.tsx          → AppLayout, beforeLoad验证session
│   ├── me/
│   │   ├── route.tsx      → 用户中心布局
│   │   ├── index.tsx      → 个人主页
│   │   ├── articles.tsx   → 我的文章管理
│   │   ├── favorites.tsx  → 收藏列表
│   │   └── settings/
│   │       ├── route.tsx  → 设置布局
│   │       ├── index.tsx  → 账号设置
│   │       ├── security.tsx    → 安全设置
│   │       ├── notifications.tsx → 通知设置
│   │       └── publishing.tsx   → 发布设置
│   ├── articles.tsx       → 文章列表
│   ├── search.tsx         → 搜索页面
│   ├── write.tsx          → 编辑器页面
│   └── users.$username.tsx → 用户主页
│
└── _auth/ (未认证路由组)
│   ├── route.tsx          → AuthLayout, 已登录重定向
│   ├── login.tsx          → 登录页
│   ├── sign-up.tsx        → 注册页
│   ├── forgot-password.tsx → 忘记密码
│   └── reset-password.tsx  → 重置密码
```

## Component Hierarchy

```
src/components/
├── layout/
│   ├── app-layout.tsx     → 主应用布局
│   ├── app-navbar.tsx     → 顶部导航
│   ├── app-sidebar.tsx    → 侧边栏
│   ├── navbar-user-menu.tsx → 用户下拉菜单
│   └── page-container.tsx → 页面容器
│
├── auth/
│   ├── login-form.tsx     → 登录表单
│   ├── signup-form.tsx    → 注册表单
│   ├── forgot-password-form.tsx
│   ├── reset-password-form.tsx
│   └── change-password-form.tsx
│
├── articles/
│   ├── article-detail-page.tsx  → 文章详情页
│   ├── articles-manage-page.tsx → 文章管理页
│   ├── article-manage-card.tsx  → 文章卡片
│   ├── virtual-article-list.tsx → 虚拟列表
│   └── stats-bar.tsx      → 统计栏
│
├── editor/
│   ├── article-editor.tsx → 编辑器主体
│   └── write-page.tsx     → 写作页面
│
├── users/
│   ├── user-profile-page.tsx  → 用户主页
│   ├── profile-sidebar.tsx    → 用户侧边栏
│   ├── profile-tabs.tsx       → 用户标签页
│   └── following-list.tsx     → 关注列表
│
├── settings/
│   ├── account-settings.tsx   → 账号设置
│   ├── security-settings.tsx  → 安全设置
│   └── profile-edit-dialog.tsx → 编辑资料弹窗
│
├── favorites/
│   └── favorites-page.tsx → 收藏页
│
├── home/
│   ├── home-page.tsx      → 首页
│   └── starfield-hero.tsx → 星空背景
│
├── theme/
│   ├── theme-provider.tsx → 主题提供者
│   └── mode-toggle.tsx    → 主题切换
│
└── ui/ (Shadcn/UI + minimal-tiptap)
    ├── button.tsx, card.tsx, dialog.tsx, ...
    └── minimal-tiptap/    → Tiptap富文本编辑器
```

## Hooks Structure

```
src/hooks/
├── queries/               → TanStack Query queries
│   ├── use-article-infinite-queries.ts
│   ├── use-bookmark-queries.ts
│   ├── use-comment-queries.ts
│   ├── use-follow-queries.ts
│   └── use-like-queries.ts
│
├── mutations/             → TanStack Query mutations
│   ├── use-article-mutations.ts
│   ├── use-avatar-upload.ts
│   ├── use-bookmark-mutations.ts
│   ├── use-comment-mutations.ts
│   ├── use-follow-mutations.ts
│   ├── use-like-mutations.ts
│   ├── use-image-upload.ts
│   ├── use-tag-mutations.ts
│   └── use-update-profile.ts
│
├── keys/                  → Query keys factory
│   ├── article-keys.ts, bookmark-keys.ts, ...
│
├── utils/
│   └── optimistic-update.ts → 乐观更新工具
│
└── use-*.ts               → 工具hooks
    ├── use-is-breakpoint.ts
    ├── use-mobile.ts
    ├── use-route-state.ts
```

## Data Flow

```
Component → useQuery/useMutation → data/*.ts → Prisma → DB
                ↓
           Query Keys (hooks/keys/)
                ↓
           Optimistic Updates (hooks/utils/)
```