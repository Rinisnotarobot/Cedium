import { defineConfig } from "vite";
import { devtools } from "@tanstack/devtools-vite";
import { nitro } from "nitro/vite";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import viteReact, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      importProtection: {
        client: {
          specifiers: [
            '@prisma/client',
            '@prisma/adapter-pg',
            'better-auth',
          ],
          files: [
            '**/db.ts',
            '**/lib/auth.ts',
            '**/lib/r2.ts',
            '**/lib/email.ts',
          ],
        },
      },
    }),
    nitro(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
});

export default config;
