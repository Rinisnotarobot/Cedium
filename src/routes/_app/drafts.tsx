import { createFileRoute } from "@tanstack/react-router";
import { DraftsPage } from "#/components/drafts";
import { requireAuth } from "#/lib/auth-guards";

export const Route = createFileRoute("/_app/drafts")({
  beforeLoad: ({ context }) => requireAuth(context, "/drafts"),
  component: DraftsPage,
});