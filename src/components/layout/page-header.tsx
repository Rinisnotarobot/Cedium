import * as React from "react";
import { cn } from "#/lib/utils";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  children,
  className,
  ...props
}: PageHeaderProps) {
  return (
    <div className={cn("mb-8 lg:mb-12", className)} {...props}>
      <div className="mb-2">
        <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-2 text-sm lg:text-base">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 mt-4">
          {children}
        </div>
      )}
    </div>
  );
}

PageHeader.displayName = "PageHeader";