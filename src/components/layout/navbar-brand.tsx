import { Link } from '@tanstack/react-router'
import { SidebarTrigger } from '#/components/ui/sidebar'
import { BrandMark } from './brand-mark'

interface NavbarBrandProps {
  showSidebarTrigger?: boolean
}

export function NavbarBrand({ showSidebarTrigger = true }: NavbarBrandProps) {
  return (
    <div className="flex items-center gap-4">
      {showSidebarTrigger && <SidebarTrigger />}
      <Link to="/articles" className="flex items-center gap-2 text-xl font-bold text-foreground hover:text-foreground/80 transition-colors">
        <BrandMark />
        Cedium
      </Link>
    </div>
  )
}