import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://100-days-of-code-2026.pages.dev',
        changeOrigin: true,
      }
    }
  }
})
