import { createFileRoute } from "@tanstack/react-router";
import { WritePage } from "#/components/editor";
import { requireAuth } from "#/lib/auth-guards";

export const Route = createFileRoute("/_app/write")({
  beforeLoad: ({ context }) => requireAuth(context, "/write"),
  component: WritePage,
});