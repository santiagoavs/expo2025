
import apiClient from './apiClients';

export const login = async (credentials) => {
  const response = await apiClient.post('/auth/login', credentials);
  return {
    token: response.token,
    user: response.user
  };
};

export const logout = async () => {
  await apiClient.post('/auth/logout');
};

export const getCurrentUser = async () => {
  return apiClient.get('/auth/check');
};

export const requestRecoveryCode = async (email) => {
  try {
    const response = await apiClient.post('/password-recovery/request-code', { email });
    return response;
  } catch (error) {
    console.error("Error en requestRecoveryCode:", error.response?.data);
    throw new Error(error.response?.data?.message || 'Error al solicitar código');
  }
};

export const verifyRecoveryCode = async (email, code) => {
  try {
    return await apiClient.post('/password-recovery/verify-code', { email, code });
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al verificar código');
  }
};

export const resetPassword = async (newPassword, token) => {
  try {
    return await apiClient.post('/password-recovery/reset-password', { newPassword, token });
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al restablecer contraseña');
  }
};