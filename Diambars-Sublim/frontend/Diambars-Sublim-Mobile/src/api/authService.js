// src/api/authService.js - PANEL ADMIN REACT NATIVE

/**
 * Servicio de autenticación para el Panel Administrativo en React Native.
 * - Maneja login/logout, verificación de sesión y recuperación de contraseña.
 * - Persiste y limpia el token JWT en AsyncStorage.
 * - Valida que el usuario tenga rol/tipo permitido para el panel.
 * - Normaliza mensajes de error para mostrarlos en UI.
 */

import AsyncStorage from '@react-native-async-storage/async-storage'; // Almacenamiento asíncrono local en RN.
import apiClient from './ApiClient'; // Instancia Axios centralizada con interceptores.

// -------------------------------------------------------------
// LOGIN
// -------------------------------------------------------------
export const login = async (credentials) => { // Exporta función asíncrona login que recibe credenciales { email, password }.
  try { // Bloque de intento para capturar y tratar errores.
    console.log("[authService-ADMIN-RN] Intentando login con:", {  // Log seguro para depuración.
      email: credentials.email,                                   // Muestra email (no sensible).
      passwordLength: credentials.password?.length                // Muestra solo longitud de password (no su valor).
    });
    
    // Limpiar cualquier token previo antes de intentar login
    await AsyncStorage.removeItem('token'); // Asegura que no quede un token antiguo/corrupto antes de autenticar.
    
    const response = await apiClient.post('/auth/login', { // Llama a la API de login en backend.
      email: credentials.email.toLowerCase().trim(),       // Normaliza email a minúsculas y sin espacios.
      password: credentials.password                       // Envía contraseña tal cual (se transmite por HTTPS).
    });

    console.log("[authService-ADMIN-RN] Respuesta del servidor:", response); // Log del payload recibido (ya normalizado por apiClient).

    // Verificar que la respuesta tenga la estructura esperada
    if (!response.success || !response.user) { // Validación defensiva por si el backend cambia.
      console.error("[authService-ADMIN-RN] Respuesta inesperada:", response); // Log de estructura inesperada.
      throw new Error('Respuesta inesperada del servidor'); // Lanza error genérico para UI.
    }

    // Verificar que el usuario sea empleado/admin
    const user = response.user; // Extrae usuario autenticado devuelto por backend.
    const allowedTypes = ['employee', 'manager', 'warehouse', 'admin']; // Tipos permitidos para el panel.
    const allowedRoles = ['admin', 'manager', 'employee', 'warehouse']; // Roles permitidos para el panel.
    
    const userType = user.type?.toLowerCase(); // Normaliza tipo de usuario a minúsculas.
    const userRole = user.role?.toLowerCase(); // Normaliza rol a minúsculas.
    
    console.log("[authService-ADMIN-RN] Verificando permisos:", { // Log de verificación de permisos.
      userType,
      userRole,
      allowedTypes,
      allowedRoles
    });
    
    const hasValidType = allowedTypes.includes(userType); // Valida si el tipo está permitido.
    const hasValidRole = allowedRoles.includes(userRole); // Valida si el rol está permitido.
    
    if (!hasValidType && !hasValidRole) { // Si NO cumple ni tipo ni rol…
      console.warn("[authService-ADMIN-RN] Usuario sin permisos de empleado:", { userType, userRole }); // Log de advertencia.
      throw new Error('Solo personal autorizado puede acceder al panel administrativo'); // Corta el flujo con mensaje claro.
    }

    // Guardar token si viene en la respuesta
    if (response.token) { // Si el backend retorna un token (JWT)…
      await AsyncStorage.setItem('token', response.token); // Persiste el token localmente para próximas requests.
      console.log("[authService-ADMIN-RN] Token guardado exitosamente"); // Log confirmación.
    } else { // Si no vino token…
      console.warn("[authService-ADMIN-RN] No se recibió token en la respuesta"); // Aviso (algunos backends ponen token en cookie, aquí se espera header/body).
    }

    console.log("[authService-ADMIN-RN] Login exitoso para empleado:", { // Log de datos no sensibles del usuario.
      id: user.id,
      email: user.email,
      role: user.role,
      type: user.type
    });
    
    return user; // Devuelve el usuario para que la UI/Context lo consuma.
  } catch (error) { // Captura errores de red/validación/estructura.
    console.error("[authService-ADMIN-RN] Error en login:", error); // Log del error original.

    // Limpiar cualquier token corrupto
    try {
      await AsyncStorage.removeItem('token'); // En caso de error, evita dejar token inválido persistido.
    } catch (storageError) {
      console.error("[authService-ADMIN-RN] Error limpiando token:", storageError); // Log si falla limpieza.
    }

    // Manejo de errores específicos
    if (error.status === 401) { // No autorizado (credenciales malas / token inválido).
      throw new Error('Credenciales incorrectas'); // Mensaje amigable para UI.
    } else if (error.status === 403) { // Prohibido (falta permiso/rol correcto).
      if (error.message?.includes('EMPLOYEE_REQUIRED') ||  // Si backend envía código/mensaje específico…
          error.message?.includes('empleado')) {
        throw new Error('Se requiere una cuenta de empleado para acceder'); // Mensaje claro.
      } else {
        throw new Error('Acceso denegado - Verificar permisos'); // Mensaje genérico de permisos.
      }
    } else if (error.code === 'NETWORK_ERROR') { // Error de red detectado en apiClient.
      throw new Error('Error de red - Verifica tu conexión y que el servidor esté funcionando'); // Sugerencia para usuario.
    } else if (error.status >= 500) { // Errores del servidor.
      throw new Error('Error del servidor - Intenta más tarde'); // Mensaje genérico 5xx.
    } else if (error.message?.includes('personal autorizado')) { // Si es el error que nosotros mismos lanzamos arriba…
      throw error; // Repropaga tal cual.
    } else { // Cualquier otro caso.
      throw new Error(error.message || 'Error desconocido en el login'); // Mensaje por defecto.
    }
  }
};

