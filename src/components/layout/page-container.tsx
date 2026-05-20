import * as React from "react";
import { cn } from "#/lib/utils";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?:
    | "sm"
    | "md"
    | "lg"
    | "xl"
    | "2xl"
    | "3xl"
    | "4xl"
    | "5xl"
    | "6xl"
    | "7xl"
    | "full";
  variant?: "default" | "spaced";
}

const maxWidthMap: Record<NonNullable<PageContainerProps["width"]>, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-full",
};

export function PageContainer({
  children,
  className,
  width = "3xl",
  variant = "default",
  ...props
}: PageContainerProps) {
  const paddingClasses =
    variant === "spaced" ? "px-6 py-8 lg:py-12" : "px-6 py-8";

  return (
    <div className={cn("min-h-screen bg-background", className)} {...props}>
      <div
        className={cn("mx-auto w-full ", maxWidthMap[width], paddingClasses)}
      >
        {children}
      </div>
    </div>
  );
}

PageContainer.displayName = "PageContainer";
