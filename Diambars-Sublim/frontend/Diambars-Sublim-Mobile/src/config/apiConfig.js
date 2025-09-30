// src/config/apiConfig.js - Configuración de API para React Native

/**
 * Configuración centralizada de URLs de API para la app móvil
 * - Detecta automáticamente el entorno (desarrollo vs producción)
 * - Permite configuración manual de IP para desarrollo
 */

// Detectar si estamos en desarrollo
const isDevelopment = __DEV__;

// IP local de tu computadora (cambia esta por tu IP real)
const LOCAL_IP = '192.168.1.5';

// Configuración de URLs
const API_CONFIG = {
  development: {
    // Para desarrollo local con emulador/dispositivo físico
    baseURL: `http://${LOCAL_IP}:4000/api`,
    timeout: 15000,
    retryAttempts: 3
  },
  production: {
    // Para producción (cuando la app esté en las tiendas)
    baseURL: 'https://expo2025-8bjn.onrender.com/api',
    timeout: 30000,
    retryAttempts: 5
  }
};

// Función para obtener la configuración actual
export const getApiConfig = () => {
  return isDevelopment ? API_CONFIG.development : API_CONFIG.production;
};

// Función para obtener solo la URL base
export const getApiUrl = () => {
  return getApiConfig().baseURL;
};

// Función para verificar conectividad (útil para debugging)
export const testApiConnection = async () => {
  try {
    const response = await fetch(`${getApiUrl()}/health`);
    return response.ok;
  } catch (error) {
    console.error('❌ Error conectando a la API:', error);
    return false;
  }
};

// Exportar configuración por defecto
export default getApiConfig();
