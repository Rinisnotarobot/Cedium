import { createFileRoute } from "@tanstack/react-router"
import { PageContainer, PageHeader } from "#/components/layout"
import { VirtualArticleList } from "#/components/articles/virtual-article-list"

export const Route = createFileRoute("/_app/articles")({
  component: ArticlesPage,
})

function ArticlesPage() {
  return (
    <PageContainer width="3xl" variant="spaced">
      <PageHeader title="文章" description="探索技术、架构与工程实践" />
      <VirtualArticleList containerHeight="calc(100vh - 300px)" />
    </PageContainer>
  )
}