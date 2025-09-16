// src/services/orderService.js - Servicio para órdenes
import apiClient from './ApiClient';

const orderService = {
  // ==================== MÉTODOS DE ÓRDENES ====================
  
  /**
   * Obtener todas las órdenes con filtros
   */
  async getOrders(filters = {}) {
    try {
      console.log('📦 [orderService] Obteniendo órdenes con filtros:', filters);
      
      const response = await apiClient.get('/orders', {
        params: {
          ...filters,
          page: filters.page || 1,
          limit: filters.limit || 20
        }
      });
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error obteniendo órdenes:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Obtener orden específica por ID
   */
  async getOrderById(orderId) {
    try {
      console.log('🔍 [orderService] Obteniendo orden:', orderId);
      
      const response = await apiClient.get(`/orders/${orderId}`);
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error obteniendo orden:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Crear nuevo pedido
   */
  async createOrder(orderData) {
    try {
      console.log('📝 [orderService] Creando orden:', orderData);
      
      const response = await apiClient.post('/orders', orderData);
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error creando orden:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Cotizar pedido manualmente
   */
  async submitQuote(orderId, quoteData) {
    try {
      console.log('💰 [orderService] Enviando cotización:', orderId, quoteData);
      
      const response = await apiClient.post(`/orders/${orderId}/quote`, quoteData);
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error enviando cotización:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Actualizar estado de orden
   */
  async updateOrderStatus(orderId, newStatus, notes = '') {
    try {
      console.log('🔄 [orderService] Actualizando estado:', orderId, newStatus);
      
      const response = await apiClient.patch(`/orders/${orderId}/status`, {
        status: newStatus,
        notes
      });
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error actualizando estado:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Cancelar orden
   */
  async cancelOrder(orderId, reason = '') {
    try {
      console.log('❌ [orderService] Cancelando orden:', orderId);
      
      const response = await apiClient.patch(`/orders/${orderId}/cancel`, {
        reason
      });
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error cancelando orden:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Obtener tracking de orden
   */
  async getOrderTracking(orderId) {
    try {
      console.log('📍 [orderService] Obteniendo tracking:', orderId);
      
      const response = await apiClient.get(`/orders/${orderId}/tracking`);
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error obteniendo tracking:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Subir foto de producción
   */
  async uploadProductionPhoto(orderId, photoData) {
    try {
      console.log('📸 [orderService] Subiendo foto de producción:', orderId);
      
      const formData = new FormData();
      formData.append('photo', photoData.file);
      formData.append('stage', photoData.stage);
      if (photoData.notes) {
        formData.append('notes', photoData.notes);
      }
      
      const response = await apiClient.post(`/orders/${orderId}/production-photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error subiendo foto:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Actualizar progreso de producción
   */
  async updateProductionProgress(orderId, itemId, stageData) {
    try {
      console.log('⚙️ [orderService] Actualizando progreso:', orderId, itemId, stageData);
      
      const response = await apiClient.patch(`/orders/${orderId}/items/${itemId}/progress`, stageData);
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error actualizando progreso:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Manejo de errores centralizado
   */
  handleError(error) {
    if (error.response) {
      // Error de respuesta del servidor
      const errorData = {
        status: error.response.status,
        message: error.response.data?.message || 'Error del servidor',
        errors: error.response.data?.errors || null,
        code: error.response.data?.error || 'SERVER_ERROR'
      };
      
      // Logs específicos para diferentes errores
      if (error.response.status === 401) {
        console.error('❌ [orderService] Error de autenticación');
      } else if (error.response.status === 403) {
        console.error('❌ [orderService] Sin permisos');
      } else if (error.response.status === 404) {
        console.error('❌ [orderService] Recurso no encontrado');
      }
      
      return errorData;
    } else if (error.request) {
      // Error de conexión
      return {
        status: 0,
        message: 'Error de conexión. Verifica tu internet.',
        code: 'NETWORK_ERROR'
      };
    } else {
      // Error de configuración
      return {
        status: 0,
        message: error.message || 'Error inesperado',
        code: 'CLIENT_ERROR'
      };
    }
  }
};

export default orderService;