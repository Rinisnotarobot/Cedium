import { createFileRoute } from "@tanstack/react-router";
import { AppLayout } from "#/components/layout";
import { authClient } from "#/lib/auth-client";

export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();
    return { session };
  },
  component: AppLayout,
});