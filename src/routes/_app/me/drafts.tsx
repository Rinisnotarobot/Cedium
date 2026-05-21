import { DraftsPage } from "#/components/drafts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/me/drafts")({
  component: DraftsPage,
});