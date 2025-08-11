// src/api/resendVerificatonService.js
import apiClient from './apiClient';

export const resendVerificationEmail = async (email) => {
  try {
    console.log('[resendVerificationService] Enviando solicitud para:', email);
    
    const response = await apiClient.post('/verify-email/resend', { 
      email: email.toLowerCase().trim() 
    });
    
    console.log('[resendVerificationService] Respuesta del servidor:', response);
    console.log('[resendVerificationService] Correo de verificación reenviado exitosamente');
    
    return response;
  } catch (error) {
    console.error('[resendVerificationService] Error al reenviar correo:', error);
    
    // Manejar diferentes tipos de errores
    let errorMessage = 'Error al reenviar correo de verificación';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Manejar códigos de estado específicos
    if (error.response?.status === 404) {
      errorMessage = 'Usuario no encontrado con ese email';
    } else if (error.response?.status === 400) {
      errorMessage = error.response.data?.message || 'Email inválido';
    } else if (error.response?.status === 429) {
      errorMessage = 'Demasiadas solicitudes. Espera un momento antes de intentar de nuevo';
    } else if (error.response?.status >= 500) {
      errorMessage = 'Error del servidor. Intenta más tarde';
    }
    
    throw new Error(errorMessage);
  }
};