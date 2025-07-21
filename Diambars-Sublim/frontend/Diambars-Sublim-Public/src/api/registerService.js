import apiClient from './apiClient';

export const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/users/register', userData);
    console.log('[registerService] Registro exitoso');
    return response;
  } catch (error) {
    console.error('[registerService] Error al registrar usuario:', error.response?.data || error);
    throw new Error(error.response?.data?.message || 'Error al registrar usuario');
  }
};
