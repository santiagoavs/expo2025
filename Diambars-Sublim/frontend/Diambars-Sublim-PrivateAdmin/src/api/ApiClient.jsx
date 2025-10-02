// src/api/ApiClient.js - PANEL ADMIN CORREGIDO
import axios from 'axios';
import { getApiUrl, getConfig } from '../../config.js';

// Crear instancia de axios con configuración base
// CONFIGURACIÓN CENTRALIZADA: Usa config.js para manejar URLs de manera segura
const getBaseURL = () => {
  const config = getConfig();
  console.log('🔧 [ApiClient] Configuración:', {
    environment: config.isDevelopment ? 'development' : 'production',
    apiUrl: config.apiUrl
  });
  return config.apiUrl;
};

const config = getConfig();

const apiClient = axios.create({
  baseURL: getBaseURL(),
  withCredentials: false, // IMPORTANTE: Panel admin NO usa cookies
  timeout: config.app.timeout, // Timeout configurado centralmente
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor de request para agregar el token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.withCredentials = false;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de response para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    let enhancedError;
    
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        if (!window.location.pathname.includes('/login')) {
          localStorage.removeItem('token');
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
        
        let errorMessage = 'No autorizado';
        if (data?.message?.includes('Credenciales') || 
            data?.message?.includes('incorrectas') ||
            window.location.pathname.includes('/login')) {
          errorMessage = 'Credenciales incorrectas';
        } else if (data?.message?.includes('Token')) {
          errorMessage = 'Sesión expirada';
        }
        
        enhancedError = new Error(errorMessage);
      } else if (status === 400) {
        const errorMsg = data?.message || data?.error || 'Solicitud incorrecta';
        enhancedError = new Error(errorMsg);
        
        if (data?.errors && Array.isArray(data.errors)) {
          enhancedError.validationErrors = data.errors;
        }
      } else if (status === 403) {
        enhancedError = new Error(data?.message || 'Acceso prohibido - Se requieren permisos de empleado');
      } else if (status === 404) {
        enhancedError = new Error(data?.message || 'Recurso no encontrado');
      } else if (status === 422) {
        enhancedError = new Error(data?.message || 'Datos de entrada inválidos');
      } else if (status >= 500) {
        enhancedError = new Error(data?.message || 'Error del servidor');
      } else {
        enhancedError = new Error(data?.message || `Error ${status}`);
      }
      
      enhancedError.response = error.response;
      enhancedError.status = status;
      enhancedError.data = data;
    } else if (error.request) {
      enhancedError = new Error('Sin respuesta del servidor - Verifica que el backend esté funcionando');
      enhancedError.code = 'NETWORK_ERROR';
    } else {
      enhancedError = new Error(error.message || 'Error desconocido');
    }
    
    return Promise.reject(enhancedError);
  }
);

export default apiClient;