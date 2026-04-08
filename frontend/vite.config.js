import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
  },
  server: {
    proxy: {
      '/generate': 'http://127.0.0.1:5000',
      '/health': 'http://127.0.0.1:5000',
    }
  }
})