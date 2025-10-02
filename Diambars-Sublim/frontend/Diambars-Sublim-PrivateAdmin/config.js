// Configuración centralizada para el panel administrativo
// Este archivo maneja las URLs de manera segura

const config = {
  // URLs del backend
  development: {
    apiUrl: '/api', // Proxy de Vite redirige a https://expo2025-8bjn.onrender.com
    baseUrl: 'http://localhost:5173'
  },
  
  production: {
    apiUrl: 'https://expo2025-8bjn.onrender.com/api',
    baseUrl: 'https://tu-frontend-en-render.com' // Cambiar por tu URL de frontend en Render
  },
  
  // Configuración de la aplicación
  app: {
    name: 'Diambars Sublim Admin',
    version: '1.0.0',
    timeout: 30000 // 30 segundos
  }
};

// Función para obtener la configuración según el entorno
export const getConfig = () => {
  const isDev = import.meta.env.DEV;
  const env = isDev ? 'development' : 'production';
  
  return {
    ...config[env],
    app: config.app,
    isDevelopment: isDev,
    isProduction: !isDev
  };
};

// Función para obtener la URL del API
export const getApiUrl = () => {
  const config = getConfig();
  return config.apiUrl;
};

// Función para obtener la URL base
export const getBaseUrl = () => {
  const config = getConfig();
  return config.baseUrl;
};

export default config;
