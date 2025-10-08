import apiClient from './apiClient';

export const paymentMethodsService = {
  // Obtener todos los métodos de pago del usuario
  getPaymentMethods: async () => {
    try {
      console.log('🔍 [paymentMethodsService] Obteniendo métodos de pago del usuario');
      
      const response = await apiClient.get('/user/payment-methods');
      
      console.log('✅ [paymentMethodsService] Métodos obtenidos:', response);
      return response.paymentMethods || response.data || response;
    } catch (error) {
      console.error('❌ [paymentMethodsService] Error obteniendo métodos:', error);
      throw error;
    }
  },

  // Obtener un método de pago específico
  getPaymentMethod: async (methodId) => {
    try {
      console.log('🔍 [paymentMethodsService] Obteniendo método específico:', methodId);
      
      const response = await apiClient.get(`/user/payment-methods/${methodId}`);
      
      console.log('✅ [paymentMethodsService] Método obtenido:', response);
      return response.paymentMethod || response.data || response;
    } catch (error) {
      console.error('❌ [paymentMethodsService] Error obteniendo método:', error);
      throw error;
    }
  },

  // Crear un nuevo método de pago (con tokenización)
  createPaymentMethod: async (cardData, setAsDefault = false) => {
    try {
      console.log('🆕 [paymentMethodsService] Creando método de pago:', {
        number: cardData.number ? `****${cardData.number.slice(-4)}` : 'N/A',
        exp_month: cardData.expiry ? cardData.expiry.split('/')[0] : 'N/A',
        exp_year: cardData.expiry ? cardData.expiry.split('/')[1] : 'N/A',
        card_holder: cardData.name,
        nickname: cardData.nickname,
        setAsDefault
      });
      
      // Transformar datos del formato react-credit-cards al formato Wompi
      const wompiCardData = {
        number: cardData.number.replace(/\s/g, ''),
        cvc: cardData.cvc || '123', // CVC temporal para tokenización
        exp_month: cardData.expiry.split('/')[0],
        exp_year: cardData.expiry.split('/')[1],
        card_holder: cardData.name,
        nickname: cardData.nickname
      };
      
      const response = await apiClient.post('/user/payment-methods', {
        cardData: wompiCardData,
        setAsDefault
      });
      
      console.log('✅ [paymentMethodsService] Método creado:', response);
      return response.paymentMethod || response.data || response;
    } catch (error) {
      console.error('❌ [paymentMethodsService] Error creando método:', error);
      throw error;
    }
  },

  // Actualizar un método de pago (solo nickname y configuración)
  updatePaymentMethod: async (methodId, updateData) => {
    try {
      console.log('🔄 [paymentMethodsService] Actualizando método:', methodId, updateData);
      
      const response = await apiClient.put(`/user/payment-methods/${methodId}`, updateData);
      
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
      
      const response = await apiClient.delete(`/user/payment-methods/${methodId}`);
      
      console.log('✅ [paymentMethodsService] Método eliminado');
      return response;
    } catch (error) {
      console.error('❌ [paymentMethodsService] Error eliminando método:', error);
      throw error;
    }
  },

  // Marcar método como por defecto
  setDefaultPaymentMethod: async (methodId) => {
    try {
      console.log('⭐ [paymentMethodsService] Marcando método como por defecto:', methodId);
      
      const response = await apiClient.patch(`/user/payment-methods/${methodId}/default`);
      
      console.log('✅ [paymentMethodsService] Método marcado como por defecto');
      return response.paymentMethod || response.data || response;
    } catch (error) {
      console.error('❌ [paymentMethodsService] Error marcando como por defecto:', error);
      throw error;
    }
  },

  // Obtener estadísticas de métodos de pago
  getPaymentMethodStats: async () => {
    try {
      console.log('📊 [paymentMethodsService] Obteniendo estadísticas');
      
      const response = await apiClient.get('/user/payment-methods/stats');
      
      console.log('✅ [paymentMethodsService] Estadísticas obtenidas:', response);
      return response.stats || response.data || response;
    } catch (error) {
      console.error('❌ [paymentMethodsService] Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  // Método de compatibilidad para toggle (mapea a setDefault)
  togglePaymentMethod: async (methodId, isActive) => {
    try {
      console.log('🔄 [paymentMethodsService] Toggle método (compatibilidad):', methodId, 'activo:', isActive);
      
      if (isActive) {
        // Si se está activando, marcarlo como por defecto
        return await this.setDefaultPaymentMethod(methodId);
      } else {
        // Si se está desactivando, no hay acción específica (las tarjetas no se "desactivan")
        console.log('ℹ️ [paymentMethodsService] No se puede desactivar tarjeta, use eliminar en su lugar');
        throw new Error('Para desactivar una tarjeta, elimínela en su lugar');
      }
    } catch (error) {
      console.error('❌ [paymentMethodsService] Error en toggle:', error);
      throw error;
    }
  }
};