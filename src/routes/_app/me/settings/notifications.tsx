import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/me/settings/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <div className="py-4">
      <p className="text-muted-foreground">Notifications settings content placeholder</p>
    </div>
  );
}