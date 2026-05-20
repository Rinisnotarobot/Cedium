import { createFileRoute } from "@tanstack/react-router";
import { FavoritesPage } from "#/components/favorites";
import { requireAuth } from "#/lib/auth-guards";

export const Route = createFileRoute("/_app/favorites")({
  beforeLoad: ({ context }) => requireAuth(context, "/favorites"),
  component: FavoritesPage,
});