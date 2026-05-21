# Plan: 布局优化

## Summary
创建统一的页面容器组件、优化响应式布局体验、增强 Sidebar 导航功能，全面提升应用的布局一致性和用户体验。

## User Story
作为用户，我希望页面布局一致、导航清晰、响应式体验流畅，以便在不同设备和页面间获得统一的高质量使用体验。

## Problem → Solution
**当前状态**：各页面独立定义容器样式（max-w-2xl/3xl/5xl/6xl），Sidebar 功能单一，响应式布局缺乏系统性检查。  
**目标状态**：统一 PageContainer 和 PageHeader 组件，Sidebar 增强分组和用户信息，全页面响应式验证通过。

## Metadata
- **Complexity**: Medium
- **Source PRD**: N/A
- **PRD Phase**: standalone
- **Estimated Files**: 10-15 files
- **Confidence**: 8/10

---

## UX Design

### Before
```
┌─────────────────────────────────────────────────┐
│  Navbar                                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────┐       │
│  │ max-w-2xl/3xl/5xl (不一致)          │       │
│  │ px-6 py-8 (重复定义)                │       │
│  │                                     │       │
│  │ Page Content...                     │       │
│  │                                     │       │
│  └─────────────────────────────────────┘       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### After
```
┌─────────────────────────────────────────────────┐
│  Navbar                                         │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌─────────────────────────────────────┐       │
│  │ PageContainer (width="md/lg/xl")    │       │
│  │   PageHeader                        │       │
│  │     Title + Description             │       │
│  │   PageContent                       │       │
│  │                                     │       │
│  └─────────────────────────────────────┘       │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Sidebar Enhancement
```
Before:                         After:
┌──────────────┐                ┌──────────────┐
│ 导航         │                │ 用户卡片     │
│ ──────────   │                │ ──────────── │
│ 文章         │                │ 创作         │
│ 写作         │                │ ├ 文章      │
│ 个人         │                │ ├ 写作      │
│              │                │ ├ 草稿箱    │
│              │                │              │
│              │                │ 阅读         │
│              │                │ ├ 收藏      │
│              │                │ └─────────── │
│              │                │ 设置         │
│              │                │ ├ 个人      │
│              │                │ └─────────── │
│              │                │              │
└──────────────┘                │ 快捷操作     │
                                │ ──────────── │
                                └──────────────┘
```

### Interaction Changes
| Touchpoint | Before | After | Notes |
|---|---|---|---|
| 页面容器 | 每页独立定义 | PageContainer 组件 | 统一样式和宽度 |
| 页面头部 | 各页自定义布局 | PageHeader 组件 | 标准化 title + description |
| Sidebar 导航 | 平铺3项 | 分组导航 | 创作/阅读/设置分组 |
| Sidebar 用户 | 无 | 用户卡片区域 | 显示头像和基本信息 |
| 移动端 Sidebar | Sheet 弹出 | 保持，优化动画 | 已有良好基础 |

---

## Mandatory Reading

Files that MUST be read before implementing:

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 (critical) | `src/components/ui/sidebar.tsx` | 1-100 | Sidebar 组件 API |
| P0 (critical) | `src/components/layout/app-sidebar.tsx` | 1-58 | 当前 Sidebar 实现 |
| P1 (important) | `src/components/home/articles-page.tsx` | 205-254 | 页面容器模式参考 |
| P1 (important) | `src/components/editor/write-page.tsx` | 46-190 | 宽布局页面参考 |
| P2 (reference) | `src/components/layout/index.ts` | 1-9 | 导出结构 |
| P2 (reference) | `src/hooks/use-route-state.ts` | 1-18 | 获取路由和 session |

---

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| shadcn/ui Sidebar | https://ui.shadcn.com/docs/components/sidebar | 分组、用户卡片、Footer 支持 |
| Tailwind max-width | https://tailwindcss.com/docs/max-width | max-w-sm/md/lg/xl/2xl/3xl/4xl/5xl/6xl/7xl |

---

## Patterns to Mirror

