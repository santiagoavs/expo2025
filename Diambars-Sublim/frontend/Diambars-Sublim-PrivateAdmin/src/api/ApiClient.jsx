// src/api/apiClient.js
import axios from 'axios';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor de request para agregar el token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 [apiClient] Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 [apiClient] Token agregado`);
    }
    
    // Log de la data que se está enviando
    if (config.data) {
      console.log('📤 [apiClient] Request data:', config.data);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [apiClient] Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor de response para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [apiClient] Response exitoso: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log('📥 [apiClient] Response data:', response.data);
    
    // Retornar directamente los datos de la respuesta
    return response.data;
  },
  (error) => {
    console.error('❌ [apiClient] Error en respuesta:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method?.toUpperCase(),
      data: error.response?.data,
      message: error.message
    });
    
    // Crear un error más detallado
    let enhancedError;
    
    if (error.response) {
      // El servidor respondió con un código de error
      const { status, data } = error.response;
      
      if (status === 401) {
        // Error de autenticación
        console.warn('🚪 [apiClient] Token inválido o expirado, limpiando...');
        localStorage.removeItem('token');
        enhancedError = new Error(data?.message || 'No autorizado');
        
        // Solo redirigir si no estamos en rutas de auth
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/recovery') && 
            !window.location.pathname.includes('/code-confirmation') && 
            !window.location.pathname.includes('/new-password')) {
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
      } else if (status === 400) {
        // Error de validación o datos incorrectos
        const errorMsg = data?.message || data?.error || 'Solicitud incorrecta';
        enhancedError = new Error(errorMsg);
        
        // Si hay errores de validación específicos, incluirlos
        if (data?.errors && Array.isArray(data.errors)) {
          enhancedError.validationErrors = data.errors;
        }
      } else if (status === 403) {
        enhancedError = new Error(data?.message || 'Acceso prohibido');
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
      // La solicitud fue hecha pero no hubo respuesta
      console.error('🌐 [apiClient] No response received:', error.request);
      enhancedError = new Error('Sin respuesta del servidor - Verifica tu conexión');
      enhancedError.code = 'NETWORK_ERROR';
    } else {
      // Algo más causó el error
      console.error('⚙️ [apiClient] Request setup error:', error.message);
      enhancedError = new Error(error.message || 'Error desconocido');
    }
    
    return Promise.reject(enhancedError);
  }
);

export default apiClient;