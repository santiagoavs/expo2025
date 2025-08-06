import apiClient from './apiClient';

const BASE_URL = '/addresses';

export default {
  // Get all addresses for the current user
  getUserAddresses: async () => {
    const response = await apiClient.get(BASE_URL);
    return response;
  },

  // Create a new address
  createAddress: async (addressData) => {
    const response = await apiClient.post(BASE_URL, addressData);
    return response;
  },

  // Update an existing address
  updateAddress: async (id, addressData) => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, addressData);
    return response;
  },

  // Delete an address
  deleteAddress: async (id) => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response;
  },

  // Set an address as default
  setDefaultAddress: async (id) => {
    const response = await apiClient.patch(`${BASE_URL}/${id}/set-default`);
    return response;
  }
};