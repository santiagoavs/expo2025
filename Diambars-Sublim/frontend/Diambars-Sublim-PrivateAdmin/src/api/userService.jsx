// src/api/userService.js
import apiClient from './apiClient';

const BASE_URL = '/users';

export default {
  // Obtener todos los usuarios
  getAll: async () => {
    const response = await apiClient.get(BASE_URL);
    return response;
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response;
  },

  // Crear nuevo usuario
  createUser: async (userData) => {
    const response = await apiClient.post(BASE_URL, userData);
    return response;
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, userData);
    return response;
  },

  // Actualizar estado del usuario (activo/inactivo)
  updateUserStatus: async (id, active) => {
    const response = await apiClient.patch(`${BASE_URL}/${id}/status`, { active });
    return response;
  },

  // Cambiar contraseña
  changePassword: async (id, passwordData) => {
    const response = await apiClient.patch(`${BASE_URL}/${id}/password`, passwordData);
    return response;
  },

  // Eliminar usuario (soft delete)
  deleteUser: async (id) => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response;
  },

  // Actualizar perfil propio
  updateOwnProfile: async (userData) => {
    const response = await apiClient.put(`${BASE_URL}/profile`, userData);
    return response;
  },

  // Gestión de wishlist
  getUserWishlist: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}/wishlist`);
    return response;
  },

  addToWishlist: async (id, productId) => {
    const response = await apiClient.patch(`${BASE_URL}/${id}/wishlist/add`, { productId });
    return response;
  },

  removeFromWishlist: async (id, productId) => {
    const response = await apiClient.patch(`${BASE_URL}/${id}/wishlist/remove`, { productId });
    return response;
  },

  // Gestión de direcciones
  getUserAddresses: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}/addresses`);
    return response;
  },

  setDefaultAddress: async (id, addressId) => {
    const response = await apiClient.patch(`${BASE_URL}/${id}/defaultAddress`, { addressId });
    return response;
  }
};