// -------------------------------------------------------------
// LOGOUT
// -------------------------------------------------------------
export const logout = async () => { // Cierra sesión en backend (opcional) y limpia token local siempre.
  try {
    console.log("[authService-ADMIN-RN] Cerrando sesión..."); // Log de inicio de logout.
    await apiClient.post('/auth/logout'); // Informa al backend para invalidar token/refresh (si aplica).
    console.log("[authService-ADMIN-RN] Sesión cerrada exitosamente en servidor"); // Confirmación.
  } catch (error) { // Si el backend no responde/no implementa endpoint…
    console.warn("[authService-ADMIN-RN] Error al cerrar sesión en servidor:", error); // No es crítico.
    // No lanzar error, siempre limpiar el token localmente
  } finally { // Se ejecuta siempre, haya o no error arriba.
    // Limpiar datos locales independientemente de si el servidor responde
    try {
      await AsyncStorage.removeItem('token'); // Elimina token local para forzar re-login.
      console.log("[authService-ADMIN-RN] Token local limpiado"); // Confirmación.
    } catch (storageError) {
      console.error("[authService-ADMIN-RN] Error limpiando token:", storageError); // Log si falla limpieza local.
    }
  }
};

// -------------------------------------------------------------
// OBTENER USUARIO ACTUAL (VERIFICACIÓN DE SESIÓN)
// -------------------------------------------------------------
export const getCurrentUser = async () => { // Verifica el estado de autenticación en backend y local.
  try {
    console.log("[authService-ADMIN-RN] Obteniendo usuario actual..."); // Log de inicio.
    const token = await AsyncStorage.getItem('token'); // Lee token local.

    if (!token) { // Si no hay token persistido…
      console.log("[authService-ADMIN-RN] No hay token, usuario no autenticado"); // Log informativo.
      return { authenticated: false, user: null }; // Retorna estado no autenticado.
    }

    console.log("[authService-ADMIN-RN] Token encontrado, verificando con servidor..."); // Hay token → validar contra backend.
    const response = await apiClient.get('/auth/check'); // Endpoint que revisa validez del token y retorna usuario.
    
    console.log("[authService-ADMIN-RN] Respuesta de verificación:", response); // Log payload de verificación.

    if (response.authenticated && response.user) { // Si backend confirma sesión válida…
      // Verificar nuevamente que sea empleado
      const user = response.user; // Extrae usuario del response.
      const allowedTypes = ['employee', 'manager', 'warehouse', 'admin']; // Tipos permitidos.
      const allowedRoles = ['admin', 'manager', 'employee', 'warehouse']; // Roles permitidos.
      
      const userType = user.type?.toLowerCase(); // Normaliza tipo.
      const userRole = user.role?.toLowerCase(); // Normaliza rol.
      
      const hasValidType = allowedTypes.includes(userType); // Valida tipo.
      const hasValidRole = allowedRoles.includes(userRole); // Valida rol.
      
      if (!hasValidType && !hasValidRole) { // Si no cumple política del panel…
        console.warn("[authService-ADMIN-RN] Usuario actual sin permisos de empleado"); // Aviso.
        await AsyncStorage.removeItem('token'); // Limpia token para evitar sesión inconsistente.
        return { authenticated: false, user: null }; // Fuerza estado no autenticado en la app.
      }

      console.log("[authService-ADMIN-RN] Usuario empleado verificado exitosamente"); // Confirmación de permisos.
      return {
        authenticated: true,  // Flag de sesión válida.
        user: response.user   // Devuelve usuario para hidratar el contexto/estado global.
      };
    } else { // Si backend indica no autenticado…
      console.log("[authService-ADMIN-RN] Usuario no autenticado según servidor"); // Log informativo.
      return { authenticated: false, user: null }; // Estado no autenticado.
    }
  } catch (error) { // Errores de red/servidor.
    console.error("[authService-ADMIN-RN] Error obteniendo usuario:", error); // Log del problema.

    // Si hay error, limpiar token y devolver no autenticado
    try {
      await AsyncStorage.removeItem('token'); // Limpia token local por seguridad.
    } catch (storageError) {
      console.error("[authService-ADMIN-RN] Error limpiando token:", storageError); // Log de limpieza fallida.
    }
    return { authenticated: false, user: null }; // Mantén estado consistente para la UI.
  }
};

