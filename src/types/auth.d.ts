import type { BetterAuthPlugin } from 'better-auth'

declare module 'better-auth' {
  interface User {
    bio?: string
    pronouns?: string
  }
}
