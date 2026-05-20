import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/me/")({
  component: () => <Navigate to="/me/profile" />,
});