// src/services/paymentService.js - Servicio para pagos
import apiClient from '../api/ApiClient';

const paymentService = {
  // ==================== MÉTODOS DE PAGOS ====================

  /**
   * Obtener configuración pública de pagos
   */
  async getPaymentConfig() {
    try {
      console.log('⚙️ [paymentService] Obteniendo configuración de pagos');
      
      const response = await apiClient.get('/orders/payment/config');
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error obteniendo configuración:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Verificar estado de métodos de pago
   */
  async getPaymentStatus() {
    try {
      console.log('🔍 [paymentService] Verificando estado de pagos');
      
      const response = await apiClient.get('/orders/payment/status');
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error verificando estado:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Obtener estadísticas básicas de pagos
   */
  async getBasicStats(filters = {}) {
    try {
      console.log('📊 [paymentService] Obteniendo estadísticas:', filters);
      
      const response = await apiClient.get('/orders/payment/stats', {
        params: filters
      });
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error obteniendo estadísticas:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Procesar pago digital (Wompi)
   */
  async processDigitalPayment(orderId, customerData = {}) {
    try {
      console.log('💳 [paymentService] Procesando pago digital:', orderId);
      
      const response = await apiClient.post(`/orders/${orderId}/payment/digital`, {
        customerData
      });
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error procesando pago digital:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Registrar pago en efectivo
   */
  async registerCashPayment(orderId, cashData) {
    try {
      console.log('💰 [paymentService] Registrando pago en efectivo:', orderId);
      
      const response = await apiClient.post(`/orders/${orderId}/payment/cash`, cashData);
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error registrando pago efectivo:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Confirmar pago manualmente (admin)
   */
  async confirmManualPayment(orderId, paymentData) {
    try {
      console.log('✅ [paymentService] Confirmando pago manual:', orderId);
      
      const response = await apiClient.post(`/orders/${orderId}/payment/confirm`, paymentData);
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error confirmando pago:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Simular pago (desarrollo/testing)
   */
  async simulatePayment(orderId, status = 'approved') {
    try {
      console.log('🧪 [paymentService] Simulando pago:', orderId, status);
      
      const response = await apiClient.post(`/orders/${orderId}/payment/simulate`, {
        status
      });
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error simulando pago:', error);
      throw this.handleError(error);
    }
  },

  // ==================== MÉTODOS DE PAGO GUARDADOS ====================

  /**
   * Obtener métodos de pago del usuario
   */
  async getPaymentMethods(userId) {
    try {
      console.log('💳 [paymentService] Obteniendo métodos de pago:', userId);
      
      const response = await apiClient.get('/payment-methods');
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error obteniendo métodos:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Crear nuevo método de pago
   */
  async createPaymentMethod(paymentMethodData) {
    try {
      console.log('➕ [paymentService] Creando método de pago');
      
      const response = await apiClient.post('/payment-methods', paymentMethodData);
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error creando método:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Actualizar método de pago
   */
  async updatePaymentMethod(methodId, updateData) {
    try {
      console.log('✏️ [paymentService] Actualizando método:', methodId);
      
      const response = await apiClient.put(`/payment-methods/${methodId}`, updateData);
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error actualizando método:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Eliminar método de pago
   */
  async deletePaymentMethod(methodId) {
    try {
      console.log('🗑️ [paymentService] Eliminando método:', methodId);
      
      const response = await apiClient.delete(`/payment-methods/${methodId}`);
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error eliminando método:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Activar/desactivar método de pago
   */
  async togglePaymentMethod(methodId, active) {
    try {
      console.log('🔄 [paymentService] Cambiando estado método:', methodId, active);
      
      const response = await apiClient.patch(`/payment-methods/${methodId}/toggle`, {
        active
      });
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error cambiando estado:', error);
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
      switch (error.response.status) {
        case 400:
          console.error('❌ [paymentService] Datos inválidos');
          break;
        case 401:
          console.error('❌ [paymentService] Error de autenticación');
          break;
        case 403:
          console.error('❌ [paymentService] Sin permisos');
          break;
        case 404:
          console.error('❌ [paymentService] Recurso no encontrado');
          break;
        case 409:
          console.error('❌ [paymentService] Conflicto en la operación');
          break;
        case 422:
          console.error('❌ [paymentService] Error de validación');
          break;
        default:
          console.error('❌ [paymentService] Error del servidor');
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

export default paymentService;