import apiClient from './apiClient';

export const loginUser = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    return response.user;
  } catch (error) {
    console.error('[loginService] Error en login:', error);

    // Pasa el error completo para que useLogin lo maneje
    throw error;
  }
};
