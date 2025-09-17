import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://expo2025-8bjn.onrender.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})