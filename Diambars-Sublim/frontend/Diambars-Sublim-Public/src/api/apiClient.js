// src/api/apiClient.js - VERSION CORREGIDA
import axios from 'axios';

const computeBaseURL = () => {
  try {
    // Check for backend mode override
    const backendMode = import.meta.env.VITE_BACKEND_MODE;
    
    if (backendMode === 'local') {
      console.log('🏠 [apiClient] Using LOCAL backend mode');
      return 'http://localhost:4000/api';
    } else if (backendMode === 'render') {
      console.log('☁️ [apiClient] Using RENDER backend mode');
      return 'https://expo2025-8bjn.onrender.com/api';
    }
    
    // Fallback to VITE_API_URL if set
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && typeof envUrl === 'string') {
      const trimmed = envUrl.replace(/\/$/, '');
      const finalUrl = trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
      console.log('🔧 [apiClient] Using VITE_API_URL:', finalUrl);
      return finalUrl;
    }
  } catch (error) {
    console.warn('⚠️ [apiClient] Error reading environment variables:', error);
  }
  
  // Final fallback based on environment
  const isProduction = import.meta.env.PROD || import.meta.env.NODE_ENV === 'production';
  
  if (isProduction) {
    console.log('🌐 [apiClient] Production fallback - using Render');
    return 'https://expo2025-8bjn.onrender.com/api';
  } else {
    console.log('🔧 [apiClient] Development fallback - using proxy');
    return '/api';
  }
};

