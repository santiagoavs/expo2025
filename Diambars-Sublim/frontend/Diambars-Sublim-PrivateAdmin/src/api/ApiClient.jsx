// src/api/ApiClient.js - PANEL ADMIN CORREGIDO
import axios from 'axios';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: false, // IMPORTANTE: Panel admin NO usa cookies
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor de request para agregar el token automáticamente
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🚀 [apiClient-ADMIN] Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // IMPORTANTE: Panel admin usa SOLO headers, NO cookies
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🔑 [apiClient-ADMIN] Token agregado en Authorization header`);
    } else {
      console.log(`🔑 [apiClient-ADMIN] No hay token en localStorage`);
    }
    
    // Asegurar que no se usen cookies accidentally
    config.withCredentials = false;
    
    // Log de la data que se está enviando
    if (config.data) {
      const logData = { ...config.data };
      if (logData.password) logData.password = '***HIDDEN***';
      console.log('📤 [apiClient-ADMIN] Request data:', logData);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [apiClient-ADMIN] Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor de response para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [apiClient-ADMIN] Response exitoso: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log('📥 [apiClient-ADMIN] Response data:', response.data);
    
    // Retornar directamente los datos de la respuesta
    return response.data;
  },
  (error) => {
    console.error('❌ [apiClient-ADMIN] Error en respuesta:', {
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
        console.warn('🚪 [apiClient-ADMIN] Token inválido, expirado o credenciales incorrectas');
        
        // Solo limpiar token si NO estamos en login
        if (!window.location.pathname.includes('/login')) {
          console.log('🗑️ [apiClient-ADMIN] Limpiando token inválido');
          localStorage.removeItem('token');
          
          setTimeout(() => {
            window.location.href = '/login';
          }, 1000);
        }
        
        // Mejorar mensaje de error
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
        // Error de validación o datos incorrectos
        const errorMsg = data?.message || data?.error || 'Solicitud incorrecta';
        enhancedError = new Error(errorMsg);
        
        // Si hay errores de validación específicos, incluirlos
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
      // La solicitud fue hecha pero no hubo respuesta
      console.error('🌐 [apiClient-ADMIN] No response received:', error.request);
      enhancedError = new Error('Sin respuesta del servidor - Verifica que el backend esté funcionando');
      enhancedError.code = 'NETWORK_ERROR';
    } else {
      // Algo más causó el error
      console.error('⚙️ [apiClient-ADMIN] Request setup error:', error.message);
      enhancedError = new Error(error.message || 'Error desconocido');
    }
    
    return Promise.reject(enhancedError);
  }
);

export default apiClient;