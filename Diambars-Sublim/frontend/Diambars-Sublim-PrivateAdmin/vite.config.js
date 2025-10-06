import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // cambiar a https://expo2025-8bjn.onrender.com para producción
        changeOrigin: true,
        secure: false, // cambiar a true para producción
      }
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false
  },
  optimizeDeps: {
    include: ['konva', 'react-konva']
  },
  define: {
    global: 'globalThis'
  }
})