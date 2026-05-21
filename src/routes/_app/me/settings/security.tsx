import { createFileRoute } from "@tanstack/react-router";
import { SecuritySettings } from "#/components/settings";

export const Route = createFileRoute("/_app/me/settings/security")({
  component: SecurityPage,
});

function SecurityPage() {
  return <SecuritySettings />;
}