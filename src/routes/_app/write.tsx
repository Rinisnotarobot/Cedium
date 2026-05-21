import { createFileRoute } from "@tanstack/react-router";
import { WritePage } from "#/components/editor";
import { requireAuth } from "#/lib/auth-guards";

export const Route = createFileRoute("/_app/write")({
  beforeLoad: ({ context }) => requireAuth(context, "/write"),
  component: WritePage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      id: typeof search.id === "string" ? search.id : undefined,
    } as { id?: string };
  },
});