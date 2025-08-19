// src/api/authService.js - PANEL ADMIN REACT NATIVE
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from './ApiClient';

export const login = async (credentials) => {
  try {
    console.log("[authService-ADMIN-RN] Intentando login con:", { 
      email: credentials.email,
      passwordLength: credentials.password?.length 
    });
    
    // Limpiar cualquier token previo antes de intentar login
    await AsyncStorage.removeItem('token');
    
    const response = await apiClient.post('/auth/login', {
      email: credentials.email.toLowerCase().trim(),
      password: credentials.password
    });

    console.log("[authService-ADMIN-RN] Respuesta del servidor:", response);

    // Verificar que la respuesta tenga la estructura esperada
    if (!response.success || !response.user) {
      console.error("[authService-ADMIN-RN] Respuesta inesperada:", response);
      throw new Error('Respuesta inesperada del servidor');
    }

    // Verificar que el usuario sea empleado/admin
    const user = response.user;
    const allowedTypes = ['employee', 'manager', 'warehouse', 'admin'];
    const allowedRoles = ['admin', 'manager', 'employee', 'warehouse'];
    
    const userType = user.type?.toLowerCase();
    const userRole = user.role?.toLowerCase();
    
    console.log("[authService-ADMIN-RN] Verificando permisos:", {
      userType,
      userRole,
      allowedTypes,
      allowedRoles
    });
    
    const hasValidType = allowedTypes.includes(userType);
    const hasValidRole = allowedRoles.includes(userRole);
    
    if (!hasValidType && !hasValidRole) {
      console.warn("[authService-ADMIN-RN] Usuario sin permisos de empleado:", { userType, userRole });
      throw new Error('Solo personal autorizado puede acceder al panel administrativo');
    }

    // Guardar token si viene en la respuesta
    if (response.token) {
      await AsyncStorage.setItem('token', response.token);
      console.log("[authService-ADMIN-RN] Token guardado exitosamente");
    } else {
      console.warn("[authService-ADMIN-RN] No se recibió token en la respuesta");
    }

    console.log("[authService-ADMIN-RN] Login exitoso para empleado:", {
      id: user.id,
      email: user.email,
      role: user.role,
      type: user.type
    });
    
    return user;
  } catch (error) {
    console.error("[authService-ADMIN-RN] Error en login:", error);

    // Limpiar cualquier token corrupto
    try {
      await AsyncStorage.removeItem('token');
    } catch (storageError) {
      console.error("[authService-ADMIN-RN] Error limpiando token:", storageError);
    }

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
    console.log("[authService-ADMIN-RN] Cerrando sesión...");
    await apiClient.post('/auth/logout');
    console.log("[authService-ADMIN-RN] Sesión cerrada exitosamente en servidor");
  } catch (error) {
    console.warn("[authService-ADMIN-RN] Error al cerrar sesión en servidor:", error);
    // No lanzar error, siempre limpiar el token localmente
  } finally {
    // Limpiar datos locales independientemente de si el servidor responde
    try {
      await AsyncStorage.removeItem('token');
      console.log("[authService-ADMIN-RN] Token local limpiado");
    } catch (storageError) {
      console.error("[authService-ADMIN-RN] Error limpiando token:", storageError);
    }
  }
};

export const getCurrentUser = async () => {
  try {
    console.log("[authService-ADMIN-RN] Obteniendo usuario actual...");
    const token = await AsyncStorage.getItem('token');

    if (!token) {
      console.log("[authService-ADMIN-RN] No hay token, usuario no autenticado");
      return { authenticated: false, user: null };
    }

    console.log("[authService-ADMIN-RN] Token encontrado, verificando con servidor...");
    const response = await apiClient.get('/auth/check');
    
    console.log("[authService-ADMIN-RN] Respuesta de verificación:", response);

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
        console.warn("[authService-ADMIN-RN] Usuario actual sin permisos de empleado");
        await AsyncStorage.removeItem('token');
        return { authenticated: false, user: null };
      }

      console.log("[authService-ADMIN-RN] Usuario empleado verificado exitosamente");
      return {
        authenticated: true,
        user: response.user
      };
    } else {
      console.log("[authService-ADMIN-RN] Usuario no autenticado según servidor");
      return { authenticated: false, user: null };
    }
  } catch (error) {
    console.error("[authService-ADMIN-RN] Error obteniendo usuario:", error);

    // Si hay error, limpiar token y devolver no autenticado
    try {
      await AsyncStorage.removeItem('token');
    } catch (storageError) {
      console.error("[authService-ADMIN-RN] Error limpiando token:", storageError);
    }
    return { authenticated: false, user: null };
  }
};

// Funciones de recuperación de contraseña
export const requestRecoveryCode = async (email) => {
  try {
    console.log("[authService-ADMIN-RN] Solicitando código de recuperación para:", email);
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Email inválido');
    }

    const response = await apiClient.post('/password-recovery/request-code', { 
      email: email.trim().toLowerCase() 
    });
    
    console.log("[authService-ADMIN-RN] Código de recuperación solicitado exitosamente:", response);
    return response;
  } catch (error) {
    console.error("[authService-ADMIN-RN] Error al solicitar código de recuperación:", error);
    throw new Error(error.message || 'Error al solicitar código de recuperación');
  }
};

export const verifyRecoveryCode = async (email, code) => {
  try {
    console.log("[authService-ADMIN-RN] Verificando código de recuperación:", { email, code });
    
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
    
    console.log("[authService-ADMIN-RN] Código verificado exitosamente:", response);
    return response;
  } catch (error) {
    console.error("[authService-ADMIN-RN] Error al verificar código:", error);
    throw new Error(error.message || 'Error al verificar código');
  }
};

export const resetPassword = async (data) => {
  try {
    console.log("[authService-ADMIN-RN] Reseteando contraseña con token:", data.token ? 'Token presente' : 'Token ausente');
    
    if (!data.newPassword || !data.token) {
      throw new Error('Nueva contraseña y token son requeridos');
    }

    if (data.newPassword.length < 6) {
      throw new Error('La contraseña debe tener al menos 6 caracteres');
    }

    const response = await apiClient.post('/password-recovery/reset-password', {
      newPassword: data.newPassword,
      token: data.token
    });
    
    console.log("[authService-ADMIN-RN] Contraseña reseteada exitosamente:", response);
    return response;
  } catch (error) {
    console.error("[authService-ADMIN-RN] Error al resetear contraseña:", error);
    throw new Error(error.message || 'Error al actualizar contraseña');
  }
};

// Funciones adicionales para compatibilidad con el AuthContext existente
export const forgotPassword = requestRecoveryCode; // Alias
export const verifyResetCode = verifyRecoveryCode; // Alias

export default apiClient;