const apiClient = axios.create({
  baseURL: computeBaseURL(),
  withCredentials: true,
  timeout: 100000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

console.log('🔧 [apiClient] Configuración inicial:', {
  baseURL: apiClient.defaults.baseURL,
  withCredentials: apiClient.defaults.withCredentials,
  timeout: apiClient.defaults.timeout
});

// Interceptor de request MUY detallado
apiClient.interceptors.request.use(
  config => {
    console.log('🚀 [apiClient] === REQUEST START ===');
    try {
      const full = new URL(config.url, config.baseURL || window.location.origin).toString();
      console.log('🎯 [apiClient] URL completa:', full);
    } catch {
      console.log('🎯 [apiClient] URL (raw):', config.baseURL, config.url);
    }
    console.log('🔧 [apiClient] Método:', config.method?.toUpperCase());
    console.log('📋 [apiClient] Headers enviados:', config.headers);
    console.log('🍪 [apiClient] WithCredentials:', config.withCredentials);
    
    // Detectar si estamos en rutas del dashboard admin
    const isDashboardRoute = window.location.pathname.includes('/dashboard') || 
                            window.location.pathname.includes('/admin') ||
                            config.url?.includes('/employees');
    
    if (isDashboardRoute) {
      // Dashboard usa token en localStorage
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 [apiClient] Token agregado (dashboard)');
      } else {
        console.log('🔑 [apiClient] No hay token en localStorage para dashboard');
      }
    } else {
      // MOBILE FIX: Para app pública, priorizar cookies pero agregar token como fallback para iOS
      // iOS Safari puede tener problemas con cookies en ciertos contextos
      const authToken = localStorage.getItem('authToken');
      
      if (authToken) {
        // Agregar token como fallback para iOS donde las cookies pueden fallar
        config.headers.Authorization = `Bearer ${authToken}`;
        console.log('📱 [apiClient] Token iOS fallback agregado');
      } else {
        console.log('🍪 [apiClient] App pública - usando solo cookies');
      }
    }
    
    // Log de datos enviados (sin mostrar passwords)
    if (config.data) {
      const dataToLog = { ...config.data };
      if (dataToLog.password) {
        dataToLog.password = '***HIDDEN***';
      }
      console.log('📤 [apiClient] Datos enviados:', dataToLog);
    }
    
    console.log('🚀 [apiClient] === REQUEST END ===');
    return config;
  },
  error => {
    console.error('❌ [apiClient] Error en configuración de request:', error);
    return Promise.reject(error);
  }
);

// Interceptor de response MUY detallado
apiClient.interceptors.response.use(
  response => {
    console.log('✅ [apiClient] === RESPONSE SUCCESS START ===');
    console.log('🎯 [apiClient] URL:', response.config.url);
    console.log('📊 [apiClient] Status:', response.status);
    console.log('📋 [apiClient] Headers recibidos:', response.headers);
    console.log('🍪 [apiClient] Set-Cookie header:', response.headers['set-cookie']);
    console.log('📥 [apiClient] Datos recibidos:', response.data);
    console.log('✅ [apiClient] === RESPONSE SUCCESS END ===');
    
    // Retornar los datos directamente para facilitar el uso
    return response.data;
  },
  error => {
    console.error('❌ [apiClient] === RESPONSE ERROR START ===');
    try {
      const failedFull = new URL(error.config?.url || '', error.config?.baseURL || window.location.origin).toString();
      console.error('🎯 [apiClient] URL que falló:', failedFull);
    } catch {
      console.error('🎯 [apiClient] URL que falló:', error.config?.url);
    }
    console.error('🔧 [apiClient] Método:', error.config?.method?.toUpperCase());
    console.error('📊 [apiClient] Status:', error.response?.status);
    console.error('📋 [apiClient] Status Text:', error.response?.statusText);
    console.error('📋 [apiClient] Response Headers:', error.response?.headers);
    console.error('📥 [apiClient] Error Data:', error.response?.data);
    console.error('💬 [apiClient] Error Message:', error.message);
    console.error('🔗 [apiClient] Error Code:', error.code);
    
    // Verificar si es un problema de CORS
    if (!error.response && error.message.includes('Network Error')) {
      console.error('🌐 [apiClient] Posible problema de CORS o servidor no disponible');
    }
    
    // Crear un error más descriptivo
    let enhancedError;
    
    if (error.response) {
      const { status, data } = error.response;
      
      // Manejar errores 401 (No autorizado)
      if (status === 401) {
        console.warn('🚪 [apiClient] Error de autenticación detectado');
        
        // Para app pública, limpiar cookies corruptas
        const isPublicApp = !window.location.pathname.includes('/dashboard') && 
                          !window.location.pathname.includes('/admin');
        
        if (isPublicApp) {
          console.log('🗑️ [apiClient] Limpiando cookies corruptas en app pública');
          // Intentar limpiar cookie authToken
          document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;';
        } else {
          // Solo limpiar token si estamos en rutas del dashboard
          const token = localStorage.getItem('token');
          if (token) {
            localStorage.removeItem('token');
            console.log('🗑️ [apiClient] Token de dashboard limpiado');
            
            setTimeout(() => {
              window.location.href = '/login';
            }, 1000);
          }
        }
        
        enhancedError = new Error(data?.message || 'No autorizado');
      } else if (status === 400) {
        // Error de validación o datos incorrectos
        enhancedError = new Error(data?.message || 'Solicitud incorrecta');
        
        // Agregar errores de validación si existen
        if (data?.errors && Array.isArray(data.errors)) {
          enhancedError.validationErrors = data.errors;
        }
      } else if (status === 403) {
        enhancedError = new Error(data?.message || 'Acceso prohibido');
      } else if (status === 404) {
        enhancedError = new Error(data?.message || 'Recurso no encontrado');
      } else if (status === 409) {
        enhancedError = new Error(data?.message || 'Conflicto de datos');
      } else if (status === 422) {
        enhancedError = new Error(data?.message || 'Datos de entrada inválidos');
      } else if (status === 429) {
        enhancedError = new Error(data?.message || 'Demasiadas solicitudes. Espera un momento.');
      } else if (status >= 500) {
        enhancedError = new Error(data?.message || 'Error del servidor');
      } else {
        enhancedError = new Error(data?.message || `Error ${status}`);
      }
      
      enhancedError.response = error.response;
      enhancedError.status = status;
      enhancedError.data = data;
    } else if (error.request) {
      // La solicitud fue hecha pero no hubo respuesta
      console.error('🌐 [apiClient] No response received:', error.request);
      enhancedError = new Error('Sin respuesta del servidor - Verifica que el backend esté corriendo en https://expo2025-8bjn.onrender.com');
      enhancedError.code = 'NETWORK_ERROR';
    } else {
      // Algo más causó el error
      console.error('⚙️ [apiClient] Request setup error:', error.message);
      enhancedError = new Error(error.message || 'Error desconocido');
    }
    
    console.error('❌ [apiClient] === RESPONSE ERROR END ===');
    return Promise.reject(enhancedError);
  }
);

export default apiClient;