import { createFileRoute, redirect } from "@tanstack/react-router";
import { WritePage } from "#/components/editor";

export const Route = createFileRoute("/_app/write")({
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login", search: { redirect: "/write" } });
    }
  },
  component: WritePage,
});