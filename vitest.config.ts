import { defineConfig } from 'vitest/config'
import { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/test/**',
        'src/generated/**',
        'src/components/ui/**',  // Shadcn/UI library components (third-party)
        '**/*.d.ts',
        '**/*.config.ts',
        '**/index.ts',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 74,  // UI conditional rendering branches hard to cover in test env
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '#': path.resolve(__dirname, './src'),
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    babel({ presets: [reactCompilerPreset()] }),
  ],
})