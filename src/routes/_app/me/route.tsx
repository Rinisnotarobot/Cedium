import { createFileRoute, Outlet } from "@tanstack/react-router";
import { requireAuth } from "#/lib/auth-guards";

export const Route = createFileRoute("/_app/me")({
  beforeLoad: ({ context }) => requireAuth(context, "/me"),
  component: () => <Outlet />,
});