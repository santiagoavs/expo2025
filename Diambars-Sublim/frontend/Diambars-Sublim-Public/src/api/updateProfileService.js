// src/api/updateProfileService.js
import apiClient from './apiClient';
import { resendVerificationEmail } from './resendVerificatonService';

export const updateUserProfile = async (userId, userData, originalEmail) => {
  try {
    console.log('[updateProfileService] Datos a actualizar:', userData);
    
    // Para la ruta /users/profile no necesitamos validar userId
    // El token se maneja automáticamente por el middleware
    
    // Llamada para actualizar el perfil - usando endpoint específico de perfil
    const response = await apiClient.put('/users/profile', userData);
    
    // Si el email cambió, automáticamente enviar verificación
    if (userData.email && userData.email !== originalEmail) {
      console.log('[updateProfileService] Email cambió, enviando verificación automática');
      try {
        await resendVerificationEmail(userData.email);
        console.log('[updateProfileService] Verificación enviada exitosamente');
      } catch (verificationError) {
        console.warn('[updateProfileService] Error al enviar verificación automática:', verificationError);
        // No fallar la actualización por esto, solo advertir
      }
    }
    
    return response;
  } catch (error) {
    console.error('[updateProfileService] Error actualizando perfil:', error);
    
    // Manejar diferentes tipos de errores
    if (error.response?.status === 400) {
      throw new Error(error.message || 'Datos inválidos proporcionados');
    } else if (error.response?.status === 401) {
      throw new Error('No tienes permisos para realizar esta acción');
    } else if (error.response?.status === 409) {
      throw new Error('El correo electrónico ya está en uso');
    } else {
      throw new Error(error.message || 'Error al actualizar el perfil');
    }
  }
};