// src/api/authService.js
import apiClient from './apiClient';

export const login = async (credentials) => {
  try {
    const response = await apiClient.post('/auth/login', credentials);
    console.log("[authService] Login exitoso");
    return response.user; // El backend ya devuelve el user en la respuesta
  } catch (error) {
    console.error("[authService] Error en login:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await apiClient.post('/auth/logout');
    console.log("[authService] Sesión cerrada exitosamente");
  } catch (error) {
    console.error("[authService] Error al cerrar sesión:", error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/auth/check');
    return response;
  } catch (error) {
    console.error("[authService] Error obteniendo usuario:", error);
    throw error;
  }
};

export const requestRecoveryCode = async (email) => {
  try {
    return await apiClient.post('/password-recovery/request-code', { email });
  } catch (error) {
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
    return await apiClient.post('/password-recovery/reset-password', data);
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Error al actualizar contraseña');
  }
};