import { createFileRoute } from "@tanstack/react-router";
import { AccountSettings } from "#/components/settings";

export const Route = createFileRoute("/_app/me/settings/")({
  component: AccountPage,
});

function AccountPage() {
  return <AccountSettings />;
}
