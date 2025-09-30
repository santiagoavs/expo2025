// src/api/categoryService.js
import apiClient from './ApiClient';

const BASE_URL = '/api/categories';

export default {
  getAll: async () => {
    const response = await apiClient.get(BASE_URL);
    return response;
  },

  getCategoryById: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response;
  },

  createCategory: async (categoryData) => {
    const response = await apiClient.post(BASE_URL, categoryData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  },

  updateCategory: async (id, categoryData) => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, categoryData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response;
  },

  deleteCategory: async (id) => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response;
  },

  searchCategories: async (query) => {
    const response = await apiClient.get(`${BASE_URL}/search`, {
      params: { q: query }
    });
    return response;
  }
};