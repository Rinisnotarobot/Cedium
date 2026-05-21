import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/me/settings/membership")({
  component: MembershipPage,
});

function MembershipPage() {
  return (
    <div className="py-4">
      <p className="text-muted-foreground">Membership and payment settings content placeholder</p>
    </div>
  );
}