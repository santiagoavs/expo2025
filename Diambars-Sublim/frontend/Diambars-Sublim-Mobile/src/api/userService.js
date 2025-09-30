// src/api/userService.js
import apiClient from './ApiClient';

const BASE_URL = '/users';

const userService = {
  // Obtener todos los usuarios
  getAll: async () => {
    try {
      console.log('🔍 [UserService-Mobile] Obteniendo usuarios...');
      const response = await apiClient.get(BASE_URL);
      console.log('✅ [UserService-Mobile] Usuarios obtenidos exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [UserService-Mobile] Error obteniendo usuarios:', error);
      throw error;
    }
  },

  // Obtener usuario por ID
  getById: async (id) => {
    try {
      console.log(`🔍 [UserService-Mobile] Obteniendo usuario con ID: ${id}`);
      const response = await apiClient.get(`${BASE_URL}/${id}`);
      console.log('✅ [UserService-Mobile] Usuario obtenido exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [UserService-Mobile] Error obteniendo usuario:', error);
      throw error;
    }
  },

  // Crear nuevo usuario
  create: async (userData) => {
    try {
      console.log('📤 [UserService-Mobile] Creando usuario:', userData);
      
      // Validaciones básicas
      if (!userData.name || !userData.email) {
        throw new Error('El nombre y email son obligatorios');
      }

      const response = await apiClient.post(BASE_URL, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 segundos
      });
      
      console.log('✅ [UserService-Mobile] Usuario creado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [UserService-Mobile] Error creando usuario:', error);
      throw error;
    }
  },

  // Actualizar usuario
  update: async (id, userData) => {
    try {
      console.log(`📝 [UserService-Mobile] Actualizando usuario ${id}:`, userData);
      
      const response = await apiClient.put(`${BASE_URL}/${id}`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 segundos
      });
      
      console.log('✅ [UserService-Mobile] Usuario actualizado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [UserService-Mobile] Error actualizando usuario:', error);
      throw error;
    }
  },

  // Actualizar estado del usuario (activo/inactivo)
  updateStatus: async (id, active) => {
    try {
      console.log(`🔄 [UserService-Mobile] Actualizando estado del usuario ${id} a:`, active);
      
      const response = await apiClient.patch(`${BASE_URL}/${id}/status`, { active }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 segundos
      });
      
      console.log('✅ [UserService-Mobile] Estado del usuario actualizado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [UserService-Mobile] Error actualizando estado del usuario:', error);
      throw error;
    }
  },

  // Cambiar contraseña
  changePassword: async (id, passwordData) => {
    try {
      console.log(`🔐 [UserService-Mobile] Cambiando contraseña del usuario ${id}`);
      
      const response = await apiClient.patch(`${BASE_URL}/${id}/password`, passwordData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 segundos
      });
      
      console.log('✅ [UserService-Mobile] Contraseña cambiada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [UserService-Mobile] Error cambiando contraseña:', error);
      throw error;
    }
  },

  // Eliminar usuario (soft delete)
  delete: async (id) => {
    try {
      console.log(`🗑️ [UserService-Mobile] Eliminando usuario ${id}`);
      
      const response = await apiClient.delete(`${BASE_URL}/${id}`, {
        timeout: 30000, // 30 segundos
      });
      
      console.log('✅ [UserService-Mobile] Usuario eliminado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [UserService-Mobile] Error eliminando usuario:', error);
      throw error;
    }
  },

  // Eliminar usuario permanentemente (hard delete)
  hardDelete: async (id) => {
    try {
      console.log(`🗑️ [UserService-Mobile] Eliminando usuario permanentemente ${id}`);
      
      const response = await apiClient.delete(`${BASE_URL}/${id}/permanent`, {
        timeout: 30000, // 30 segundos
      });
      
      console.log('✅ [UserService-Mobile] Usuario eliminado permanentemente:', response);
      return response;
    } catch (error) {
      console.error('❌ [UserService-Mobile] Error eliminando usuario permanentemente:', error);
      throw error;
    }
  },

  // Actualizar perfil propio
  updateOwnProfile: async (userData) => {
    try {
      console.log('👤 [UserService-Mobile] Actualizando perfil propio:', userData);
      
      const response = await apiClient.put(`${BASE_URL}/profile`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 segundos
      });
      
      console.log('✅ [UserService-Mobile] Perfil actualizado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [UserService-Mobile] Error actualizando perfil:', error);
      throw error;
    }
  },

  // Gestión de wishlist
  getUserWishlist: async (id) => {
    try {
      console.log(`❤️ [UserService-Mobile] Obteniendo wishlist del usuario ${id}`);
      
      const response = await apiClient.get(`${BASE_URL}/${id}/wishlist`);
      console.log('✅ [UserService-Mobile] Wishlist obtenida exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [UserService-Mobile] Error obteniendo wishlist:', error);
      throw error;
    }
  },

  addToWishlist: async (id, productId) => {
    try {
      console.log(`❤️ [UserService-Mobile] Agregando producto ${productId} a wishlist del usuario ${id}`);
      
      const response = await apiClient.patch(`${BASE_URL}/${id}/wishlist/add`, { productId }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 segundos
      });
      
      console.log('✅ [UserService-Mobile] Producto agregado a wishlist exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [UserService-Mobile] Error agregando a wishlist:', error);
      throw error;
    }
  },

  removeFromWishlist: async (id, productId) => {
    try {
      console.log(`❤️ [UserService-Mobile] Removiendo producto ${productId} de wishlist del usuario ${id}`);
      
      const response = await apiClient.patch(`${BASE_URL}/${id}/wishlist/remove`, { productId }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 segundos
      });
      
      console.log('✅ [UserService-Mobile] Producto removido de wishlist exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [UserService-Mobile] Error removiendo de wishlist:', error);
      throw error;
    }
  },

  // Gestión de direcciones
  getUserAddresses: async (id) => {
    try {
      console.log(`📍 [UserService-Mobile] Obteniendo direcciones del usuario ${id}`);
      
      const response = await apiClient.get(`${BASE_URL}/${id}/addresses`);
      console.log('✅ [UserService-Mobile] Direcciones obtenidas exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [UserService-Mobile] Error obteniendo direcciones:', error);
      throw error;
    }
  },

  setDefaultAddress: async (id, addressId) => {
    try {
      console.log(`📍 [UserService-Mobile] Estableciendo dirección por defecto ${addressId} para usuario ${id}`);
      
      const response = await apiClient.patch(`${BASE_URL}/${id}/defaultAddress`, { addressId }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 segundos
      });
      
      console.log('✅ [UserService-Mobile] Dirección por defecto establecida exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [UserService-Mobile] Error estableciendo dirección por defecto:', error);
      throw error;
    }
  }
};

export default userService;
