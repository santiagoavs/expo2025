// src/services/profileService.js
import apiClient from '../api/ApiClient';

class ProfileService {
  
  // Obtener perfil del usuario actual
  async getUserProfile(userId) {
    try {
      const data = await apiClient.get(`/employees/${userId}`);
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
        success: false,
        error: error.message || 'Error al cargar el perfil'
      };
    }
  }

  // Actualizar perfil del usuario
  async updateUserProfile(userId, profileData) {
    try {
      // Filtrar campos que no deben ser enviados
      const allowedFields = {
        name: profileData.name,
        email: profileData.email,
        phoneNumber: profileData.phone, // Nota: el backend usa 'phoneNumber'
        address: profileData.location,
        // No enviamos password, se maneja por separado
      };

      const data = await apiClient.put(`/employees/${userId}`, allowedFields);
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return {
        success: false,
        error: error.message || 'Error al actualizar el perfil'
      };
    }
  }

  // Cambiar contraseña
  async changePassword(userId, passwordData) {
    try {
      const requestBody = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      };

      const data = await apiClient.patch(`/employees/${userId}/password`, requestBody);
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: error.message || 'Error al cambiar la contraseña'
      };
    }
  }
}

export default new ProfileService();