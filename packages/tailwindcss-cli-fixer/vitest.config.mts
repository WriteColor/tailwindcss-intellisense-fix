import { defineConfig } from 'vitest/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@tailwindcss/class-fixer': path.resolve(__dirname, '../tailwindcss-class-fixer/src/index.ts'),
    },
  },
  test: {
    testTimeout: 15000,
  },
})
