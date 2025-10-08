// src/api/updateProfileService.js
import apiClient from './apiClient';
import { resendVerificationEmail } from './resendVerificatonService';

export const updateUserProfile = async (userId, userData, originalEmail) => {
  try {
    
    // Normalizar datos antes de enviar
    const normalizedData = {
      name: userData.name?.trim(),
      email: userData.email?.toLowerCase().trim(),
      phoneNumber: userData.phoneNumber?.trim() || undefined // Enviar undefined si está vacío
    };

    // Limpiar campos vacíos o undefined
    Object.keys(normalizedData).forEach(key => {
      if (normalizedData[key] === '' || normalizedData[key] === undefined) {
        delete normalizedData[key];
      }
    });

    // Llamada para actualizar el perfil usando endpoint específico de perfil
    const response = await apiClient.put('/users/profile', normalizedData);
    
    // Si el email cambió, automáticamente enviar verificación
    if (normalizedData.email && normalizedData.email !== originalEmail?.toLowerCase()) {
      try {
        await resendVerificationEmail(normalizedData.email);
      } catch (verificationError) {
        // No fallar la actualización por esto, solo advertir
        console.warn('Error al enviar verificación automática:', verificationError);
      }
    }
    
    return response;
  } catch (error) {
    console.error('[updateProfileService] Error actualizando perfil:', error);
    
    // Manejar diferentes tipos de errores con mensajes más específicos
    let errorMessage = 'Error al actualizar el perfil';
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
      errorMessage = error.response.data.errors.join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // Manejar códigos de estado específicos
    if (error.response?.status === 400) {
      throw new Error(errorMessage || 'Datos inválidos proporcionados');
    } else if (error.response?.status === 401) {
      throw new Error('No tienes permisos para realizar esta acción');
    } else if (error.response?.status === 409) {
      throw new Error('El correo electrónico ya está en uso');
    } else if (error.response?.status === 404) {
      throw new Error('Usuario no encontrado');
    } else {
      throw new Error(errorMessage);
    }
  }
};