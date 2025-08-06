import apiClient from './apiClient';

const BASE_URL = '/designs';

export default {
  // Get all designs with filtering options
  getAllDesigns: async (params = {}) => {
    const response = await apiClient.get(BASE_URL, { params });
    return response;
  },

  // Get single design by ID
  getDesignById: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response;
  },

  // Create a new design
  createDesign: async (designData) => {
    const response = await apiClient.post(BASE_URL, designData);
    return response;
  },

  // Update an existing design
  updateDesign: async (id, designData) => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, designData);
    return response;
  },

  // Submit a quote for a design (admin)
  submitQuote: async (id, quoteData) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/quote`, quoteData);
    return response;
  },

  // Respond to a quote (accept/reject)
  respondToQuote: async (id, responseData) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/respond`, responseData);
    return response;
  }
};