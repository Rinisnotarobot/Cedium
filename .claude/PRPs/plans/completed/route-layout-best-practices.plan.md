# Plan: 路由布局最佳实践

## Summary
优化 TanStack Router 路由结构和布局组件架构，实现更清晰的职责分离、统一的权限管理、更好的状态管理，并遵循 React 最佳实践，使布局系统更易维护和扩展。

## User Story
作为开发者，我想要一个清晰、可维护的路由布局系统，以便能够轻松添加新功能、统一管理权限，并遵循 React 和 TanStack Router 的最佳实践。

## Problem → Solution
当前路由布局职责分散、权限管理不统一、组件过大、状态管理混乱 → 重构为清晰的路由架构、统一的权限检查机制、拆分大型组件、集中化状态管理

## Metadata
- **Complexity**: Medium
- **Source PRD**: N/A
- **PRD Phase**: standalone
- **Estimated Files**: 8-12 个文件（创建和修改）

---

## UX Design

### Before
```
┌─────────────────────────────────────────┐
│  Root Layout (ThemeProvider, etc)       │
│  ├─ _app Layout                         │
│  │  ├─ AppSidebar                       │
│  │  ├─ Navbar (167 lines, mixed logic) │
│  │  └─ Outlet                           │
│  │      ├─ /articles (no auth check)    │
│  │      ├─ /write (auth check inline)   │
│  │      ├─ /profile (no auth check)     │
│  │                                      │
│  ├─ _auth Layout                        │
│  │  ├─ Simple Navbar                    │
│  │  └─ Outlet                           │
│  │      ├─ /login                       │
│  │      ├─ /sign-up                     │
│  │                                      │
│  ├─ / (home, no layout)                 │
└─────────────────────────────────────────┘
```

**问题：**
- 权限检查分散在不同路由
- Navbar 过大（167行）混合多种状态
- 状态管理不统一
- 搜索框只在特定路由显示
- Layout 层级不清晰

### After
```
┌─────────────────────────────────────────┐
│  Root Layout (ThemeProvider, etc)       │
│  ├─ _authenticated Layout               │
│  │  ├─ AuthGuard (统一权限检查)         │
│  │  ├─ AppLayout                        │
│  │  │   ├─ AppSidebar                   │
│  │  │   ├─ Navbar (拆分为多个组件)      │
│  │  │   │   ├─ NavbarBrand              │
│  │  │   │   ├─ NavbarSearch             │
│  │  │   │   ├─ NavbarActions            │
│  │  │   │   └─ NavbarUserMenu           │
│  │  │   └─ Outlet                       │
│  │  │       ├─ /articles                │
│  │  │       ├─ /write                   │
│  │  │       ├─ /profile                 │
│  │  │                                    │
│  ├─ _public Layout                      │
│  │  ├─ PublicNavbar                     │
│  │  └─ Outlet                           │
│  │      ├─ /login                       │
│  │      ├─ /sign-up                     │
│  │      ├─ /forgot-password             │
│  │                                      │
│  ├─ / (home, standalone)                │
└─────────────────────────────────────────┘
```

**改进：**
- 统一的权限检查机制（AuthGuard）
- Navbar 拆分为专注的小组件
- 清晰的布局层级（authenticated vs public）
- 集中化的路由状态管理
- 搜索组件按路由条件渲染

### Interaction Changes

| Touchpoint | Before | After | Notes |
|---|---|---|---|
| 权限验证 | 每个路由单独检查 | AuthGuard 统一处理 | 减少重复代码 |
| Navbar 代码 | 单文件 167 行 | 4 个专注组件 | 更易维护 |
| 状态管理 | 分散在组件内 | useRouteState hook | 集中管理 |
| 搜索框显示 | 硬编码条件 | 基于路由配置 | 更灵活 |

---

## Mandatory Reading

Files that MUST be read before implementing:

