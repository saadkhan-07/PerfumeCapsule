import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Test-only config (kept separate from vite.config.ts so the app build is
// untouched). Tests run in jsdom with React Testing Library.
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
