import { ProfilePage } from "#/components/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/me/profile")({
  component: ProfilePage,
});