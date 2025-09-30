// src/api/authService.js - PANEL ADMIN CORREGIDO
import apiClient from './ApiClient';

export const login = async (credentials) => {
  try {
    console.log("[authService-ADMIN] Intentando login con:", { 
      email: credentials.email,
      passwordLength: credentials.password?.length 
    });
    
    // Limpiar cualquier token previo antes de intentar login
    localStorage.removeItem('token');
    
    const response = await apiClient.post('/api/auth/login', {
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password
    });

    console.log("[authService-ADMIN] Respuesta del servidor:", response);

    // Verificar que la respuesta tenga la estructura esperada
    if (!response.success || !response.user) {
      console.error("[authService-ADMIN] Respuesta inesperada:", response);
      throw new Error('Respuesta inesperada del servidor');
    }

    // Verificar que el usuario sea empleado/admin
    const user = response.user;
    const allowedTypes = ['employee', 'manager', 'warehouse', 'admin'];
    const allowedRoles = ['admin', 'manager', 'employee', 'warehouse'];
    
    const userType = user.type?.toLowerCase();
    const userRole = user.role?.toLowerCase();
    
    console.log("[authService-ADMIN] Verificando permisos:", {
      userType,
      userRole,
      allowedTypes,
      allowedRoles
    });
    
    const hasValidType = allowedTypes.includes(userType);
    const hasValidRole = allowedRoles.includes(userRole);
    
    if (!hasValidType && !hasValidRole) {
      console.warn("[authService-ADMIN] Usuario sin permisos de empleado:", { userType, userRole });
      throw new Error('Solo personal autorizado puede acceder al panel administrativo');
    }

    // Guardar token si viene en la respuesta
    if (response.token) {
      localStorage.setItem('token', response.token);
      console.log("[authService-ADMIN] Token guardado exitosamente");
    } else {
      console.warn("[authService-ADMIN] No se recibió token en la respuesta");
    }

    console.log("[authService-ADMIN] Login exitoso para empleado:", {
      id: user.id,
      email: user.email,
      role: user.role,
      type: user.type
    });
    
    return user;
  } catch (error) {
    console.error("[authService-ADMIN] Error en login:", error);

    // Limpiar cualquier token corrupto
    localStorage.removeItem('token');

    // Manejo de errores específicos
    if (error.status === 401) {
      throw new Error('Credenciales incorrectas');
    } else if (error.status === 403) {
      if (error.message?.includes('EMPLOYEE_REQUIRED') || 
          error.message?.includes('empleado')) {
        throw new Error('Se requiere una cuenta de empleado para acceder');
      } else {
        throw new Error('Acceso denegado - Verificar permisos');
      }
    } else if (error.code === 'NETWORK_ERROR') {
      throw new Error('Error de red - Verifica tu conexión y que el servidor esté funcionando');
    } else if (error.status >= 500) {
      throw new Error('Error del servidor - Intenta más tarde');
    } else if (error.message?.includes('personal autorizado')) {
      // Error que lanzamos nosotros
      throw error;
    } else {
      throw new Error(error.message || 'Error desconocido en el login');
    }
  }
};

export const logout = async () => {
  try {
    console.log("[authService-ADMIN] Cerrando sesión...");
    await apiClient.post('/api/auth/logout');
    console.log("[authService-ADMIN] Sesión cerrada exitosamente en servidor");
  } catch (error) {
    console.warn("[authService-ADMIN] Error al cerrar sesión en servidor:", error);
    // No lanzar error, siempre limpiar el token localmente
  } finally {
    // Limpiar datos locales independientemente de si el servidor responde
    localStorage.removeItem('token');
    console.log("[authService-ADMIN] Token local limpiado");
  }
};

export const getCurrentUser = async () => {
  try {
    console.log("[authService-ADMIN] Obteniendo usuario actual...");
    const token = localStorage.getItem('token');

    if (!token) {
      console.log("[authService-ADMIN] No hay token, usuario no autenticado");
      return { authenticated: false, user: null };
    }

    console.log("[authService-ADMIN] Token encontrado, verificando con servidor...");
    const response = await apiClient.get('/api/auth/check');
    
    console.log("[authService-ADMIN] Respuesta de verificación:", response);

    if (response.authenticated && response.user) {
      // Verificar nuevamente que sea empleado
      const user = response.user;
      const allowedTypes = ['employee', 'manager', 'warehouse', 'admin'];
      const allowedRoles = ['admin', 'manager', 'employee', 'warehouse'];
      
      const userType = user.type?.toLowerCase();
      const userRole = user.role?.toLowerCase();
      
      const hasValidType = allowedTypes.includes(userType);
      const hasValidRole = allowedRoles.includes(userRole);
      
      if (!hasValidType && !hasValidRole) {
        console.warn("[authService-ADMIN] Usuario actual sin permisos de empleado");
        localStorage.removeItem('token');
        return { authenticated: false, user: null };
      }

      console.log("[authService-ADMIN] Usuario empleado verificado exitosamente");
      return {
        authenticated: true,
        user: response.user
      };
    } else {
      console.log("[authService-ADMIN] Usuario no autenticado según servidor");
      return { authenticated: false, user: null };
    }
  } catch (error) {
    console.error("[authService-ADMIN] Error obteniendo usuario:", error);

    // Si hay error, limpiar token y devolver no autenticado
    localStorage.removeItem('token');
    return { authenticated: false, user: null };
  }
};

// Funciones de recuperación de contraseña
export const requestRecoveryCode = async (email) => {
  try {
    console.log("[authService-ADMIN] Solicitando código de recuperación para:", email);
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Email inválido');
    }

    const response = await apiClient.post('/api/password-recovery/request-code', { 
      email: email.trim().toLowerCase() 
    });
    
    console.log("[authService-ADMIN] Código de recuperación solicitado exitosamente:", response);
    return response;
  } catch (error) {
    console.error("[authService-ADMIN] Error al solicitar código de recuperación:", error);
    throw new Error(error.message || 'Error al solicitar código de recuperación');
  }
};

export const verifyRecoveryCode = async (email, code) => {
  try {
    console.log("[authService-ADMIN] Verificando código de recuperación:", { email, code });
    
    if (!email || !code) {
      throw new Error('Email y código son requeridos');
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) {
      throw new Error('El código debe tener 6 dígitos');
    }

    const response = await apiClient.post('/api/password-recovery/verify-code', { 
      email: email.trim().toLowerCase(), 
      code: code.trim() 
    });
    
    console.log("[authService-ADMIN] Código verificado exitosamente:", response);
    return response;
  } catch (error) {
    console.error("[authService-ADMIN] Error al verificar código:", error);
    throw new Error(error.message || 'Error al verificar código');
  }
};

export const resetPassword = async (data) => {
  try {
    console.log("[authService-ADMIN] Reseteando contraseña con token:", data.token ? 'Token presente' : 'Token ausente');
    
    if (!data.newPassword || !data.token) {
      throw new Error('Nueva contraseña y token son requeridos');
    }

    if (data.newPassword.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const response = await apiClient.post('/api/password-recovery/reset-password', {
      newPassword: data.newPassword,
      token: data.token
    });
    
    console.log("[authService-ADMIN] Contraseña reseteada exitosamente:", response);
    return response;
  } catch (error) {
    console.error("[authService-ADMIN] Error al resetear contraseña:", error);
    throw new Error(error.message || 'Error al actualizar contraseña');
  }
};

// Funciones adicionales para compatibilidad con el AuthContext existente
export const forgotPassword = requestRecoveryCode; // Alias
export const verifyResetCode = verifyRecoveryCode; // Alias

export default apiClient;