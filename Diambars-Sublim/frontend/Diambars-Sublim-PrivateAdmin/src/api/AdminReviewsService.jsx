// src/api/AdminReviewsService.jsx - SERVICIO PARA ADMINISTRACIÓN DE RESEÑAS
import apiClient from './ApiClient';

const BASE_URL = '/api/reviews';

const AdminReviewsService = {
  // ==================== OBTENER TODAS LAS RESEÑAS ====================
  
  getAll: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        status,
        search,
        sort = 'newest',
        rating
      } = params;

      console.log('🔍 [AdminReviewsService] Obteniendo reseñas con params:', params);

      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (status && status.trim() !== '') queryParams.append('status', status);
      if (search && search.trim() !== '') queryParams.append('search', search.trim());
      if (sort) queryParams.append('sort', sort);
      if (rating) queryParams.append('rating', rating);

      const url = `${BASE_URL}?${queryParams.toString()}`;
      console.log('📡 [AdminReviewsService] URL:', url);

      const response = await apiClient.get(url);
      
      console.log('✅ [AdminReviewsService] Reseñas obtenidas:', response);
      return response;
    } catch (error) {
      console.error('❌ [AdminReviewsService] Error obteniendo reseñas:', error);
      throw error;
    }
  },

  // ==================== OBTENER RESEÑA POR ID ====================
  
  getById: async (reviewId) => {
    try {
      console.log('🔍 [AdminReviewsService] Obteniendo reseña:', reviewId);
      
      const response = await apiClient.get(`${BASE_URL}/${reviewId}`);
      
      console.log('✅ [AdminReviewsService] Reseña obtenida:', response);
      return response;
    } catch (error) {
      console.error('❌ [AdminReviewsService] Error obteniendo reseña:', error);
      throw error;
    }
  },

  // ==================== APROBAR RESEÑA ====================
  
  approve: async (reviewId) => {
    try {
      console.log('✅ [AdminReviewsService] Aprobando reseña:', reviewId);
      
      const response = await apiClient.patch(`${BASE_URL}/${reviewId}/approve`);
      
      console.log('✅ [AdminReviewsService] Reseña aprobada:', response);
      return response;
    } catch (error) {
      console.error('❌ [AdminReviewsService] Error aprobando reseña:', error);
      throw error;
    }
  },

  // ==================== RECHAZAR RESEÑA ====================
  
  reject: async (reviewId, reason = '') => {
    try {
      console.log('❌ [AdminReviewsService] Rechazando reseña:', reviewId, 'Razón:', reason);
      
      const response = await apiClient.patch(`${BASE_URL}/${reviewId}/reject`, {
        reason: reason
      });
      
      console.log('✅ [AdminReviewsService] Reseña rechazada:', response);
      return response;
    } catch (error) {
      console.error('❌ [AdminReviewsService] Error rechazando reseña:', error);
      throw error;
    }
  },

  // ==================== ELIMINAR RESEÑA ====================
  
  delete: async (reviewId) => {
    try {
      console.log('🗑️ [AdminReviewsService] Eliminando reseña:', reviewId);
      
      const response = await apiClient.delete(`${BASE_URL}/${reviewId}`);
      
      console.log('✅ [AdminReviewsService] Reseña eliminada:', response);
      return response;
    } catch (error) {
      console.error('❌ [AdminReviewsService] Error eliminando reseña:', error);
      throw error;
    }
  },

  // ==================== ACTUALIZAR RESEÑA ====================
  
  update: async (reviewId, updateData) => {
    try {
      console.log('📝 [AdminReviewsService] Actualizando reseña:', reviewId, updateData);
      
      const response = await apiClient.patch(`${BASE_URL}/${reviewId}`, updateData);
      
      console.log('✅ [AdminReviewsService] Reseña actualizada:', response);
      return response;
    } catch (error) {
      console.error('❌ [AdminReviewsService] Error actualizando reseña:', error);
      throw error;
    }
  },

  // ==================== OBTENER ESTADÍSTICAS ====================
  
  getStats: async () => {
    try {
      console.log('📊 [AdminReviewsService] Obteniendo estadísticas de reseñas');
      
      const response = await apiClient.get(`${BASE_URL}/stats`);
      
      console.log('✅ [AdminReviewsService] Estadísticas obtenidas:', response);
      return response;
    } catch (error) {
      console.error('❌ [AdminReviewsService] Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  // ==================== FILTRAR RESEÑAS ====================
  
  filter: async (filters = {}) => {
    try {
      console.log('🔍 [AdminReviewsService] Filtrando reseñas:', filters);
      
      const queryParams = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          queryParams.append(key, filters[key]);
        }
      });
      
      const url = `${BASE_URL}/filter?${queryParams.toString()}`;
      const response = await apiClient.get(url);
      
      console.log('✅ [AdminReviewsService] Reseñas filtradas:', response);
      return response;
    } catch (error) {
      console.error('❌ [AdminReviewsService] Error filtrando reseñas:', error);
      throw error;
    }
  }
};

export default AdminReviewsService;
