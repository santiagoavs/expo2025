// src/api/reviewService.js
import apiClient from './ApiClient';

const BASE_URL = '/reviews';

const reviewService = {
  // Obtener todas las reseñas
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

      console.log('🔍 [ReviewService-Mobile] Obteniendo reseñas con params:', params);

      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (status && status.trim() !== '') queryParams.append('status', status);
      if (search && search.trim() !== '') queryParams.append('search', search.trim());
      if (sort) queryParams.append('sort', sort);
      if (rating) queryParams.append('rating', rating);

      const url = `${BASE_URL}?${queryParams.toString()}`;
      console.log('📡 [ReviewService-Mobile] URL:', url);

      const response = await apiClient.get(url);
      console.log('✅ [ReviewService-Mobile] Reseñas obtenidas:', response);
      return response;
    } catch (error) {
      console.error('❌ [ReviewService-Mobile] Error obteniendo reseñas:', error);
      throw error;
    }
  },

  // Obtener reseña por ID
  getById: async (reviewId) => {
    try {
      console.log(`🔍 [ReviewService-Mobile] Obteniendo reseña ${reviewId}`);
      
      const response = await apiClient.get(`${BASE_URL}/${reviewId}`);
      console.log('✅ [ReviewService-Mobile] Reseña obtenida:', response);
      return response;
    } catch (error) {
      console.error('❌ [ReviewService-Mobile] Error obteniendo reseña:', error);
      throw error;
    }
  },

  // Aprobar reseña
  approve: async (reviewId) => {
    try {
      console.log(`✅ [ReviewService-Mobile] Aprobando reseña ${reviewId}`);
      
      const response = await apiClient.patch(`${BASE_URL}/${reviewId}/approve`, {}, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 segundos
      });
      
      console.log('✅ [ReviewService-Mobile] Reseña aprobada:', response);
      return response;
    } catch (error) {
      console.error('❌ [ReviewService-Mobile] Error aprobando reseña:', error);
      throw error;
    }
  },

  // Rechazar reseña
  reject: async (reviewId, reason = '') => {
    try {
      console.log(`❌ [ReviewService-Mobile] Rechazando reseña ${reviewId}, razón: ${reason}`);
      
      const response = await apiClient.patch(`${BASE_URL}/${reviewId}/reject`, {
        reason: reason
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 segundos
      });
      
      console.log('✅ [ReviewService-Mobile] Reseña rechazada:', response);
      return response;
    } catch (error) {
      console.error('❌ [ReviewService-Mobile] Error rechazando reseña:', error);
      throw error;
    }
  },

  // Eliminar reseña
  delete: async (reviewId) => {
    try {
      console.log(`🗑️ [ReviewService-Mobile] Eliminando reseña ${reviewId}`);
      
      const response = await apiClient.delete(`${BASE_URL}/${reviewId}`, {
        timeout: 30000, // 30 segundos
      });
      
      console.log('✅ [ReviewService-Mobile] Reseña eliminada:', response);
      return response;
    } catch (error) {
      console.error('❌ [ReviewService-Mobile] Error eliminando reseña:', error);
      throw error;
    }
  },

  // Obtener estadísticas de reseñas
  getStats: async () => {
    try {
      console.log('📊 [ReviewService-Mobile] Obteniendo estadísticas de reseñas');
      
      const response = await apiClient.get(`${BASE_URL}/stats`);
      console.log('✅ [ReviewService-Mobile] Estadísticas obtenidas:', response);
      return response;
    } catch (error) {
      console.error('❌ [ReviewService-Mobile] Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  // Responder a reseña
  respond: async (reviewId, responseText) => {
    try {
      console.log(`💬 [ReviewService-Mobile] Respondiendo a reseña ${reviewId}`);
      
      const response = await apiClient.post(`${BASE_URL}/${reviewId}/respond`, {
        response: responseText
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 segundos
      });
      
      console.log('✅ [ReviewService-Mobile] Respuesta enviada:', response);
      return response;
    } catch (error) {
      console.error('❌ [ReviewService-Mobile] Error respondiendo a reseña:', error);
      throw error;
    }
  },

  // Marcar como destacada
  feature: async (reviewId, featured = true) => {
    try {
      console.log(`⭐ [ReviewService-Mobile] ${featured ? 'Destacando' : 'Quitando destacado'} reseña ${reviewId}`);
      
      const response = await apiClient.patch(`${BASE_URL}/${reviewId}/feature`, {
        featured: featured
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 30000, // 30 segundos
      });
      
      console.log('✅ [ReviewService-Mobile] Reseña actualizada:', response);
      return response;
    } catch (error) {
      console.error('❌ [ReviewService-Mobile] Error actualizando reseña:', error);
      throw error;
    }
  }
};

export default reviewService;
