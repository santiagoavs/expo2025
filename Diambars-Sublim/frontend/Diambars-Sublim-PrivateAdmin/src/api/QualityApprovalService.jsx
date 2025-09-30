import apiClient from './ApiClient';

const qualityApprovalService = {
  // Obtener información de la orden para aprobación
  async getOrderForApproval(orderId) {
    try {
      console.log('🔍 [QualityApprovalService] Obteniendo orden para aprobación:', orderId);
      
      const response = await apiClient.get(`/quality-approval/${orderId}/info`);
      
      console.log('✅ [QualityApprovalService] Orden obtenida:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [QualityApprovalService] Error obteniendo orden:', error);
      throw error;
    }
  },

  // Enviar respuesta del cliente
  async submitClientResponse(orderId, responseData) {
    try {
      console.log('📤 [QualityApprovalService] Enviando respuesta del cliente:', {
        orderId,
        responseData
      });
      
      const response = await apiClient.post(`/quality-approval/${orderId}/respond`, responseData);
      
      console.log('✅ [QualityApprovalService] Respuesta enviada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [QualityApprovalService] Error enviando respuesta:', error);
      throw error;
    }
  },

  // Obtener estado de aprobación
  async getApprovalStatus(orderId) {
    try {
      console.log('🔍 [QualityApprovalService] Obteniendo estado de aprobación:', orderId);
      
      const response = await apiClient.get(`/quality-approval/${orderId}/status`);
      
      console.log('✅ [QualityApprovalService] Estado obtenido:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [QualityApprovalService] Error obteniendo estado:', error);
      throw error;
    }
  },

  // Obtener historial de respuestas del cliente
  async getClientResponses(orderId) {
    try {
      console.log('🔍 [QualityApprovalService] Obteniendo respuestas del cliente:', orderId);
      
      const response = await apiClient.get(`/quality-approval/${orderId}/responses`);
      
      console.log('✅ [QualityApprovalService] Respuestas obtenidas:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [QualityApprovalService] Error obteniendo respuestas:', error);
      throw error;
    }
  }
};

export { qualityApprovalService };
