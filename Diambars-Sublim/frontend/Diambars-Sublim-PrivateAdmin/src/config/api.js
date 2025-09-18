// src/config/api.js

// Configuración base de la API
export const API_CONFIG = {
  // Cambia esta URL por la de tu servidor
  BASE_URL: process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000/api'  // Desarrollo
    : 'https://tu-servidor.com/api', // Producción
  
  ENDPOINTS: {
    EMPLOYEES: '/employees',
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh'
  },
  
  TIMEOUT: 10000, // 10 segundos
};

// Clase para manejar peticiones HTTP
export class ApiClient {
  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
  }

  // Headers por defecto
  async getDefaultHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Como usas cookies HTTPOnly, no necesitas Authorization header
    // El browser enviará automáticamente las cookies

    return headers;
  }

  // Método genérico para hacer peticiones
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = await this.getDefaultHeaders();

    const config = {
      headers,
      timeout: this.timeout,
      ...options,
    };

    // Agregar headers personalizados si existen
    if (options.headers) {
      config.headers = { ...config.headers, ...options.headers };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...config,
        credentials: 'include', // ← Esto es importante para cookies
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || `HTTP error! status: ${response.status}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      return data;

    } catch (error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      
      if (error instanceof ApiError) {
        throw error;
      }

      throw new ApiError(
        error.message || 'Network error',
        0,
        { originalError: error }
      );
    }
  }

  // Métodos HTTP específicos
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request(url, {
      method: 'GET',
    });
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

// Clase para errores de API
export class ApiError extends Error {
  constructor(message, status = 0, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }

  // Verificar si es un error de autenticación
  isAuthError() {
    return this.status === 401 || this.status === 403;
  }

  // Verificar si es un error de validación
  isValidationError() {
    return this.status === 400 || this.status === 422;
  }

  // Verificar si es un error del servidor
  isServerError() {
    return this.status >= 500;
  }
}

// Instancia global del cliente API
export const apiClient = new ApiClient();

// Función utilitaria para manejar errores de API
export const handleApiError = (error) => {
  if (error instanceof ApiError) {
    if (error.isAuthError()) {
      // Manejar errores de autenticación
      // Podrías redirigir al login aquí
      return 'Sesión expirada. Por favor, inicia sesión nuevamente.';
    }
    
    if (error.isValidationError()) {
      return error.data.message || 'Datos inválidos.';
    }
    
    if (error.isServerError()) {
      return 'Error del servidor. Inténtalo de nuevo más tarde.';
    }
    
    return error.message;
  }
  
  return 'Error de conexión. Verifica tu conexión a internet.';
};