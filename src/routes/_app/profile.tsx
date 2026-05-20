import { ProfilePage } from "#/components/auth";
import { createFileRoute } from "@tanstack/react-router";
import { requireAuth } from "#/lib/auth-guards";

export const Route = createFileRoute("/_app/profile")({
  beforeLoad: ({ context }) => requireAuth(context, "/profile"),
  component: ProfilePage,
});