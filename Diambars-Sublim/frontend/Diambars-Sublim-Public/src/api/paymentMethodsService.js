import apiClient from './apiClient';

export const paymentMethodsService = {
  // Obtener todos los métodos de pago del usuario
  getPaymentMethods: async () => {
    try {
      console.log('🔍 [paymentMethodsService] Obteniendo métodos de pago del usuario');
      
      const response = await apiClient.get('/payment-methods');
      
      console.log('✅ [paymentMethodsService] Métodos obtenidos:', response);
      return response.paymentMethods || response.data || response;
    } catch (error) {
      console.error('❌ [paymentMethodsService] Error obteniendo métodos:', error);
      throw error;
    }
  },

  // Crear un nuevo método de pago
  createPaymentMethod: async (paymentData) => {
    try {
      console.log('🆕 [paymentMethodsService] Creando método de pago:', {
        ...paymentData,
        number: paymentData.number ? `****${paymentData.number.slice(-4)}` : 'N/A',
        cvc: '***'
      });
      
      const response = await apiClient.post('/payment-methods', paymentData);
      
      console.log('✅ [paymentMethodsService] Método creado:', response);
      return response.paymentMethod || response.data || response;
    } catch (error) {
      console.error('❌ [paymentMethodsService] Error creando método:', error);
      throw error;
    }
  },

  // Actualizar un método de pago
  updatePaymentMethod: async (methodId, paymentData) => {
    try {
      console.log('🔄 [paymentMethodsService] Actualizando método:', methodId, {
        ...paymentData,
        number: paymentData.number ? `****${paymentData.number.slice(-4)}` : 'N/A',
        cvc: '***'
      });
      
      const response = await apiClient.put(`/payment-methods/${methodId}`, paymentData);
      
      console.log('✅ [paymentMethodsService] Método actualizado:', response);
      return response.paymentMethod || response.data || response;
    } catch (error) {
      console.error('❌ [paymentMethodsService] Error actualizando método:', error);
      throw error;
    }
  },

  // Eliminar un método de pago
  deletePaymentMethod: async (methodId) => {
    try {
      console.log('🗑️ [paymentMethodsService] Eliminando método:', methodId);
      
      const response = await apiClient.delete(`/payment-methods/${methodId}`);
      
      console.log('✅ [paymentMethodsService] Método eliminado');
      return response;
    } catch (error) {
      console.error('❌ [paymentMethodsService] Error eliminando método:', error);
      throw error;
    }
  },

  // Activar/desactivar un método de pago
  togglePaymentMethod: async (methodId, isActive) => {
    try {
      console.log('🔄 [paymentMethodsService] Cambiando estado del método:', methodId, 'activo:', isActive);
      
      const response = await apiClient.patch(`/payment-methods/${methodId}/toggle`, {
        active: isActive
      });
      
      console.log('✅ [paymentMethodsService] Estado cambiado');
      return response.paymentMethod || response.data || response;
    } catch (error) {
      console.error('❌ [paymentMethodsService] Error cambiando estado:', error);
      throw error;
    }
  }
};