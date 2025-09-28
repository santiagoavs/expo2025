// src/api/PaymentService.jsx - Servicio para gestión de pagos (Admin)
import apiClient from './ApiClient';

const paymentService = {
  // ==================== PROCESAMIENTO DE PAGOS ====================
  
  /**
   * Procesar cualquier tipo de pago
   */
  async processPayment(orderId, paymentData) {
    try {
      console.log('💳 [paymentService] Procesando pago para orden:', orderId, paymentData);
      
      const response = await apiClient.post(`/payments/create`, { orderId, ...paymentData });
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error procesando pago:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Confirmar pago (efectivo/transferencia)
   */
  async confirmPayment(paymentId, confirmationData) {
    try {
      console.log('✅ [paymentService] Confirmando pago:', paymentId, confirmationData);
      
      const response = await apiClient.post(`/payments/${paymentId}/confirm`, confirmationData);
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error confirmando pago:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Subir comprobante de transferencia
   */
  async submitTransferProof(paymentId, formData) {
    try {
      console.log('📎 [paymentService] Subiendo comprobante:', paymentId);
      
      const response = await apiClient.post(`/payments/${paymentId}/transfer-proof`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error subiendo comprobante:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Cancelar pago
   */
  async cancelPayment(paymentId, reason) {
    try {
      console.log('❌ [paymentService] Cancelando pago:', paymentId);
      
      const response = await apiClient.post(`/payments/${paymentId}/cancel`, { reason });
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error cancelando pago:', error);
      throw this.handleError(error);
    }
  },

  // ==================== CONSULTAS ====================
  
  /**
   * Obtener estado de pagos de una orden
   */
  async getOrderPaymentStatus(orderId) {
    try {
      console.log('📊 [paymentService] Obteniendo estado de pagos:', orderId);
      
      const response = await apiClient.get(`/payments/status/${orderId}`);
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error obteniendo estado:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Obtener detalles de un pago
   */
  async getPaymentDetails(paymentId) {
    try {
      console.log('🔍 [paymentService] Obteniendo detalles de pago:', paymentId);
      
      const response = await apiClient.get(`/payments/${paymentId}`);
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error obteniendo detalles:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Listar pagos con filtros (admin)
   */
  async listPayments(filters = {}) {
    try {
      console.log('📋 [paymentService] Listando pagos:', filters);
      
      const response = await apiClient.get('/payments', {
        params: {
          ...filters,
          page: filters.page || 1,
          limit: filters.limit || 20
        }
      });
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error listando pagos:', error);
      throw this.handleError(error);
    }
  },

  // ==================== MÉTODOS ESPECÍFICOS ====================
  
  /**
   * Obtener transferencias pendientes
   */
  async getPendingTransfers() {
    try {
      console.log('⏳ [paymentService] Obteniendo transferencias pendientes');
      
      const response = await apiClient.get('/payments/transfers/pending');
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error obteniendo transferencias:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Generar reporte de efectivo
   */
  async generateCashReport(filters = {}) {
    try {
      console.log('💵 [paymentService] Generando reporte de efectivo:', filters);
      
      const response = await apiClient.get('/payments/reports/cash', {
        params: filters
      });
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error generando reporte:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Reenviar instrucciones de transferencia
   */
  async resendTransferInstructions(paymentId) {
    try {
      console.log('📧 [paymentService] Reenviando instrucciones:', paymentId);
      
      const response = await apiClient.post(`/payments/${paymentId}/resend-instructions`);
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error reenviando instrucciones:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Rechazar transferencia
   */
  async rejectTransfer(paymentId, reason) {
    try {
      console.log('❌ [paymentService] Rechazando transferencia:', paymentId);
      
      const response = await apiClient.post(`/payments/${paymentId}/reject`, { reason });
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error rechazando transferencia:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Historial de pagos de un cliente
   */
  async getCustomerPaymentHistory(userId, filters = {}) {
    try {
      console.log('📊 [paymentService] Obteniendo historial cliente:', userId);
      
      const response = await apiClient.get(`/payments/customers/${userId}/history`, {
        params: filters
      });
      
      return response;
    } catch (error) {
      console.error('❌ [paymentService] Error obteniendo historial:', error);
      throw this.handleError(error);
    }
  },

  // ==================== UTILIDADES ====================
  
  /**
   * Formatear datos de pago para mostrar
   */
  formatPaymentForDisplay(payment) {
    if (!payment) return null;
    
    const methodLabels = {
      wompi: 'Tarjeta/Wompi',
      cash: 'Efectivo',
      bank_transfer: 'Transferencia'
    };
    
    const statusLabels = {
      pending: 'Pendiente',
      processing: 'Procesando',
      completed: 'Completado',
      failed: 'Fallido',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado'
    };
    
    return {
      ...payment,
      methodLabel: methodLabels[payment.method] || payment.method,
      statusLabel: statusLabels[payment.status] || payment.status,
      formattedAmount: new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'USD'
      }).format(payment.amount),
      isCompleted: payment.status === 'completed',
      isPending: payment.status === 'pending',
      canBeProcessed: ['pending', 'processing'].includes(payment.status)
    };
  },

  /**
   * Validar datos de pago
   */
  validatePaymentData(paymentData) {
    const errors = [];
    
    if (!paymentData.method) {
      errors.push('Método de pago requerido');
    }
    
    if (!['wompi', 'cash', 'bank_transfer'].includes(paymentData.method)) {
      errors.push('Método de pago inválido');
    }
    
    if (paymentData.amount !== undefined && paymentData.amount <= 0) {
      errors.push('Monto debe ser mayor a 0');
    }
    
    if (paymentData.percentage !== undefined) {
      if (paymentData.percentage < 1 || paymentData.percentage > 100) {
        errors.push('Porcentaje debe estar entre 1 y 100');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Manejo de errores centralizado
   */
  handleError(error) {
    if (error.response?.data) {
      return {
        message: error.response.data.message || 'Error en el servicio de pagos',
        code: error.response.data.error || 'PAYMENT_ERROR',
        statusCode: error.response.status
      };
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return {
        message: 'Error de conexión. Verifica tu conexión a internet.',
        code: 'NETWORK_ERROR'
      };
    }
    
    return {
      message: error.message || 'Error desconocido en pagos',
      code: 'UNKNOWN_ERROR'
    };
  }
};

export default paymentService;