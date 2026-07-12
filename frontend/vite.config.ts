import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // Project lives inside OneDrive, whose sync locks files and makes Vite's
    // native fs watcher crash with EBUSY. Polling avoids native fs.watch.
    watch: {
      usePolling: true,
      interval: 300,
    },
  },
})