### COMPONENT_EXPORT
// SOURCE: src/components/layout/index.ts:1-9
```tsx
export { Navbar } from "./app-navbar";
export { NavbarBrand } from "./navbar-brand";
export { AppSidebar } from "./app-sidebar";
export { AppLayout } from "./app-layout";
```

### SIDEBAR_MENU_ITEM
// SOURCE: src/components/layout/app-sidebar.tsx:41-50
```tsx
{items.map((item) => (
  <SidebarMenuItem key={item.title}>
    <SidebarMenuButton asChild tooltip={item.title}>
      <Link to={item.to}>
        <item.icon />
        <span>{item.title}</span>
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
))}
```

### PAGE_CONTAINER_PATTERN
// SOURCE: src/components/home/articles-page.tsx:206-207
```tsx
<div className="min-h-screen bg-background">
  <div className="max-w-3xl mx-auto px-6 py-8 lg:py-12">
```

### PAGE_HEADER_PATTERN
// SOURCE: src/components/home/articles-page.tsx:209-215
```tsx
<div className="mb-8 lg:mb-12">
  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
    文章
  </h1>
  <p className="text-muted-foreground mt-2 text-sm lg:text-base">
    探索技术、架构与工程实践
  </p>
</div>
```

### IMPORT_ALIAS
// SOURCE: src/components/layout/navbar-brand.tsx:1-2
```tsx
import { Link } from '@tanstack/react-router'
import { SidebarTrigger } from '#/components/ui/sidebar'
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `src/components/layout/page-container.tsx` | CREATE | 统一页面容器组件 |
| `src/components/layout/page-header.tsx` | CREATE | 统一页面头部组件 |
| `src/components/layout/app-sidebar.tsx` | UPDATE | 增强分组和用户信息 |
| `src/components/layout/index.ts` | UPDATE | 导出新组件 |
| `src/components/home/articles-page.tsx` | UPDATE | 使用 PageContainer/PageHeader |
| `src/components/editor/write-page.tsx` | UPDATE | 使用 PageContainer/PageHeader |
| `src/components/auth/profile-page.tsx` | UPDATE | 使用 PageContainer/PageHeader |
| `src/components/home/home-page.tsx` | UPDATE | 使用 PageContainer |

## NOT Building

- 页面过渡动画效果（超出当前优化范围）
- 路由重命名（_app → _authenticated，已在上一轮跳过）
- 新增额外页面（草稿箱、收藏等页面仅添加导航项，不实现页面）

---

## Step-by-Step Tasks

### Task 1: 创建 PageContainer 组件
- **ACTION**: 创建统一页面容器组件
- **IMPLEMENT**: 
  - 定义 width prop: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | 'full'
  - 映射到 max-w-sm/md/lg/xl/2xl/3xl/4xl/5xl/6xl
  - 默认 padding: px-6 py-8
  - 支持 mobile padding 变体: py-8 lg:py-12
- **MIRROR**: PAGE_CONTAINER_PATTERN
- **IMPORTS**: `import { cn } from '#/lib/utils'`
- **GOTCHA**: 不要设置 min-h-screen，这是页面外壳的责任
- **VALIDATE**: 类型检查通过，组件渲染正确

### Task 2: 创建 PageHeader 组件
- **ACTION**: 创建统一页面头部组件
- **IMPLEMENT**:
  - title prop (必填)
  - description prop (可选)
  - children prop (可选，用于额外操作区)
  - 响应式字号: text-2xl lg:text-3xl
- **MIRROR**: PAGE_HEADER_PATTERN
- **IMPORTS**: `import { cn } from '#/lib/utils'`
- **GOTCHA**: 保持语义化，不要添加额外装饰元素
- **VALIDATE**: 类型检查通过，与 PageContainer 组合正常

### Task 3: 增强 AppSidebar - 用户卡片区域
- **ACTION**: 在 Sidebar 顶部添加用户信息卡片
- **IMPLEMENT**:
  - 使用 useRouteState 获取 session
  - SidebarHeader 区域放置用户卡片
  - 显示头像、名字、邮箱缩写
  - 点击跳转到个人页面
- **MIRROR**: IMPORT_ALIAS, SidebarHeader API (shadcn/ui)
- **IMPORTS**: 
  ```tsx
  import { SidebarHeader, SidebarFooter } from '#/components/ui/sidebar'
  import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
  import { useRouteState } from '#/hooks/use-route-state'
  ```
- **GOTCHA**: session 可能为 null，需要处理未登录状态
- **VALIDATE**: 登录时显示用户信息，未登录显示登录按钮

### Task 4: 增强 AppSidebar - 分组导航
- **ACTION**: 将导航项分组为创作/阅读/设置
- **IMPLEMENT**:
  - SidebarGroup: 创作（文章、写作、草稿箱）
  - SidebarGroup: 阅读（收藏）
  - SidebarGroup: 设置（个人）
  - 使用 SidebarGroupLabel 标注分组
- **MIRROR**: SIDEBAR_MENU_ITEM
- **IMPORTS**: 保持现有 imports
- **GOTCHA**: 草稿箱、收藏暂不实现实际页面，仅添加占位导航项
- **VALIDATE**: 分组显示清晰，图标和文字对齐

### Task 5: 增强 AppSidebar - Footer 快捷操作
- **ACTION**: 在 Sidebar 底部添加快捷操作区
- **IMPLEMENT**:
  - SidebarFooter 区域
  - 主题切换按钮（已有 ModeToggle）
  - 简洁的底部信息
- **MIRROR**: SidebarFooter API
- **IMPORTS**: `import { ModeToggle } from '#/components/theme'`
- **GOTCHA**: Footer 在 collapsed 状态下应隐藏或简化
- **VALIDATE**: expanded 显示完整，collapsed 隐藏或最小化

### Task 6: 更新导出 index.ts
- **ACTION**: 导出新创建的组件
- **IMPLEMENT**: 
  ```tsx
  export { PageContainer } from "./page-container";
  export { PageHeader } from "./page-header";
  ```
- **MIRROR**: COMPONENT_EXPORT
- **IMPORTS**: 无需新增
- **GOTCHA**: 保持 alphabetical 排序
- **VALIDATE**: 其他文件可以正确 import

### Task 7: 重构 ArticlesPage
- **ACTION**: 使用 PageContainer 和 PageHeader
- **IMPLEMENT**:
  ```tsx
  <PageContainer width="3xl">
    <PageHeader title="文章" description="探索技术、架构与工程实践">
      {/* 额外操作区 */}
    </PageHeader>
    {/* 文章内容 */}
  </PageContainer>
  ```
- **MIRROR**: PAGE_CONTAINER_PATTERN, PAGE_HEADER_PATTERN
- **IMPORTS**: `import { PageContainer, PageHeader } from '#/components/layout'`
- **GOTCHA**: 保留 lg:py-12 的响应式 padding，需在 PageContainer 支持
- **VALIDATE**: 视觉效果与原版一致

### Task 8: 重构 WritePage
- **ACTION**: 使用 PageContainer
- **IMPLEMENT**:
  ```tsx
  <PageContainer width="5xl">
    {/* 写作页面头部已有自定义布局，不使用 PageHeader */}
    {/* 写作内容 */}
  </PageContainer>
  ```
- **MIRROR**: PAGE_CONTAINER_PATTERN
- **IMPORTS**: `import { PageContainer } from '#/components/layout'`
- **GOTCHA**: WritePage 头部有复杂的操作按钮，保留自定义布局
- **VALIDATE**: 布局保持不变

### Task 9: 重构 ProfilePage
- **ACTION**: 使用 PageContainer 和 PageHeader
- **IMPLEMENT**:
  ```tsx
  <PageContainer width="2xl">
    <PageHeader title="个人设置" description="管理您的账户信息和安全设置" />
    {/* Profile 内容 */}
  </PageContainer>
  ```
- **MIRROR**: PAGE_CONTAINER_PATTERN, PAGE_HEADER_PATTERN
- **IMPORTS**: `import { PageContainer, PageHeader } from '#/components/layout'`
- **GOTCHA**: Skeleton 加载状态也需要使用 PageContainer
- **VALIDATE**: 加载和完成状态布局一致

### Task 10: 重构 HomePage
- **ACTION**: 使用 PageContainer（如果适用）
- **IMPLEMENT**: 检查是否适合使用 PageContainer，HomePage 有特殊的 hero 区域
- **MIRROR**: 查看现有实现
- **IMPORTS**: `import { PageContainer } from '#/components/layout'` (如果使用)
- **GOTCHA**: Hero 区域可能需要特殊处理
- **VALIDATE**: 不破坏现有 hero 效果

### Task 11: 响应式验证
- **ACTION**: 在浏览器中验证所有页面响应式布局
- **IMPLEMENT**:
  - 启动开发服务器
  - 检查 320px, 768px, 1024px, 1440px
  - 检查 Sidebar 在移动端表现
  - 检查 PageContainer 在不同宽度表现
- **MIRROR**: 无代码模式
- **IMPORTS**: 无
- **GOTCHA**: 检查 Sidebar 的 Sheet 弹出动画是否正常
- **VALIDATE**: 所有断点显示正常

---

## Testing Strategy

### Unit Tests
| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| PageContainer width prop | width="3xl" | max-w-3xl class | ✓ |
| PageContainer default | 无 prop | max-w-3xl (默认) | |
| PageHeader title only | title="测试" | h1 包含"测试" | |
| PageHeader with description | title, description | h1 + p 显示 | |
| Sidebar user card | session null | 显示登录按钮 | ✓ 未登录 |
| Sidebar user card | session 有值 | 显示用户信息 | |

### Edge Cases Checklist
- [ ] 未登录状态 Sidebar 用户卡片
- [ ] Sidebar collapsed 状态 Footer 显示
- [ ] PageContainer 在极窄屏幕（320px）溢出
- [ ] 长标题 PageHeader 换行处理
- [ ] 长用户名 Sidebar 截断

---

## Validation Commands

### Static Analysis
```bash
# Type check
pnpm tsc --noEmit
```
EXPECT: Zero type errors

### Build Check
```bash
# Production build
pnpm build
```
EXPECT: Build succeeds

### Browser Validation
```bash
# Start dev server
pnpm dev
```
EXPECT: Server starts, visit all pages

### Manual Validation
- [ ] ArticlesPage: 3xl 宽度，PageHeader 显示
- [ ] WritePage: 5xl 宽度，布局正确
- [ ] ProfilePage: 2xl 宽度，PageHeader 显示
- [ ] Sidebar: 用户卡片显示
- [ ] Sidebar: 分组导航清晰
- [ ] Sidebar: Footer 主题切换正常
- [ ] 响应式: 320px 无溢出
- [ ] 响应式: 768px Sidebar Sheet 正常
- [ ] 响应式: 1024px+ Sidebar 显示

---

## Acceptance Criteria
- [ ] PageContainer 和 PageHeader 组件创建完成
- [ ] 所有主要页面使用统一容器组件
- [ ] Sidebar 用户卡片区域显示正常
- [ ] Sidebar 导航分组清晰
- [ ] Sidebar Footer 包含主题切换
- [ ] 所有页面响应式验证通过
- [ ] 无类型错误
- [ ] 构建成功
- [ ] 视觉效果与原有设计一致或更好

## Completion Checklist
- [ ] 代码遵循现有 import alias 模式 (#/*)
- [ ] 组件命名 PascalCase
- [ ] Props 接口明确定义
- [ ] 导出结构 alphabetical 排序
- [ ] 无硬编码样式值（使用 Tailwind）
- [ ] 无 console.log
- [ ] 无新增外部依赖
- [ ] 响应式断点使用现有约定（lg: 等）

## Risks
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| PageContainer 过度抽象 | Medium | Medium | 保持简单，只处理容器样式 |
| Sidebar 改动破坏现有状态 | Low | High | 保持现有 cookie 状态逻辑 |
| 响应式验证发现新问题 | Medium | Low | 预留修复时间 |

## Notes
- 本次优化专注于布局一致性和导航增强
- 不涉及页面过渡动画或新的业务页面实现
- 草稿箱、收藏页面仅添加导航占位，不实现实际页面
- Sidebar 的 Sheet 移动端弹窗已有良好实现，保持不变