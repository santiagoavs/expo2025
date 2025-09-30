// src/api/ApiClient.js - PANEL ADMIN REACT NATIVE

/**
 * Cliente Axios centralizado para el Panel Administrativo en React Native.
 * - Inyecta automáticamente el token JWT desde AsyncStorage en el header Authorization.
 * - Configura baseURL según entorno (desarrollo vs producción).
 * - Maneja logs de request/response (enmascara password).
 * - Normaliza y enriquece errores (mensajes y metadatos) en el interceptor de respuestas.
 */

import axios from 'axios'; // Importa Axios para realizar peticiones HTTP.
import AsyncStorage from '@react-native-async-storage/async-storage'; // Almacenamiento asíncrono seguro en RN.
import { getApiConfig } from '../config/apiConfig'; // Configuración centralizada de API.

// Configuración de la API URL usando configuración centralizada
const API_CONFIG = getApiConfig();
const API_URL = API_CONFIG.baseURL;

// Crear instancia de axios con configuración base
const apiClient = axios.create({ // Crea una instancia independiente de Axios con defaults propios.
  baseURL: API_URL,            // URL base para todas las peticiones (se concatena con el path).
  withCredentials: false,      // No enviar cookies (el panel usa Bearer token por header, no cookies).
  timeout: API_CONFIG.timeout,  // Tiempo máximo de espera (ms) antes de abortar la petición.
  headers: {                   // Headers por defecto para todas las requests.
    'Content-Type': 'application/json', // Indica que enviamos/recibimos JSON por defecto.
  }
});

// Interceptor de request para agregar el token automáticamente
apiClient.interceptors.request.use( // Registra interceptor que se ejecuta ANTES de cada request.
  async (config) => {               // Función que recibe y puede modificar la config de la request.
    console.log(`🚀 [apiClient-ADMIN-RN] Request: ${config.method?.toUpperCase()} ${config.url}`); // Log básico.
    
    // IMPORTANTE: Panel admin usa SOLO headers, NO cookies
    try {                                           // Manejo de errores al acceder a AsyncStorage.
      const token = await AsyncStorage.getItem('token'); // Recupera token persistido (si existe).
      console.log(`🔑 [apiClient-ADMIN-RN] Token obtenido de AsyncStorage:`, token ? `${token.substring(0, 20)}...` : 'null'); // Log del token (parcial por seguridad).
      if (token) {                                   // Si hay token en almacenamiento…
        config.headers.Authorization = `Bearer ${token}`; // Añádelo al header Authorization.
        console.log(`🔑 [apiClient-ADMIN-RN] Token agregado en Authorization header: Bearer ${token.substring(0, 20)}...`); // Log útil.
      } else {                                       // Si no hay token…
        console.log(`🔑 [apiClient-ADMIN-RN] No hay token en AsyncStorage`); // Informativo para debugging.
      }
    } catch (error) {                                // Si falla la lectura del token…
      console.error(`🔑 [apiClient-ADMIN-RN] Error obteniendo token:`, error); // Log del error.
    }
    
    // Asegurar que no se usen cookies accidentalmente
    config.withCredentials = false; // Forzamos a false por si algún llamado lo cambia.
    
    // Log de la data que se está enviando
    if (config.data) {             // Si la request lleva body…
      const logData = { ...config.data };            // Clona el objeto para no mutar el original.
      if (logData.password) logData.password = '***HIDDEN***'; // Enmascara contraseñas si existen.
      console.log('📤 [apiClient-ADMIN-RN] Request data:', logData); // Muestra payload (sanitizado).
    }
    
    return config; // Devuelve la configuración (obligatorio) para que la request continúe.
  },
  (error) => { // Manejador de error si algo falla al preparar la request.
    console.error('❌ [apiClient-ADMIN-RN] Request error:', error); // Log del error de configuración.
    return Promise.reject(error); // Propaga el error para que el caller lo pueda capturar.
  }
);

