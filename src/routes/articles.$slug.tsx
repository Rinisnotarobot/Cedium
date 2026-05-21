import { createFileRoute } from "@tanstack/react-router"
import { ArticleDetailPage } from "#/components/articles"

export const Route = createFileRoute("/articles/$slug")({
  component: ArticleDetailPage,
})