import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { TooltipProvider } from "#/components/ui/tooltip";
import { Toaster } from "#/components/ui/sonner";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
import { ThemeProvider } from "#/components/theme";
import { NotFound } from "#/components/errors";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Cedium — 让思想自由流淌",
      },
      {
        name: "description",
        content:
          "Cedium 为创作者打造的极简写作平台。极简编辑器，实时保存，专注写作本身。",
      },
      {
        name: "theme-color",
        content: "#c4633c",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:title",
        content: "Cedium — 让思想自由流淌",
      },
      {
        property: "og:description",
        content:
          "Cedium 为创作者打造的极简写作平台。极简编辑器，实时保存，专注写作本身。",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/favicon.svg",
        type: "image/svg+xml",
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <TooltipProvider>
          <ThemeProvider defaultTheme="system" storageKey="theme">
            {children}
          </ThemeProvider>
        </TooltipProvider>
        <Toaster />
        {/* @tanstack/devtools-vite (vite.config) strips this from production
            builds automatically, so no manual env guard is needed here. */}
        <TanStackDevtools
          config={{
            position: "bottom-right",
          }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
