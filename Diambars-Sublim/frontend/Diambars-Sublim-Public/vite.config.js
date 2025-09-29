import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import terser from '@rollup/plugin-terser';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  const envWithProcessPrefix = {};
  Object.keys(env).forEach((key) => {
    if (key.startsWith('VITE_')) {
      envWithProcessPrefix[`import.meta.env.${key}`] = JSON.stringify(env[key]);
    }
  });

  return {
    base: './',
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: 'https://expo2025-8bjn.onrender.com',
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode === 'development',
      minify: mode === 'production' ? 'terser' : false,
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        plugins: [terser()]
      }
    },
    define: {
      ...envWithProcessPrefix,
      'process.env.NODE_ENV': JSON.stringify(mode)
    }
  };
});