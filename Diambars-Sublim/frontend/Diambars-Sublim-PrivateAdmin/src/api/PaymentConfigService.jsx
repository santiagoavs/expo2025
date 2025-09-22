// src/api/PaymentConfigService.jsx - Servicio para configuración de métodos de pago del sistema
import apiClient from './ApiClient';

const paymentConfigService = {
  // ==================== CONFIGURACIÓN DE MÉTODOS DE PAGO ====================

  /**
   * Obtener todas las configuraciones de métodos de pago
   */
  async getPaymentConfigs() {
    try {
      console.log('⚙️ [paymentConfigService] Obteniendo configuraciones de métodos de pago');
      
      const response = await apiClient.get('/payment-config');
      
      return response;
    } catch (error) {
      console.error('❌ [paymentConfigService] Error obteniendo configuraciones:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Obtener configuración pública (sin datos sensibles)
   */
  async getPublicPaymentConfig() {
    try {
      console.log('🌐 [paymentConfigService] Obteniendo configuración pública');
      
      const response = await apiClient.get('/payment-config/public');
      
      return response;
    } catch (error) {
      console.error('❌ [paymentConfigService] Error obteniendo configuración pública:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Crear o actualizar configuración de método de pago
   */
  async upsertPaymentConfig(configData) {
    try {
      console.log('➕ [paymentConfigService] Creando/actualizando configuración:', configData.type);
      
      const response = await apiClient.post('/payment-config', configData);
      
      return response;
    } catch (error) {
      console.error('❌ [paymentConfigService] Error creando/actualizando configuración:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Actualizar configuración existente
   */
  async updatePaymentConfig(type, configData) {
    try {
      console.log('✏️ [paymentConfigService] Actualizando configuración:', type);
      
      const response = await apiClient.put(`/payment-config/${type}`, configData);
      
      return response;
    } catch (error) {
      console.error('❌ [paymentConfigService] Error actualizando configuración:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Eliminar configuración de método de pago
   */
  async deletePaymentConfig(type) {
    try {
      console.log('🗑️ [paymentConfigService] Eliminando configuración:', type);
      
      const response = await apiClient.delete(`/payment-config/${type}`);
      
      return response;
    } catch (error) {
      console.error('❌ [paymentConfigService] Error eliminando configuración:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Obtener estadísticas de métodos de pago
   */
  async getPaymentStats() {
    try {
      console.log('📊 [paymentConfigService] Obteniendo estadísticas de pagos');
      
      const response = await apiClient.get('/payment-config/stats');
      
      return response;
    } catch (error) {
      console.error('❌ [paymentConfigService] Error obteniendo estadísticas:', error);
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
          console.error('❌ [paymentConfigService] Datos inválidos');
          break;
        case 401:
          console.error('❌ [paymentConfigService] Error de autenticación');
          break;
        case 403:
          console.error('❌ [paymentConfigService] Sin permisos');
          break;
        case 404:
          console.error('❌ [paymentConfigService] Recurso no encontrado');
          break;
        case 409:
          console.error('❌ [paymentConfigService] Conflicto en la operación');
          break;
        case 422:
          console.error('❌ [paymentConfigService] Error de validación');
          break;
        default:
          console.error('❌ [paymentConfigService] Error del servidor');
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

export default paymentConfigService;
