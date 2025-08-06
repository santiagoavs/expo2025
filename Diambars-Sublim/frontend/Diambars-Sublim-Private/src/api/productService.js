import apiClient from './apiClient';

const BASE_URL = '/products';

export default {
  getAllProducts: async (params = {}) => {
    const response = await apiClient.get(BASE_URL, { params });
    return response;
  },

  getProductById: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response;
  },

  getKonvaConfig: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}/konva-config`);
    return response;
  },

  createProduct: async (productData) => {
    // FormData support for file uploads
    const formData = new FormData();
    
    // Handle main image
    if (productData.mainImage) {
      formData.append('mainImage', productData.mainImage);
    }
    
    // Handle additional images
    if (productData.additionalImages && productData.additionalImages.length) {
      productData.additionalImages.forEach(image => {
        formData.append('additionalImages', image);
      });
    }
    
    // Convert JSON fields to strings for FormData
    const jsonFields = [
      'name', 'description', 'basePrice', 'productionTime', 
      'categoryId', 'isActive', 'customizationAreas', 'options'
    ];
    
    jsonFields.forEach(field => {
      if (productData[field] !== undefined) {
        // Arrays and objects need to be stringified
        if (typeof productData[field] === 'object') {
          formData.append(field, JSON.stringify(productData[field]));
        } else {
          formData.append(field, productData[field]);
        }
      }
    });
    
    const response = await apiClient.post(BASE_URL, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response;
  },

  updateProduct: async (id, productData) => {
    // Similar implementation to createProduct for handling FormData
    const formData = new FormData();
    
    if (productData.mainImage) {
      formData.append('mainImage', productData.mainImage);
    }
    
    if (productData.additionalImages && productData.additionalImages.length) {
      productData.additionalImages.forEach(image => {
        formData.append('additionalImages', image);
      });
    }
    
    const jsonFields = [
      'name', 'description', 'basePrice', 'productionTime', 
      'categoryId', 'isActive', 'customizationAreas', 'options'
    ];
    
    jsonFields.forEach(field => {
      if (productData[field] !== undefined) {
        if (typeof productData[field] === 'object') {
          formData.append(field, JSON.stringify(productData[field]));
        } else {
          formData.append(field, productData[field]);
        }
      }
    });
    
    const response = await apiClient.put(`${BASE_URL}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return response;
  },

  deleteProduct: async (id) => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response;
  },

  // Search products with filtering
  searchProducts: async (params) => {
    const response = await apiClient.get(`${BASE_URL}`, { params });
    return response;
  }
};