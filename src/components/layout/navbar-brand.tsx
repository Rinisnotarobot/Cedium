import { Link } from '@tanstack/react-router'
import { SidebarTrigger } from '#/components/ui/sidebar'

interface NavbarBrandProps {
  showSidebarTrigger?: boolean
}

export function NavbarBrand({ showSidebarTrigger = true }: NavbarBrandProps) {
  return (
    <div className="flex items-center gap-4">
      {showSidebarTrigger && <SidebarTrigger />}
      <Link to="/articles" className="text-xl font-bold text-foreground hover:text-foreground/80 transition-colors">
        Cedium
      </Link>
    </div>
  )
}