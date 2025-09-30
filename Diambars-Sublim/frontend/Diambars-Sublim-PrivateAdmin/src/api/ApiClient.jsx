// src/api/ApiClient.js - PANEL ADMIN CORREGIDO
import axios from 'axios';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: false, // IMPORTANTE: Panel admin NO usa cookies
  timeout: 60000, // 60 segundos para manejar respuestas grandes
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