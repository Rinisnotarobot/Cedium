import { createFileRoute } from "@tanstack/react-router";
import { ArticleEditor } from "#/components/editor";

export const Route = createFileRoute("/_app/write")({
  component: WritePage,
});

function WritePage() {
  return <ArticleEditor />;
}
