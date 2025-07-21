// src/api/apiClient.js
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true, // Esto es crucial para enviar cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

apiClient.interceptors.request.use(
  config => {
    console.log("[apiClient] Enviando solicitud a:", config.url);
    return config;
  },
  error => {
    console.error('[apiClient] Error en solicitud:', error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  response => {
    console.log("[apiClient] Respuesta exitosa de:", response.config.url);
    return response.data;
  },
  error => {
    console.error('[apiClient] Error en respuesta:', error);
    
    // Manejar errores 401 (No autorizado)
    if (error.response?.status === 401) {
      console.warn('[apiClient] Error de autenticación');
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;