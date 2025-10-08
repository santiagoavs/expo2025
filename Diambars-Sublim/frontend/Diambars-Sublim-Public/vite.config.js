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

  // Determine proxy target based on backend mode
  const backendMode = env.VITE_BACKEND_MODE || 'render';
  const proxyTarget = backendMode === 'local' 
    ? 'http://localhost:4000'
    : 'https://expo2025-8bjn.onrender.com';

  console.log(`🔧 [Vite] Backend mode: ${backendMode}`);
  console.log(`🎯 [Vite] Proxy target: ${proxyTarget}`);

  return {
    base: './',
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: backendMode !== 'local',
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