import apiClient from './apiClient';
import crypto from 'crypto';

export const resendVerificationEmail = async (email) => {
  try {
    // Cambiar de '/users/resend-verification' a '/verify-email/resend'
    const response = await apiClient.post('/verify-email/resend', { email });
    console.log('[resendVerificationService] Correo de verificación reenviado');
    return response;
  } catch (error) {
    console.error('[resendVerificationService] Error al reenviar correo:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Error al reenviar correo de verificación');
  }
};