| Priority | File | Lines | Why |
|---|---|---|---|
| P0 (critical) | `src/routes/__root.tsx` | 1-75 | 根路由结构，全局 provider |
| P0 (critical) | `src/routes/_app.tsx` | 1-12 | 当前应用布局路由 |
| P0 (critical) | `src/routes/_auth/route.tsx` | 1-13 | 当前认证布局路由 |
| P1 (important) | `src/components/layout/app-navbar.tsx` | 1-170 | 需要拆分的大型组件 |
| P1 (important) | `src/components/layout/app-layout.tsx` | 1-21 | 布局组件模式 |
| P1 (important) | `src/routes/_app/write.tsx` | 1-11 | 权限检查示例 |
| P2 (reference) | `src/components/layout/app-sidebar.tsx` | 1-58 | 侧边栏结构 |
| P2 (reference) | `src/routes/index.tsx` | 1-6 | 独立路由示例 |

## External Documentation

| Topic | Source | Key Takeaway |
|---|---|---|
| TanStack Router Layout Routes | https://tanstack.com/router/latest/docs/framework/react/guide/layout-routes | 使用 layout routes 组织共享 UI |
| TanStack Router Before Load | https://tanstack.com/router/latest/docs/framework/react/guide/preloading | beforeLoad 用于权限检查 |
| React Component Composition | React best practices | 拆分大型组件，使用组合模式 |
| Custom Hooks | React hooks best practices | 提取状态逻辑到自定义 hooks |

---

## Patterns to Mirror

Code patterns discovered in the codebase. Follow these exactly.

### ROUTE_FILE_NAMING
// SOURCE: src/routes/_app.tsx:1-12
```tsx
import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "#/components/layout";

export const Route = createFileRoute("/_app")({
  beforeLoad: async () => {
    // 权限检查逻辑
  },
  component: AppLayout,
});
```

### COMPONENT_EXPORT_PATTERN
// SOURCE: src/components/layout/index.ts:1-5
```tsx
export { Navbar } from "./app-navbar";
export { AppSidebar } from "./app-sidebar";
export { AppLayout } from "./app-layout";
```

### IMPORT_ALIAS_PATTERN
// SOURCE: 所有路由文件
```tsx
// 使用 # 别名导入项目内模块
import { AppLayout } from "#/components/layout";
import { authClient } from "#/lib/auth-client";
```

### AUTH_CHECK_PATTERN
// SOURCE: src/routes/_app.tsx:7-9
```tsx
beforeLoad: async () => {
  const { data: session } = await authClient.getSession();
  return { session };
}
```

### REDIRECT_PATTERN
// SOURCE: src/routes/_auth/route.tsx:7-9
```tsx
beforeLoad: async () => {
  if (session) {
    throw redirect({ to: '/' })
  }
}
```

### NAVBAR_LOCATION_HOOK_PATTERN
// SOURCE: src/components/layout/app-navbar.tsx:39-43
```tsx
const location = useLocation();
const navigate = useNavigate();
const isWriteRoute = location.pathname === "/write";
const isArticlesRoute = location.pathname === "/articles";
```

---

## Files to Change

| File | Action | Justification |
|---|---|---|
| `src/routes/_app.tsx` | UPDATE | 重命名为 `_authenticated.tsx`，增强权限检查 |
| `src/routes/_auth/route.tsx` | UPDATE | 重命名为 `_public.tsx`，统一公开路由布局 |
| `src/components/layout/app-navbar.tsx` | REFACTOR | 拆分为多个小组件 |
| `src/components/layout/navbar-brand.tsx` | CREATE | 提取品牌 Logo 部分 |
| `src/components/layout/navbar-search.tsx` | CREATE | 提取搜索框组件 |
| `src/components/layout/navbar-actions.tsx` | CREATE | 提取操作按钮部分 |
| `src/components/layout/navbar-user-menu.tsx` | CREATE | 提取用户下拉菜单 |
| `src/hooks/use-route-state.ts` | CREATE | 集中化路由状态管理 hook |
| `src/components/layout/index.ts` | UPDATE | 添加新组件导出 |

## NOT Building

- 不修改 API 路由结构
- 不改变认证逻辑本身（只改变布局）
- 不修改侧边栏组件（已足够简洁）
- 不添加新的页面功能
- 不修改全局样式

---

## Step-by-Step Tasks

