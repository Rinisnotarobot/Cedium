import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Search } from 'lucide-react'
import { Input } from '#/components/ui/input'

interface NavbarSearchProps {
  visible?: boolean
}

export function NavbarSearch({ visible = true }: NavbarSearchProps) {
  if (!visible) return null

  const navigate = useNavigate()
  const [inputValue, setInputValue] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const searchTerm = inputValue.trim()
    if (searchTerm) {
      navigate({
        to: '/search',
        search: { q: searchTerm }
      })
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative max-w-md hidden lg:block">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
      <Input
        type="search"
        placeholder="搜索文章..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-9 w-full rounded-full"
      />
    </form>
  )
}