// Interceptor de response para manejar errores globalmente
apiClient.interceptors.response.use( // Interceptor que se ejecuta DESPUÉS de recibir la respuesta.
  (response) => {                    // Rama de éxito (status 2xx).
    console.log(`✅ [apiClient-ADMIN-RN] Response exitoso: ${response.config.method?.toUpperCase()} ${response.config.url}`); // Log ruta.
    console.log('📥 [apiClient-ADMIN-RN] Response data:', response.data); // Log del payload devuelto por el backend.
    
    // Retornar directamente los datos de la respuesta
    return response.data; // Normaliza para que los callers reciban directamente data (no el objeto Axios).
  },
  async (error) => { // Rama de error (status no 2xx, errores de red, timeouts, etc.).
    console.error('❌ [apiClient-ADMIN-RN] Error en respuesta:', {
      status: error.response?.status,               // Código HTTP si existe respuesta.
      statusText: error.response?.statusText,       // Texto del estado HTTP.
      url: error.config?.url,                       // Endpoint llamado.
      method: error.config?.method?.toUpperCase(),  // Método HTTP.
      data: error.response?.data,                   // Payload de error del backend (si existe).
      message: error.message                        // Mensaje base del error.
    });
    
    // Crear un error más detallado
    let enhancedError; // Variable para construir un Error enriquecido con más contexto.
    
    if (error.response) { // Caso 1: el servidor respondió con status de error (4xx/5xx).
      const { status, data } = error.response; // Extrae datos relevantes de la respuesta.
      
      if (status === 401) { // No autorizado (token inválido/expirado o credenciales malas).
        console.warn('🚪 [apiClient-ADMIN-RN] Token inválido, expirado o credenciales incorrectas'); // Aviso.
        
        // Solo limpiar token si NO estamos en login
        // En React Native, necesitarás usar navigation service o context
        try {
          await AsyncStorage.removeItem('token'); // Elimina token para forzar re-login.
          console.log('🗑️ [apiClient-ADMIN-RN] Token limpiado de AsyncStorage'); // Confirma limpieza.
          
          // Aquí deberías navegar a login usando tu navigation service
          // NavigationService.navigate('Login'); // ← Implementa según tu app.
        } catch (storageError) {
          console.error('🗑️ [apiClient-ADMIN-RN] Error limpiando token:', storageError); // Log si falla limpieza.
        }
        
        // Mejorar mensaje de error
        let errorMessage = 'No autorizado'; // Mensaje por defecto.
        if (data?.message?.includes('Credenciales') || 
            data?.message?.includes('incorrectas')) {
          errorMessage = 'Credenciales incorrectas'; // Mensaje específico si coincide.
        } else if (data?.message?.includes('Token')) {
          errorMessage = 'Sesión expirada'; // Mensaje específico para token.
        }
        
        enhancedError = new Error(errorMessage); // Construye Error con mensaje claro al usuario.
      } else if (status === 400) { // Solicitud malformada/validación.
        const errorMsg = data?.message || data?.error || 'Solicitud incorrecta'; // Prioriza msg del backend.
        enhancedError = new Error(errorMsg); // Crea Error con mensaje usable.
        
        // Si hay errores de validación específicos, incluirlos
        if (data?.errors && Array.isArray(data.errors)) {
          enhancedError.validationErrors = data.errors; // Adjunta detalles de validación para el UI.
        }
      } else if (status === 403) { // Prohibido: falta permiso/rol.
        enhancedError = new Error(data?.message || 'Acceso prohibido - Se requieren permisos de empleado');
      } else if (status === 404) { // Recurso inexistente.
        enhancedError = new Error(data?.message || 'Recurso no encontrado');
      } else if (status === 422) { // Datos inválidos (muy común en validaciones de formularios).
        enhancedError = new Error(data?.message || 'Datos de entrada inválidos');
      } else if (status >= 500) { // Errores del servidor.
        enhancedError = new Error(data?.message || 'Error del servidor');
      } else { // Otros códigos no cubiertos específicamente.
        enhancedError = new Error(data?.message || `Error ${status}`);
      }
      
      // Adjunta metadatos útiles al error para depuración o UI.
      enhancedError.response = error.response; // Copia la respuesta original de Axios.
      enhancedError.status = status;           // Copia el status HTTP.
      enhancedError.data = data;               // Copia el payload del backend.
    } else if (error.request) { // Caso 2: no hubo respuesta (timeout, red caída, CORS, backend apagado, etc.).
      console.error('🌐 [apiClient-ADMIN-RN] No response received:', error.request); // Log del request fallido.
      enhancedError = new Error('Sin respuesta del servidor - Verifica que el backend esté funcionando'); // Msg claro.
      enhancedError.code = 'NETWORK_ERROR'; // Código custom para distinguir en UI (p.ej. mostrar banner de red).
    } else { // Caso 3: error al configurar la request antes de enviarla.
      console.error('⚙️ [apiClient-ADMIN-RN] Request setup error:', error.message); // Log de configuración.
      enhancedError = new Error(error.message || 'Error desconocido'); // Mensaje general.
    }
    
    return Promise.reject(enhancedError); // Propaga el error enriquecido al caller (catch en servicios/UI).
  }
);

export default apiClient; // Exporta la instancia lista para importar y usar en servicios/llamadas.
