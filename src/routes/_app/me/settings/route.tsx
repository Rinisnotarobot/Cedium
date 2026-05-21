import { createFileRoute, Outlet } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "#/components/layout";
import { SettingsTabs } from "#/components/settings";

export const Route = createFileRoute("/_app/me/settings")({
  component: SettingsLayout,
});

function SettingsLayout() {
  return (
    <PageContainer width="3xl">
      <PageHeader title="设置" />
      <SettingsTabs />
      <Outlet />
    </PageContainer>
  );
}