// -------------------------------------------------------------
// RECUPERACIÓN DE CONTRASEÑA — SOLICITAR CÓDIGO
// -------------------------------------------------------------
export const requestRecoveryCode = async (email) => { // Envía email para generar y enviar código de recuperación.
  try {
    console.log("[authService-ADMIN-RN] Solicitando código de recuperación para:", email); // Log del intento.
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { // Validación básica de email.
      throw new Error('Email inválido'); // Mensaje claro para UI.
    }

    const response = await apiClient.post('/password-recovery/request-code', {  // Llama al endpoint para solicitar código.
      email: email.trim().toLowerCase()                                      // Normaliza el email.
    });
    
    console.log("[authService-ADMIN-RN] Código de recuperación solicitado exitosamente:", response); // Log de éxito.
    return response; // Devuelve payload del backend (puede contener metadata de throttling, etc.).
  } catch (error) {
    console.error("[authService-ADMIN-RN] Error al solicitar código de recuperación:", error); // Log del error.
    throw new Error(error.message || 'Error al solicitar código de recuperación'); // Normaliza mensaje para UI.
  }
};

// -------------------------------------------------------------
// RECUPERACIÓN DE CONTRASEÑA — VERIFICAR CÓDIGO
// -------------------------------------------------------------
export const verifyRecoveryCode = async (email, code) => { // Verifica código de 6 dígitos enviado al correo.
  try {
    console.log("[authService-ADMIN-RN] Verificando código de recuperación:", { email, code }); // Log seguro.
    
    if (!email || !code) { // Validación de presencia.
      throw new Error('Email y código son requeridos'); // Mensaje para UI.
    }

    if (code.length !== 6 || !/^\d{6}$/.test(code)) { // El código debe ser exactamente 6 dígitos numéricos.
      throw new Error('El código debe tener 6 dígitos'); // Mensaje claro.
    }

    const response = await apiClient.post('/password-recovery/verify-code', {  // Endpoint de verificación.
      email: email.trim().toLowerCase(),                                       // Normaliza email.
      code: code.trim()                                                        // Limpia espacios por si acaso.
    });
    
    console.log("[authService-ADMIN-RN] Código verificado exitosamente:", response); // Log de éxito.
    return response; // Devuelve resultado (p.ej. token temporal para reset).
  } catch (error) {
    console.error("[authService-ADMIN-RN] Error al verificar código:", error); // Log del problema.
    throw new Error(error.message || 'Error al verificar código'); // Mensaje normalizado para UI.
  }
};

// -------------------------------------------------------------
// RECUPERACIÓN DE CONTRASEÑA — RESETEAR CONTRASEÑA
// -------------------------------------------------------------
export const resetPassword = async (data) => { // Cambia contraseña usando un token válido (p.ej. del código verificado).
  try {
    console.log("[authService-ADMIN-RN] Reseteando contraseña con token:", data.token ? 'Token presente' : 'Token ausente'); // Log de verificación de token.
    
    if (!data.newPassword || !data.token) { // Validación de presencia de campos.
      throw new Error('Nueva contraseña y token son requeridos'); // Mensaje claro.
    }

    if (data.newPassword.length < 6) { // Política mínima de seguridad.
      throw new Error('La contraseña debe tener al menos 6 caracteres'); // Mensaje para UI.
    }

    const response = await apiClient.post('/password-recovery/reset-password', { // Llama a endpoint de reseteo.
      newPassword: data.newPassword,  // Nueva contraseña que definirá el usuario.
      token: data.token               // Token temporal/provisional para autorizar el cambio.
    });
    
    console.log("[authService-ADMIN-RN] Contraseña reseteada exitosamente:", response); // Log de éxito.
    return response; // Devuelve resultado del backend (p.ej. success true, mensaje, etc.).
  } catch (error) {
    console.error("[authService-ADMIN-RN] Error al resetear contraseña:", error); // Log del problema.
    throw new Error(error.message || 'Error al actualizar contraseña'); // Mensaje normalizado para la UI.
  }
};

// -------------------------------------------------------------
// ALIASES PARA COMPATIBILIDAD CON AuthContext EXISTENTE
// -------------------------------------------------------------
export const forgotPassword = requestRecoveryCode; // Alias: nombre alternativo que mapea a requestRecoveryCode.
export const verifyResetCode = verifyRecoveryCode; // Alias: nombre alternativo que mapea a verifyRecoveryCode.

export default apiClient; // Export por defecto (re-exporta apiClient por conveniencia si otros módulos lo usan).
