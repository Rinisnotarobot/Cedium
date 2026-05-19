import { createFileRoute } from "@tanstack/react-router"
import { StarfieldHero } from "#/components/home"

export const Route = createFileRoute("/")({
  component: StarfieldHero,
})