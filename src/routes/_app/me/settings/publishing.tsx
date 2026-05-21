import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/me/settings/publishing")({
  component: PublishingPage,
});

function PublishingPage() {
  return (
    <div className="py-4">
      <p className="text-muted-foreground">Publishing settings content placeholder</p>
    </div>
  );
}