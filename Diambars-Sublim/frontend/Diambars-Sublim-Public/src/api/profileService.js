// src/api/profileService.js
import apiClient from './apiClient';

export const profileService = {
  // Obtener perfil del usuario autenticado
  getProfile: async () => {
    try {
      console.log('👤 [profileService] Obteniendo perfil del usuario');
      const response = await apiClient.get('/auth/profile');
      
      console.log('✅ [profileService] Perfil obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [profileService] Error obteniendo perfil:', error);
      throw error;
    }
  },

  // Actualizar perfil del usuario
  updateProfile: async (profileData) => {
    try {
      console.log('👤 [profileService] Actualizando perfil:', profileData);
      const response = await apiClient.put('/auth/profile', profileData);
      
      console.log('✅ [profileService] Perfil actualizado:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [profileService] Error actualizando perfil:', error);
      throw new Error(
        error.response?.data?.message || 'Error al actualizar perfil'
      );
    }
  },

  // Cerrar sesión
  logout: async () => {
    try {
      console.log('👋 [profileService] Cerrando sesión');
      const response = await apiClient.post('/auth/logout');
      
      console.log('✅ [profileService] Sesión cerrada');
      return response.data;
    } catch (error) {
      console.error('❌ [profileService] Error cerrando sesión:', error);
      throw error;
    }
  }
};

export default profileService;