import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      preserveEntrySignatures: 'strict',
    }
  },
  ssr: {
    noExternal: true
  },
  server: {
    middlewareMode: false,
  }
})
