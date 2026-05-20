import { ProfilePage } from "#/components/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/profile")({
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login", search: { redirect: "/profile" } });
    }
  },
  component: ProfilePage,
});