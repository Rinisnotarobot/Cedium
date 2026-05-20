import { Search } from 'lucide-react'
import { Input } from '#/components/ui/input'

interface NavbarSearchProps {
  visible?: boolean
}

export function NavbarSearch({ visible = true }: NavbarSearchProps) {
  if (!visible) return null

  return (
    <div className="relative max-w-md hidden lg:block">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
      <Input type="search" placeholder="搜索..." className="pl-9 w-full rounded-full" />
    </div>
  )
}