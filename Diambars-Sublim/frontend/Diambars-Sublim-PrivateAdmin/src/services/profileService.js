// src/services/profileService.js
import { apiClient, ApiError, handleApiError, API_CONFIG } from '../config/api';

class ProfileService {

  // Obtener perfil del usuario actual
  async getUserProfile(userId) {
    try {
      const data = await apiClient.get(`${API_CONFIG.ENDPOINTS.EMPLOYEES}/${userId}`);
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return {
        success: false,
        error: handleApiError(error)
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

      const data = await apiClient.put(`${API_CONFIG.ENDPOINTS.EMPLOYEES}/${userId}`, allowedFields);
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error updating user profile:', error);
      return {
        success: false,
        error: handleApiError(error)
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

      const data = await apiClient.patch(`${API_CONFIG.ENDPOINTS.EMPLOYEES}/${userId}/password`, requestBody);
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error changing password:', error);
      return {
        success: false,
        error: handleApiError(error)
      };
    }
  }
}

export default new ProfileService();