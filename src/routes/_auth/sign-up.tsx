import { SignupForm } from "#/components/auth";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/sign-up")({
  component: SignUpPage,
});

function SignUpPage() {
  return <SignupForm className="w-full max-w-sm" />;
}
