import apiClient from './apiClient';

const BASE_URL = '/categories';

const categoryService = {
  getAll: async () => {
    try {
      const response = await apiClient.get(BASE_URL);
      return response; // response ya es data, por el interceptor
    } catch (error) {
      throw error;
    }
  },

  getCategoryById: async (id) => {
    try {
      const response = await apiClient.get(`${BASE_URL}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  },

  createCategory: async (categoryData) => {
    const response = await apiClient.post(BASE_URL, categoryData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('diambars_token')}`,
      }
    });
    return response;
  },

  updateCategory: async (id, categoryData) => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, categoryData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('diambars_token')}`,
      }
    });
    return response;
  },

  deleteCategory: async (id) => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('diambars_token')}`,
      }
    });
    return response;
  },

  searchCategories: async (query) => {
    const response = await apiClient.get(`${BASE_URL}/search`, {
      params: { q: query }
    });
    return response;
  }
};

export default categoryService;
