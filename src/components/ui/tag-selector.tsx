"use client"

import * as React from "react"
import { X, Plus, Check } from "lucide-react"
import { cn } from "#/lib/utils"
import { Badge } from "#/components/ui/badge"
import { Button } from "#/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "#/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "#/components/ui/command"
import { useAllTags } from "#/hooks/use-tag-queries"
import { useCreateTag } from "#/hooks/mutations/use-tag-mutations"

interface TagSelectorProps {
  selectedTags: string[] // tag slugs
  onChange: (tags: string[]) => void
  maxTags?: number
  disabled?: boolean
  className?: string
}

/**
 * 标签选择器组件
 * - 支持多选、搜索、创建新标签
 * - 使用 Popover + Command 组合模式
 */
export function TagSelector({
  selectedTags,
  onChange,
  maxTags = 5,
  disabled = false,
  className,
}: TagSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [inputValue, setInputValue] = React.useState("")

  const { data: allTags, isLoading } = useAllTags()
  const createTag = useCreateTag()

  // 根据输入值过滤标签
  const filteredTags = React.useMemo(() => {
    if (!allTags) return []
    if (!inputValue.trim()) return allTags

    const lowerInput = inputValue.toLowerCase()
    return allTags.filter(tag =>
      tag.name.toLowerCase().includes(lowerInput) ||
      tag.slug.toLowerCase().includes(lowerInput)
    )
  }, [allTags, inputValue])

  // 已选中的标签对象
  const selectedTagObjects = React.useMemo(() => {
    if (!allTags) return []
    return allTags.filter(tag => selectedTags.includes(tag.slug))
  }, [allTags, selectedTags])

  // 判断是否可以添加更多标签
  const canAddMore = selectedTags.length < maxTags

  // 判断输入的标签名是否已存在
  const exactMatch = allTags?.find(
    tag => tag.name.toLowerCase() === inputValue.toLowerCase().trim()
  )

  // 选择标签
  const handleSelect = (slug: string) => {
    if (selectedTags.includes(slug)) {
      // 取消选择
      onChange(selectedTags.filter(s => s !== slug))
    } else if (canAddMore) {
      // 添加选择
      onChange([...selectedTags, slug])
    }
    setInputValue("")
    setOpen(false)
  }

  // 创建新标签
  const handleCreate = () => {
    const name = inputValue.trim()
    if (!name || !canAddMore) return

    // 如果已存在，直接选择
    if (exactMatch) {
      handleSelect(exactMatch.slug)
      return
    }

    // 创建新标签
    createTag.mutate(
      { name },
      {
        onSuccess: (tag) => {
          onChange([...selectedTags, tag.slug])
          setInputValue("")
          setOpen(false)
        },
      }
    )
  }

  // 移除标签
  const handleRemove = (slug: string) => {
    onChange(selectedTags.filter(s => s !== slug))
  }

  return (
    <div className={cn("space-y-2", className)}>
      {/* 已选标签显示 */}
      {selectedTagObjects.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTagObjects.map(tag => (
            <Badge
              key={tag.slug}
              variant="outline"
              className="gap-1 pr-1"
            >
              <span className="truncate">{tag.name}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(tag.slug)}
                  className="ml-1 rounded-sm opacity-70 hover:opacity-100"
                >
                  <X className="h-3 w-3" />
                  <span className="sr-only">移除 {tag.name}</span>
                </button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* 选择器触发按钮 */}
      {!disabled && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 justify-start text-muted-foreground"
              disabled={!canAddMore}
            >
              <Plus className="h-4 w-4 mr-2" />
              {canAddMore
                ? `添加标签 (${selectedTags.length}/${maxTags})`
                : "已达上限"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0" align="start">
            <Command shouldFilter={false}>
              <CommandInput
                placeholder="搜索或创建标签..."
                value={inputValue}
                onValueChange={setInputValue}
              />
              <CommandList>
                {isLoading ? (
                  <CommandEmpty>加载中...</CommandEmpty>
                ) : (
                  <>
                    <CommandEmpty>
                      {inputValue.trim() ? (
                        <button
                          type="button"
                          onClick={handleCreate}
                          className="w-full text-left px-2 py-1.5 text-sm hover:bg-accent rounded-sm"
                        >
                          创建 "{inputValue.trim()}"
                        </button>
                      ) : (
                        "暂无标签"
                      )}
                    </CommandEmpty>
                    {filteredTags.length > 0 && (
                      <CommandGroup heading="可选标签">
                        {filteredTags.map(tag => (
                          <CommandItem
                            key={tag.slug}
                            value={tag.slug}
                            onSelect={() => handleSelect(tag.slug)}
                          >
                            <Check
                              className={cn(
                                "h-4 w-4 mr-2",
                                selectedTags.includes(tag.slug)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <span className="truncate">{tag.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}