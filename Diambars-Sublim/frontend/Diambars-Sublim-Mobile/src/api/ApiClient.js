// src/api/ApiClient.js - PANEL ADMIN REACT NATIVE
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración de la API URL (puedes usar react-native-config o hardcodearlo)
// 🔥 CONFIGURADO PARA TU IP
const API_URL = __DEV__ ? 'http://192.168.0.20:4000/api' : 'https://tu-api-produccion.com/api';

// Crear instancia de axios con configuración base
const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: false, // IMPORTANTE: Panel admin NO usa cookies
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor de request para agregar el token automáticamente
apiClient.interceptors.request.use(
  async (config) => {
    console.log(`🚀 [apiClient-ADMIN-RN] Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // IMPORTANTE: Panel admin usa SOLO headers, NO cookies
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`🔑 [apiClient-ADMIN-RN] Token agregado en Authorization header`);
      } else {
        console.log(`🔑 [apiClient-ADMIN-RN] No hay token en AsyncStorage`);
      }
    } catch (error) {
      console.error(`🔑 [apiClient-ADMIN-RN] Error obteniendo token:`, error);
    }
    
    // Asegurar que no se usen cookies accidentally
    config.withCredentials = false;
    
    // Log de la data que se está enviando
    if (config.data) {
      const logData = { ...config.data };
      if (logData.password) logData.password = '***HIDDEN***';
      console.log('📤 [apiClient-ADMIN-RN] Request data:', logData);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ [apiClient-ADMIN-RN] Request error:', error);
    return Promise.reject(error);
  }
);

// Interceptor de response para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ [apiClient-ADMIN-RN] Response exitoso: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.log('📥 [apiClient-ADMIN-RN] Response data:', response.data);
    
    // Retornar directamente los datos de la respuesta
    return response.data;
  },
  async (error) => {
    console.error('❌ [apiClient-ADMIN-RN] Error en respuesta:', {
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
        console.warn('🚪 [apiClient-ADMIN-RN] Token inválido, expirado o credenciales incorrectas');
        
        // Solo limpiar token si NO estamos en login
        // En React Native, necesitarás usar navigation service o context
        try {
          await AsyncStorage.removeItem('token');
          console.log('🗑️ [apiClient-ADMIN-RN] Token limpiado de AsyncStorage');
          
          // Aquí deberías navegar a login usando tu navigation service
          // NavigationService.navigate('Login');
        } catch (storageError) {
          console.error('🗑️ [apiClient-ADMIN-RN] Error limpiando token:', storageError);
        }
        
        // Mejorar mensaje de error
        let errorMessage = 'No autorizado';
        if (data?.message?.includes('Credenciales') || 
            data?.message?.includes('incorrectas')) {
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
      console.error('🌐 [apiClient-ADMIN-RN] No response received:', error.request);
      enhancedError = new Error('Sin respuesta del servidor - Verifica que el backend esté funcionando');
      enhancedError.code = 'NETWORK_ERROR';
    } else {
      // Algo más causó el error
      console.error('⚙️ [apiClient-ADMIN-RN] Request setup error:', error.message);
      enhancedError = new Error(error.message || 'Error desconocido');
    }
    
    return Promise.reject(enhancedError);
  }
);

export default apiClient;