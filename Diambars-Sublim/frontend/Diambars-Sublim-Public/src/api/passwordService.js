// src/api/passwordService.js
import apiClient from './apiClient';

export const requestRecoveryCode = async (email) => {
  try {
    console.log('[passwordService] Solicitando código de recuperación para:', email);
    
    const response = await apiClient.post('/password-recovery/request-code', { 
      email: email.toLowerCase().trim() 
    });
    
    console.log('[passwordService] Respuesta del servidor:', response);
    
    return {
      success: true,
      message: response.message || 'Código enviado correctamente'
    };
  } catch (error) {
    console.error('[passwordService] Error al solicitar código:', error);
    
    let errorMessage = 'Error al solicitar el código de recuperación';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Manejar códigos de estado específicos
    if (error.response?.status === 404) {
      errorMessage = 'No se encontró una cuenta con ese email';
    } else if (error.response?.status === 429) {
      errorMessage = 'Demasiadas solicitudes. Espera un momento antes de intentar de nuevo';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Error del servidor. Intenta más tarde';
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

export const verifyRecoveryCode = async ({ email, code }) => {
  try {
    console.log('[passwordService] Verificando código para:', email);
    
    const response = await apiClient.post('/password-recovery/verify-code', { 
      email: email.toLowerCase().trim(), 
      code: code.trim() 
    });
    
    console.log('[passwordService] Código verificado exitosamente');
    
    return {
      success: true,
      message: response.message || 'Código verificado correctamente',
      token: response.token || response.data?.token
    };
  } catch (error) {
    console.error('[passwordService] Error al verificar código:', error);
    
    let errorMessage = 'Error al verificar el código';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Manejar códigos de estado específicos
    if (error.response?.status === 400) {
      errorMessage = 'Código inválido o expirado';
    } else if (error.response?.status === 404) {
      errorMessage = 'No se encontró una solicitud de recuperación válida';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Error del servidor. Intenta más tarde';
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

export const resetPassword = async ({ token, newPassword }) => {
  try {
    console.log('[passwordService] Restableciendo contraseña');
    
    const response = await apiClient.post('/password-recovery/reset-password', {
      token: token.trim(),
      newPassword
    });
    
    console.log('[passwordService] Contraseña restablecida exitosamente');
    
    return {
      success: true,
      message: response.message || 'Contraseña restablecida correctamente'
    };
  } catch (error) {
    console.error('[passwordService] Error al restablecer contraseña:', error);
    
    let errorMessage = 'Error al restablecer la contraseña';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Manejar códigos de estado específicos
    if (error.response?.status === 400) {
      errorMessage = 'Token inválido o contraseña no válida';
    } else if (error.response?.status === 404) {
      errorMessage = 'Token de recuperación no encontrado o expirado';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Error del servidor. Intenta más tarde';
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
};