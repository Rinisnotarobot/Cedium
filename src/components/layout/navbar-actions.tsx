import { Link } from '@tanstack/react-router'
import { PenLine, Send, Search } from 'lucide-react'
import { Button } from '#/components/ui/button'

interface NavbarActionsProps {
  isWriteRoute: boolean
  hasContent?: boolean
}

export function NavbarActions({ isWriteRoute, hasContent }: NavbarActionsProps) {
  return (
    <div className="flex items-center gap-3">
      {/* 移动端搜索图标 */}
      <Button variant="ghost" size="icon" asChild className="lg:hidden">
        <Link to="/search">
          <Search className="size-5" />
        </Link>
      </Button>

      {/* 写作按钮 - 大屏显示 */}
      {isWriteRoute ? (
        <Button size="default" disabled={!hasContent} className="hidden lg:flex">
          <Send className="size-4 mr-1" />
          发布
        </Button>
      ) : (
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