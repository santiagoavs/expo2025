import axios from 'axios';
import apiClient from './apiClient';

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

export const resetPassword = async (data) => {
  try {
    const response = await axios.post(
      'http://localhost:4000/api/password-recovery/reset-password',
      {
        newPassword: data.newPassword,
        token: data.token
      },
      {
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error con axios directo:', error);
    throw new Error(error.response?.data?.message || 'Error al actualizar la contraseña');
  }
};