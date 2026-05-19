import { createFileRoute } from "@tanstack/react-router"
import { ArticlesPage } from "#/components/home"

export const Route = createFileRoute("/_app/articles")({
  component: ArticlesPage,
})