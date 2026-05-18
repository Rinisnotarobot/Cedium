import { ProfileForm } from "#/components/auth";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/profile")({
  beforeLoad: ({ context }) => {
    if (!context.session) {
      throw redirect({ to: "/login", search: { redirect: "/profile" } });
    }
  },
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="flex items-center justify-center p-8">
      <ProfileForm className="w-full max-w-md" />
    </div>
  );
}