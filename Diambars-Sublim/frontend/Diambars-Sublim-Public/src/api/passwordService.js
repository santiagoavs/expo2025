import apiClient from './apiClient';

export const requestRecoveryCode = async (email) => {
  try {
    const response = await apiClient.post('/password-recovery/request-code', { email });
    return {
      success: true,
      message: response.data?.message || 'Código enviado correctamente'
    };
  } catch (error) {
    console.error('[passwordService] Error al solicitar código:', error);
    const message = error?.response?.data?.message || 
                    error?.message || 
                    'Error al solicitar el código de recuperación';
    return {
      success: false,
      message
    };
  }
};

export const verifyRecoveryCode = async ({ email, code }) => {
  try {
    const response = await apiClient.post('/password-recovery/verify-code', { email, code });
    return {
      success: true,
      message: response.data?.message,
      token: response.data?.token
    };
  } catch (error) {
    console.error('[passwordService] Error al verificar código:', error);
    const message = error?.response?.data?.message || error?.message || 'Error al verificar el código';
    return {
      success: false,
      message
    };
  }
};