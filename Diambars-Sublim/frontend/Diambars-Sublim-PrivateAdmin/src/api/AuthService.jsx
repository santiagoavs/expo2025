import apiClient from './ApiClient';

export const login = async (credentials) => {
  try {
    console.log("[authService] Intentando login con:", { email: credentials.email });
    const response = await apiClient.post('/auth/login', credentials);

    // Si el backend devuelve un token, guardarlo
    if (response.token) {
      localStorage.setItem('token', response.token);
      console.log("[authService] Token guardado exitosamente");
    }

    console.log("[authService] Login exitoso", response.user);
    return response.user; // El backend ya devuelve el user en la respuesta
  } catch (error) {
    console.error("[authService] Error en login:", error);

    // Manejo de errores específicos
    if (error.status === 401) {
      throw new Error('Credenciales incorrectas');
    } else if (error.status === 403) {
      throw { needsVerification: true, message: 'Email no verificado' };
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('Error de red - Verifica tu conexión');
    } else if (error.status >= 500) {
      throw new Error('Error del servidor - Intenta más tarde');
    } else {
      throw new Error(error.message || 'Error desconocido');
    }
  }
};

export const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
    console.log("[authService] Sesión cerrada exitosamente");
  } catch (error) {
    console.warn("[authService] Error al cerrar sesión:", error);
    // No lanzar error, siempre limpiar el token localmente
  } finally {
    // Limpiar datos locales independientemente de si el servidor responde
    localStorage.removeItem('token');
  }
};

export const getCurrentUser = async () => {
  try {
    console.log("[authService] Obteniendo usuario actual...");
    const token = localStorage.getItem('token');

    if (!token) {
      console.log("[authService] No hay token, usuario no autenticado");
      return { authenticated: false, user: null };
    }

    const response = await apiClient.get('/auth/check');
    console.log("[authService] Usuario obtenido exitosamente");

    return {
      authenticated: true,
      user: response.user || response // Adaptarse a diferentes formatos de respuesta
    };
  } catch (error) {
    console.error("[authService] Error obteniendo usuario:", error);

    // Si hay error, limpiar token y devolver no autenticado
    localStorage.removeItem('token');
    return { authenticated: false, user: null };
  }
};

// Funciones de recuperación de contraseña
export const requestRecoveryCode = async (email) => {
  try {
    console.log("[authService] Solicitando código de recuperación para:", email);
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Email inválido');
    }

    const response = await apiClient.post('/password-recovery/request-code', { 
      email: email.trim().toLowerCase() 
    });
    
    console.log("[authService] Código de recuperación solicitado exitosamente:", response);
    return response;
  } catch (error) {
    console.error("[authService] Error al solicitar código de recuperación:", error);
    throw new Error(error.message || 'Error al solicitar código de recuperación');
  }
};

export const verifyRecoveryCode = async (email, code) => {
  try {
    console.log("[authService] Verificando código de recuperación:", { email, code });
    
    if (!email || !code) {
      throw new Error('Email y código son requeridos');
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      throw new Error('El código debe tener 6 dígitos');
    }

    const response = await apiClient.post('/password-recovery/verify-code', { 
      email: email.trim().toLowerCase(), 
      code: code.trim() 
    });
    
    console.log("[authService] Código verificado exitosamente:", response);
    return response;
  } catch (error) {
    console.error("[authService] Error al verificar código:", error);
    throw new Error(error.message || 'Error al verificar código');
  }
};

export const resetPassword = async (data) => {
  try {
    console.log("[authService] Reseteando contraseña con token:", data.token ? 'Token presente' : 'Token ausente');
    
    if (!data.newPassword || !data.token) {
      throw new Error('Nueva contraseña y token son requeridos');
    }

    if (data.newPassword.length < 8) {
      throw new Error('La contraseña debe tener al menos 8 caracteres');
    }

    const response = await apiClient.post('/password-recovery/reset-password', {
      newPassword: data.newPassword,
      token: data.token
    });
    
    console.log("[authService] Contraseña reseteada exitosamente:", response);
    return response;
  } catch (error) {
    console.error("[authService] Error al resetear contraseña:", error);
    throw new Error(error.message || 'Error al actualizar contraseña');
  }
};

// Funciones adicionales para compatibilidad con el AuthContext existente
export const forgotPassword = requestRecoveryCode; // Alias
export const verifyResetCode = verifyRecoveryCode; // Alias

export default apiClient;