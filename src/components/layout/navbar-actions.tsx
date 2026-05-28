import { Link } from '@tanstack/react-router'
import { PenLine, Search } from 'lucide-react'
import { Button } from '#/components/ui/button'

interface NavbarActionsProps {
  isWriteRoute: boolean
}

export function NavbarActions({ isWriteRoute }: NavbarActionsProps) {
  return (
    <div className="flex items-center gap-3">
      {/* 移动端搜索图标 */}
      <Button variant="ghost" size="icon" asChild className="lg:hidden">
        <Link to="/search" search={{ q: '' }}>
          <Search className="size-5" />
        </Link>
      </Button>

      {/* 写作按钮 - 大屏显示，写作页面时隐藏 */}
      {!isWriteRoute && (
        <Button size="default" asChild className="hidden lg:flex">
          <Link to="/write">
            <PenLine className="size-4 mr-1" />
            写作
          </Link>
        </Button>
      )}
    </div>
  )
}