### Task 1: 创建 useRouteState Hook
- **ACTION**: 创建集中化路由状态管理 hook
- **IMPLEMENT**: 
  ```tsx
  // src/hooks/use-route-state.ts
  import { useLocation, useNavigate } from '@tanstack/react-router'
  import { authClient } from '#/lib/auth-client'

  export function useRouteState() {
    const location = useLocation()
    const navigate = useNavigate()
    const { data: session, isPending } = authClient.useSession()

    return {
      pathname: location.pathname,
      isWriteRoute: location.pathname === '/write',
      isArticlesRoute: location.pathname === '/articles',
      isProfileRoute: location.pathname === '/profile',
      session,
      isPending,
      navigate,
    }
  }
  ```
- **MIRROR**: NAVBAR_LOCATION_HOOK_PATTERN
- **IMPORTS**: `@tanstack/react-router`, `#/lib/auth-client`
- **GOTCHA**: 确保在 authClient 可用的上下文中调用
- **VALIDATE**: 编写单元测试验证 hook 返回正确值

### Task 2: 拆分 NavbarBrand 组件
- **ACTION**: 从 Navbar 提取品牌 Logo 部分
- **IMPLEMENT**:
  ```tsx
  // src/components/layout/navbar-brand.tsx
  import { Link } from '@tanstack/react-router'
  import { SidebarTrigger } from '#/components/ui/sidebar'

  export function NavbarBrand() {
    return (
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <Link to="/articles" className="text-xl font-bold text-foreground hover:text-foreground/80 transition-colors">
          Cedium
        </Link>
      </div>
    )
  }
  ```
- **MIRROR**: COMPONENT_EXPORT_PATTERN, IMPORT_ALIAS_PATTERN
- **IMPORTS**: `@tanstack/react-router`, `#/components/ui/sidebar`
- **GOTCHA**: 保持原有的样式类名
- **VALIDATE**: 确保品牌链接和侧边栏触发器正常工作

### Task 3: 拆分 NavbarSearch 组件
- **ACTION**: 从 Navbar 提取搜索框部分
- **IMPLEMENT**:
  ```tsx
  // src/components/layout/navbar-search.tsx
  import { Search } from 'lucide-react'
  import { Input } from '#/components/ui/input'

  interface NavbarSearchProps {
    visible: boolean
  }

  export function NavbarSearch({ visible }: NavbarSearchProps) {
    if (!visible) return null

    return (
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
        <Input type="search" placeholder="Search..." className="pl-9 w-full rounded-full" />
      </div>
    )
  }
  ```
- **MIRROR**: IMPORT_ALIAS_PATTERN
- **IMPORTS**: `lucide-react`, `#/components/ui/input`
- **GOTCHA**: 使用 visible prop 控制显示，而不是硬编码路由检查
- **VALIDATE**: 测试在不同路由下传入 true/false 时的显示/隐藏

### Task 4: 拆分 NavbarActions 组件
- **ACTION**: 从 Navbar 提取操作按钮部分
- **IMPLEMENT**:
  ```tsx
  // src/components/layout/navbar-actions.tsx
  import { Link } from '@tanstack/react-router'
  import { PenLine, Send } from 'lucide-react'
  import { Button } from '#/components/ui/button'
  import { ModeToggle } from '#/components/theme'

  interface NavbarActionsProps {
    isWriteRoute: boolean
    hasContent?: boolean
  }

  export function NavbarActions({ isWriteRoute, hasContent }: NavbarActionsProps) {
    return (
      <div className="flex items-center gap-3">
        {isWriteRoute ? (
          <Button size="default" disabled={!hasContent}>
            <Send className="size-4 mr-1" />
            发布
          </Button>
        ) : (
          <Button size="default" asChild>
            <Link to="/write">
              <PenLine className="size-4 mr-1" />
              写作
            </Link>
          </Button>
        )}
        <ModeToggle />
      </div>
    )
  }
  ```
- **MIRROR**: IMPORT_ALIAS_PATTERN
- **IMPORTS**: `@tanstack/react-router`, `lucide-react`, `#/components/ui/button`, `#/components/theme`
- **GOTCHA**: 保持原有的按钮逻辑和样式
- **VALIDATE**: 测试在写文章路由和其他路由下按钮状态

