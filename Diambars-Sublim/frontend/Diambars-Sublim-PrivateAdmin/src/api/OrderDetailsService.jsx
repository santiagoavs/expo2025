// api/OrderDetailsService.jsx - Servicio para detalles avanzados de órdenes
import apiClient from './ApiClient';

export const orderDetailsService = {
  
  /**
   * Obtener detalles de pago de una orden
   */
  async getPaymentDetails(orderId) {
    try {
      console.log('💳 [OrderDetailsService] Obteniendo detalles de pago:', orderId);
      
      const response = await apiClient.get(`/orders/${orderId}/payment-details`);
      
      if (response.success) {
        console.log('✅ [OrderDetailsService] Detalles de pago obtenidos:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Error obteniendo detalles de pago');
      }
    } catch (error) {
      console.error('❌ [OrderDetailsService] Error obteniendo detalles de pago:', error);
      throw error;
    }
  },

  /**
   * Obtener línea de tiempo de una orden
   */
  async getOrderTimeline(orderId) {
    try {
      console.log('📅 [OrderDetailsService] Obteniendo timeline:', orderId);
      
      const response = await apiClient.get(`/orders/${orderId}/timeline`);
      
      if (response.success) {
        console.log('✅ [OrderDetailsService] Timeline obtenido:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Error obteniendo timeline');
      }
    } catch (error) {
      console.error('❌ [OrderDetailsService] Error obteniendo timeline:', error);
      throw error;
    }
  },

  /**
   * Subir foto de producción
   */
  async uploadProductionPhoto(orderId, photoData) {
    try {
      console.log('📸 [OrderDetailsService] Subiendo foto de producción:', orderId, photoData.stage);
      
      const formData = new FormData();
      formData.append('photo', photoData.file);
      formData.append('stage', photoData.stage);
      formData.append('notes', photoData.notes || '');
      formData.append('isQualityPhoto', photoData.isQualityPhoto || false);
      
      const response = await apiClient.post(`/production/orders/${orderId}/photos`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.success) {
        console.log('✅ [OrderDetailsService] Foto subida exitosamente:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Error subiendo foto');
      }
    } catch (error) {
      console.error('❌ [OrderDetailsService] Error subiendo foto:', error);
      throw error;
    }
  },

  /**
   * Obtener fotos de producción de una orden
   */
  async getProductionPhotos(orderId) {
    try {
      console.log('📷 [OrderDetailsService] Obteniendo fotos de producción:', orderId);
      
      const response = await apiClient.get(`/production/orders/${orderId}/photos`);
      
      if (response.success) {
        console.log('✅ [OrderDetailsService] Fotos obtenidas:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Error obteniendo fotos');
      }
    } catch (error) {
      console.error('❌ [OrderDetailsService] Error obteniendo fotos:', error);
      throw error;
    }
  },

  /**
   * Actualizar estado de orden con los nuevos estados
   */
  async updateOrderStatus(orderId, status, notes = '') {
    try {
      console.log('🔄 [OrderDetailsService] Actualizando estado:', orderId, status);
      
      const response = await apiClient.patch(`/orders/${orderId}/status`, {
        status,
        notes
      });
      
      if (response.success) {
        console.log('✅ [OrderDetailsService] Estado actualizado:', response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Error actualizando estado');
      }
    } catch (error) {
      console.error('❌ [OrderDetailsService] Error actualizando estado:', error);
      throw error;
    }
  }
};

export default orderDetailsService;
