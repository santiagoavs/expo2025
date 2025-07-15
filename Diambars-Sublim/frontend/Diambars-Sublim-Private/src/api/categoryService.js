import api from './apiClient';

// Helper para manejar respuestas
const handleResponse = (response) => {
  return response.data || response;
};

// Helper para manejar errores
const handleError = (error, defaultMessage) => {
  console.error('Error:', {
    error: error,
    response: error.response,
    config: error.config
  });

  const errorData = error.response?.data || {};
  const errorMessage = errorData.message || errorData.error || error.message || defaultMessage;
  
  throw new Error(errorMessage);
};

export const getAllCategories = async () => {
  try {
    const response = await api.get('/categories');
    return handleResponse(response);
  } catch (error) {
    handleError(error, 'Error al cargar categorías');
  }
};

export const getCategoryById = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    return handleResponse(response);
  } catch (error) {
    handleError(error, 'Error al obtener categoría');
  }
};

export const createCategory = async (formData) => {
  try {
    const response = await api.post('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('diambars_token')}`
      }
    });
    return handleResponse(response);
  } catch (error) {
    handleError(error, 'Error al crear categoría');
  }
};

export const updateCategory = async (id, formData) => {
  try {
    const response = await api.put(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('diambars_token')}`
      }
    });
    return handleResponse(response);
  } catch (error) {
    handleError(error, 'Error al actualizar categoría');
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('diambars_token')}`
      }
    });
    return handleResponse(response);
  } catch (error) {
    handleError(error, 'Error al eliminar categoría');
  }
};

export const searchCategories = async (query) => {
  try {
    const response = await api.get('/categories/search', {
      params: { q: query }
    });
    return handleResponse(response);
  } catch (error) {
    handleError(error, 'Error al buscar categorías');
  }
};