### Task 5: 拆分 NavbarUserMenu 组件
- **ACTION**: 从 Navbar 提取用户下拉菜单部分
- **IMPLEMENT**:
  ```tsx
  // src/components/layout/navbar-user-menu.tsx
  import { Link, useNavigate } from '@tanstack/react-router'
  import { LogOut, User, FileText, Home } from 'lucide-react'
  import { Button } from '#/components/ui/button'
  import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
  import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '#/components/ui/dropdown-menu'
  import { authClient } from '#/lib/auth-client'

  interface NavbarUserMenuProps {
    session: { user: { name?: string; email?: string; image?: string } } | null
    isPending: boolean
  }

  export function NavbarUserMenu({ session, isPending }: NavbarUserMenuProps) {
    const navigate = useNavigate()

    const handleSignOut = async () => {
      await authClient.signOut()
      navigate({ to: '/login' })
    }

    if (isPending) {
      return <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
    }

    if (!session?.user) {
      return (
        <Button size="sm" asChild>
          <Link to="/login">登录</Link>
        </Button>
      )
    }

    return (
      <DropdownMenu>
        {/* 保持原有的下拉菜单结构 */}
      </DropdownMenu>
    )
  }
  ```
- **MIRROR**: IMPORT_ALIAS_PATTERN, AUTH_CHECK_PATTERN
- **IMPORTS**: 多个导入（见 IMPLEMENT）
- **GOTCHA**: 保持原有的下拉菜单结构和样式
- **VALIDATE**: 测试未登录、加载中、已登录三种状态

### Task 6: 重构 Navbar 主组件
- **ACTION**: 组合拆分的子组件
- **IMPLEMENT**:
  ```tsx
  // src/components/layout/app-navbar.tsx (重构后)
  import { cn } from '#/lib/utils'
  import { useRouteState } from '#/hooks/use-route-state'
  import { useHasContent } from '#/components/editor'
  import { NavbarBrand } from './navbar-brand'
  import { NavbarSearch } from './navbar-search'
  import { NavbarActions } from './navbar-actions'
  import { NavbarUserMenu } from './navbar-user-menu'

  export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {}

  export const Navbar = ({ className, ...props }: NavbarProps) => {
    const { isWriteRoute, isArticlesRoute, session, isPending } = useRouteState()
    const hasContent = useHasContent()

    return (
      <nav className={cn("sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 px-4", className)} {...props}>
        <div className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NavbarBrand />
            <NavbarSearch visible={isArticlesRoute} />
          </div>
          <div className="flex items-center gap-3">
            <NavbarActions isWriteRoute={isWriteRoute} hasContent={hasContent} />
            <NavbarUserMenu session={session} isPending={isPending} />
          </div>
        </div>
      </nav>
    )
  }
  ```
- **MIRROR**: ROUTE_FILE_NAMING, IMPORT_ALIAS_PATTERN
- **IMPORTS**: 新创建的子组件和 hooks
- **GOTCHA**: 确保 props 类型正确传递
- **VALIDATE**: 运行应用验证整体功能正常

### Task 7: 重命名 _app 路由为 _authenticated
- **ACTION**: 重命名路由文件以更清晰表达语义
- **IMPLEMENT**:
  1. 重命名 `src/routes/_app.tsx` → `src/routes/_authenticated.tsx`
  2. 重命名 `src/routes/_app/` 目录 → `src/routes/_authenticated/`
  3. 更新所有子路由文件中的 `createFileRoute("/_app/...")` → `createFileRoute("/_authenticated/...")`
- **MIRROR**: ROUTE_FILE_NAMING
- **IMPORTS**: 无需新增导入
- **GOTCHA**: 需要更新所有引用，包括内部链接
- **VALIDATE**: 运行 `pnpm tsc --noEmit` 检查类型错误

### Task 8: 重命名 _auth 路由为 _public
- **ACTION**: 重命名路由文件以更清晰表达语义
- **IMPLEMENT**:
  1. 重命名 `src/routes/_auth/route.tsx` → `src/routes/_public.tsx`
  2. 重命名 `src/routes/_auth/` 目录下的路由文件
