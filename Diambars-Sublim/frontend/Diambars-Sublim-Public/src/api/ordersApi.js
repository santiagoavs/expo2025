// api/OrdersAPI.js
import apiClient from './apiClient';

export const ordersAPI = {
  // Obtener órdenes del usuario actual
  getMyOrders: async (filters = {}) => {
    console.log('📋 [ordersApi] Fetching user orders with filters:', filters);
    
    // Remove userId from filters as it's not needed in the query params
    const { userId, ...queryParams } = filters;
    
    try {
      const response = await apiClient.get('orders/user/me', { 
        params: {
          ...queryParams,
          // Default sorting and limiting
          sort: queryParams.sort || 'createdAt',
          order: queryParams.order || 'desc',
          limit: queryParams.limit || 10
        }
      });
      
      console.log('📦 [ordersApi] Orders response:', {
        success: response.success,
        count: response.data?.orders?.length || 0
      });
      
      return response;
    } catch (error) {
      console.error('❌ [ordersApi] Error fetching orders:', error);
      throw error;
    }
  },

  // Obtener orden específica
  getOrderById: async (orderId) => {
    return await apiClient.get(`orders/${orderId}`);
  },

  // Crear orden desde diseño cotizado
  createOrderFromDesign: async (orderData) => {
    return await apiClient.post('orders', orderData);
  },

  // Responder a cotización
  respondToQuote: async (orderId, response) => {
    return await apiClient.post(`orders/${orderId}/respond-quote`, response);
  },

  // Aprobar/rechazar foto de calidad
  respondToQualityPhoto: async (orderId, photoId, response) => {
    return await apiClient.post(`orders/${orderId}/quality-response`, {
      photoId,
      ...response
    });
  },

  // Obtener detalles de pago
  getPaymentDetails: async (orderId) => {
    return await apiClient.get(`orders/${orderId}/payment-details`);
  },

  // Obtener timeline
  getTimeline: async (orderId) => {
    return await apiClient.get(`orders/${orderId}/timeline`);
  }
};

export default ordersAPI;