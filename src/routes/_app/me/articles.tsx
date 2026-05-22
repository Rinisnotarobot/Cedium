import { createFileRoute } from "@tanstack/react-router"
import { ArticlesManagePage } from "#/components/articles/articles-manage-page"

export const Route = createFileRoute("/_app/me/articles")({
  component: ArticlesManagePage,
})