- **MIRROR**: ROUTE_FILE_NAMING
- **IMPORTS**: 无需新增导入
- **GOTCHA**: 需要更新所有引用
- **VALIDATE**: 运行 `pnpm tsc --noEmit` 检查类型错误

### Task 9: 更新布局导出
- **ACTION**: 更新 index.ts 导出新组件
- **IMPLEMENT**:
  ```tsx
  // src/components/layout/index.ts
  export { Navbar } from "./app-navbar"
  export { NavbarBrand } from "./navbar-brand"
  export { NavbarSearch } from "./navbar-search"
  export { NavbarActions } from "./navbar-actions"
  export { NavbarUserMenu } from "./navbar-user-menu"
  export { AppSidebar } from "./app-sidebar"
  export { AppLayout } from "./app-layout"
  export { AuthLayout } from "./auth-layout"
  ```
- **MIRROR**: COMPONENT_EXPORT_PATTERN
- **IMPORTS**: 无需导入
- **GOTCHA**: 确保所有文件名匹配
- **VALIDATE**: 运行应用验证导出正确

---

## Testing Strategy

### Unit Tests

| Test | Input | Expected Output | Edge Case? |
|---|---|---|---|
| useRouteState hook | pathname='/write' | isWriteRoute=true | ✓ |
| useRouteState hook | pathname='/articles' | isArticlesRoute=true | ✓ |
| NavbarSearch | visible=false | null (不渲染) | ✓ |
| NavbarSearch | visible=true | 渲染搜索框 | ✗ |
| NavbarUserMenu | session=null | 渲染登录按钮 | ✓ |
| NavbarUserMenu | isPending=true | 渲染加载占位符 | ✓ |
| NavbarUserMenu | session exists | 渲染下拉菜单 | ✗ |

### Edge Cases Checklist
- [ ] 未登录状态导航
- [ ] 加载中状态
- [ ] 不同路由下的组件状态
- [ ] 会话过期处理
- [ ] 权限重定向

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

### Build Verification
```bash
pnpm build
```
EXPECT: Build succeeds

### Browser Validation
```bash
pnpm dev
```
EXPECT: 
1. 导航栏正常显示
2. 不同路由下搜索框正确显示/隐藏
3. 用户菜单三种状态正确
4. 所有导航链接正常工作
5. 权限重定向正常

### Manual Validation
- [ ] 访问 /articles 看到搜索框
- [ ] 访问 /write 不看到搜索框
- [ ] 未登录看到登录按钮
- [ ] 登录后看到用户头像下拉菜单
- [ ] 点击导航链接正常跳转
- [ ] 侧边栏触发器正常工作

---

## Acceptance Criteria
- [ ] 所有任务完成
- [ ] 所有验证命令通过
- [ ] Navbar 从 167 行减少到约 30 行主组件 + 4 个子组件
- [ ] 无类型错误
- [ ] 无 lint 错误
- [ ] 路由重命名完成且功能正常

## Completion Checklist
- [ ] 代码遵循 TanStack Router 模式
- [ ] 组件拆分遵循 React 最佳实践
- [ ] 无硬编码路由判断（使用 props/hooks）
- [ ] 所有状态集中在 useRouteState hook
- [ ] 无不必要的 scope additions
- [ ] Self-contained — 实施者无需额外搜索代码库

## Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| 路由重命名导致链接失效 | Medium | High | 全面检查所有 Link to="/" 引用 |
| 类型定义不匹配 | Low | Medium | 运行 tsc --noEmit 验证 |
| 子组件 props 不完整 | Low | Medium | 编写类型测试 |

## Notes

1. **TanStack Router 特点**：使用文件系统路由，路由文件名决定 URL 结构
2. **布局路由命名**：`_authenticated` 和 `_public` 比 `_app` 和 `_auth` 更语义化
3. **组件拆分原则**：每个组件专注单一职责，通过 props 接收数据
4. **状态管理**：useRouteState hook 集中管理路由相关状态，避免组件内重复逻辑
5. **渐进式重构**：可以先拆分 Navbar，再重命名路由，降低风险