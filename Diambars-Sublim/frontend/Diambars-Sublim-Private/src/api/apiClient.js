import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true, // Crucial para enviar cookies
  timeout: 30000, // 30 segundos timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Config para logs detallados solo en desarrollo
const isDev = import.meta.env.DEV;

// Contador de reintentos
const retryCount = new Map();

// Interceptor de request
apiClient.interceptors.request.use(
  config => {
    // No loguear en producción
    if (isDev) {
      console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, 
        config.params ? { params: config.params } : '');
    }
    
    // No establecer Content-Type para form-data (el navegador lo hace automáticamente)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  error => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Interceptor de response
apiClient.interceptors.response.use(
  response => {
    // Limpiar contador de reintentos si hay éxito
    const url = response.config.url;
    if (retryCount.has(url)) {
      retryCount.delete(url);
    }
    
    // En producción solo logueamos la URL, no los datos
    if (isDev) {
      console.log(`[API Response] ${response.config.method.toUpperCase()} ${response.config.url} ${response.status}`);
    }
    
    return response.data;
  },
  async error => {
    // Preparar mensaje para errores comunes
    let errorMessage = 'Error de conexión';
    let shouldRetry = false;
    
    // Error de red (sin respuesta del servidor)
    if (!error.response) {
      console.error('[API Network Error]', error.message);
      errorMessage = 'Error de conexión con el servidor';
      shouldRetry = true;
    } 
    // Error con respuesta del servidor
    else {
      const { status, data, config } = error.response;
      
      // Log detallado en desarrollo
      if (isDev) {
        console.error(`[API Error ${status}] ${config.method.toUpperCase()} ${config.url}`, data);
      }
      
      // Errores específicos
      switch (status) {
        case 401: // No autorizado
          errorMessage = 'Sesión expirada o no autorizada';
          
          // Intentamos obtener un token nuevo con cookie existente (solo una vez)
          try {
            // Evitar loops de refresh token
            if (!config.url.includes('/auth/check') && !config._retry) {
              config._retry = true;
              
              // Intenta refresh
              const response = await axios.get(`${apiClient.defaults.baseURL}/auth/check`, {
                withCredentials: true
              });
              
              if (response.data?.authenticated) {
                // Reintenta la petición original
                return apiClient(config);
              }
            }
          } catch (refreshError) {
            console.error('[Auth Refresh Error]', refreshError);
            
            // Si estamos en una SPA podemos redireccionar al login
            window.location.href = '/login';
          }
          break;
          
        case 403: // Prohibido
          errorMessage = 'No tienes permisos para realizar esta acción';
          break;
          
        case 404: // No encontrado
          errorMessage = 'El recurso solicitado no existe';
          break;
          
        case 422: // Error de validación
          errorMessage = 'Datos inválidos';
          break;
          
        case 429: // Rate limit
          errorMessage = 'Demasiadas solicitudes, intenta más tarde';
          shouldRetry = true;
          break;
          
        case 500: // Error de servidor
          errorMessage = 'Error en el servidor, intenta más tarde';
          shouldRetry = true;
          break;
          
        default:
          errorMessage = data?.message || 'Ocurrió un error desconocido';
      }
    }
    
    // Lógica de reintento para errores de red/timeout
    if (shouldRetry) {
      const url = error.config.url;
      const currentRetry = retryCount.get(url) || 0;
      
      if (currentRetry < 2) { // Máximo 2 reintentos
        retryCount.set(url, currentRetry + 1);
        
        // Retardo exponencial
        const delay = Math.pow(2, currentRetry) * 1000;
        
        console.log(`[API Retry] Reintentando ${url} (${currentRetry + 1}/3) en ${delay}ms`);
        
        return new Promise(resolve => {
          setTimeout(() => resolve(apiClient(error.config)), delay);
        });
      }
    }
    
    // Personalizar objeto de error para facilitar manejo en componentes
    const customError = {
      message: errorMessage,
      statusCode: error.response?.status,
      data: error.response?.data,
      isNetworkError: !error.response,
      isAuthError: error.response?.status === 401,
      isValidationError: error.response?.status === 422,
      ...error
    };
    
    return Promise.reject(customError);
  }
);

export default apiClient;