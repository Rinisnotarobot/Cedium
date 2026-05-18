import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/")({ component: Home });

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-2xl font-semibold">Cedium</h1>
    </div>
  );
}
