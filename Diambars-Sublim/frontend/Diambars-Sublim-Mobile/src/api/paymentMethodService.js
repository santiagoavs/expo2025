// src/api/paymentMethodService.js - Servicio para métodos de pago en la app móvil
import ApiClient from './ApiClient';

const paymentMethodService = {
  // ==================== MÉTODOS DE PAGO DE ADMINISTRACIÓN ====================

  /**
   * Obtener todas las configuraciones de métodos de pago (ADMIN)
   */
  async getPaymentConfigs() {
    try {
      console.log('⚙️ [paymentMethodService] Obteniendo configuraciones de métodos de pago');
      
      const response = await ApiClient.get('/payment-config');
      
      console.log('🔍 [paymentMethodService] Respuesta recibida:', response);
      
      // Validar que la respuesta tenga la estructura esperada
      if (response && response.success && Array.isArray(response.configs)) {
        console.log(`✅ [paymentMethodService] ${response.configs.length} configuraciones obtenidas`);
        return response;
      } else {
        console.warn('⚠️ [paymentMethodService] Respuesta con estructura inesperada:', response);
        return {
          success: true,
          configs: [],
          count: 0,
          message: 'No hay configuraciones disponibles'
        };
      }
    } catch (error) {
      console.error('❌ [paymentMethodService] Error obteniendo configuraciones:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Obtener estadísticas de métodos de pago (ADMIN)
   */
  async getPaymentStats() {
    try {
      console.log('📊 [paymentMethodService] Obteniendo estadísticas de pagos');
      
      const response = await ApiClient.get('/payment-config/stats');
      
      console.log('🔍 [paymentMethodService] Estadísticas recibidas:', response);
      
      // Validar que la respuesta tenga la estructura esperada
      if (response && response.success && response.stats) {
        console.log(`✅ [paymentMethodService] Estadísticas obtenidas: ${response.stats.totalMethods} métodos totales`);
        return response;
      } else {
        console.warn('⚠️ [paymentMethodService] Respuesta de estadísticas con estructura inesperada:', response);
        return {
          success: true,
          stats: {
            totalMethods: 0,
            activeMethods: 0,
            inactiveMethods: 0,
            methods: []
          }
        };
      }
    } catch (error) {
      console.error('❌ [paymentMethodService] Error obteniendo estadísticas:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Crear nueva configuración de método de pago (ADMIN)
   */
  async createPaymentConfig(configData) {
    try {
      console.log('➕ [paymentMethodService] Creando nueva configuración:', configData.type);
      
      const response = await ApiClient.post('/payment-config', configData);
      
      return response;
    } catch (error) {
      console.error('❌ [paymentMethodService] Error creando configuración:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Actualizar configuración existente (ADMIN)
   */
  async updatePaymentConfig(type, configData) {
    try {
      console.log('✏️ [paymentMethodService] Actualizando configuración:', type);
      
      const response = await ApiClient.put(`/payment-config/${type}`, configData);
      
      return response;
    } catch (error) {
      console.error('❌ [paymentMethodService] Error actualizando configuración:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Eliminar configuración de método de pago (ADMIN)
   */
  async deletePaymentConfig(type) {
    try {
      console.log('🗑️ [paymentMethodService] Eliminando configuración:', type);
      
      const response = await ApiClient.delete(`/payment-config/${type}`);
      
      return response;
    } catch (error) {
      console.error('❌ [paymentMethodService] Error eliminando configuración:', error);
      throw this.handleError(error);
    }
  },

  // ==================== MÉTODOS DE PAGO PÚBLICOS ====================

  /**
   * Obtener métodos de pago disponibles públicamente
   */
  async getAvailablePaymentMethods() {
    try {
      console.log('🌐 [paymentMethodService] Obteniendo métodos de pago disponibles');
      
      const response = await ApiClient.get('/payment-config/public/available');
      
      console.log('🔍 [paymentMethodService] Respuesta recibida:', response);
      
      // Validar que la respuesta tenga la estructura esperada
      if (response && response.success && Array.isArray(response.methods)) {
        console.log(`✅ [paymentMethodService] ${response.methods.length} métodos disponibles`);
        return response;
      } else {
        console.warn('⚠️ [paymentMethodService] Respuesta con estructura inesperada:', response);
        return {
          success: true,
          methods: [],
          count: 0,
          message: 'No hay métodos de pago disponibles'
        };
      }
    } catch (error) {
      console.error('❌ [paymentMethodService] Error obteniendo métodos disponibles:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Obtener configuración pública de métodos de pago
   */
  async getPublicPaymentConfig() {
    try {
      console.log('🌐 [paymentMethodService] Obteniendo configuración pública');
      
      const response = await ApiClient.get('/payment-config/public');
      
      return response;
    } catch (error) {
      console.error('❌ [paymentMethodService] Error obteniendo configuración pública:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Obtener configuración por tipo de método
   */
  async getPaymentMethodByType(type) {
    try {
      console.log(`🔍 [paymentMethodService] Obteniendo método: ${type}`);
      
      const response = await ApiClient.get(`/payment-config/${type}`);
      
      return response;
    } catch (error) {
      console.error(`❌ [paymentMethodService] Error obteniendo método ${type}:`, error);
      throw this.handleError(error);
    }
  },

  /**
   * Obtener tipos de métodos soportados
   */
  async getSupportedTypes() {
    try {
      console.log('📋 [paymentMethodService] Obteniendo tipos soportados');
      
      const response = await ApiClient.get('/payment-config/supported-types');
      
      return response;
    } catch (error) {
      console.error('❌ [paymentMethodService] Error obteniendo tipos soportados:', error);
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
          console.error('❌ [paymentMethodService] Datos inválidos');
          break;
        case 401:
          console.error('❌ [paymentMethodService] Error de autenticación');
          break;
        case 403:
          console.error('❌ [paymentMethodService] Sin permisos');
          break;
        case 404:
          console.error('❌ [paymentMethodService] Método no encontrado');
          break;
        case 409:
          console.error('❌ [paymentMethodService] Conflicto en la operación');
          break;
        case 422:
          console.error('❌ [paymentMethodService] Error de validación');
          break;
        default:
          console.error('❌ [paymentMethodService] Error del servidor');
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

export default paymentMethodService;
