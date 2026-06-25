import { cn } from "#/lib/utils"

/** Cedium 品牌标，与 public/favicon.svg 同款（暖色圆角方块 + "C"）。 */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-6", className)}
      fill="none"
      aria-hidden
    >
      <rect width="32" height="32" rx="7" fill="var(--primary)" />
      <path
        d="M22 11.2C20.6 9.8 18.6 9 16.4 9C12 9 8.6 12.1 8.6 16.4C8.6 20.7 12 23.8 16.4 23.8C18.6 23.8 20.6 23 22 21.6"
        stroke="var(--primary-foreground)"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  )
}
