import { createFileRoute } from "@tanstack/react-router";
import { WritePage } from "#/components/editor";
import { requireEmailVerified } from "#/lib/auth-guards";
import { getArticleByIdFn } from "#/data/articles";

export const Route = createFileRoute("/_app/write")({
  beforeLoad: ({ context }) => requireEmailVerified(context, "/write"),
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: typeof search.id === "string" ? search.id : undefined,
    } as { id?: string };
  },
  loaderDeps: ({ search: { id } }) => ({ id }),
  loader: async ({ deps: { id } }) => {
    if (id) {
      const article = await getArticleByIdFn({ data: { id } });
      return { article };
    }
    return { article: null };
  },
  component: WritePage,
});