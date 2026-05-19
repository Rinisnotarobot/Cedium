import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'
import events from 'events'

// 增加 EventTarget 监听器限制（消除 TanStack DevTools 警告）
events.setMaxListeners(20)

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
})

export default config
