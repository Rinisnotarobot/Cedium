import { ProfileForm } from "#/components/profile-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  return (
    <div className="flex items-center justify-center p-8">
      <ProfileForm className="w-full max-w-md" />
    </div>
  );
}