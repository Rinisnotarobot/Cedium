import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { PageContainer, PageHeader } from '#/components/layout'
import { VirtualArticleList } from '#/components/articles'

// 搜索参数 schema
const searchSchema = z.object({
  q: z.string().optional().default(''),
})

export const Route = createFileRoute('/_app/search')({
  validateSearch: (search: Record<string, unknown>) => {
    return searchSchema.parse(search)
  },
  component: SearchPage,
})

function SearchPage() {
  const { q } = Route.useSearch()

  return (
    <PageContainer width="3xl" variant="spaced">
      <PageHeader
        title={q ? `搜索: ${q}` : '搜索文章'}
        description="在标题、摘要、内容和标签中查找"
      />
      {q ? (
        <VirtualArticleList
          query={q}
          containerHeight="calc(100vh - 300px)"
          emptyMessage="未找到匹配的文章"
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          请输入搜索关键词
        </div>
      )}
    </PageContainer>
  )
}