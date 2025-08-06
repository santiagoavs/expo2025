import apiClient from './apiClient';

const BASE_URL = '/orders';

export default {
  // Get all orders with filtering
  getAllOrders: async (params = {}) => {
    const response = await apiClient.get(BASE_URL, { params });
    return response;
  },

  // Get single order by ID
  getOrderById: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response;
  },

  // Create a new order from a design
  createOrder: async (orderData) => {
    const response = await apiClient.post(BASE_URL, orderData);
    return response;
  },

  // Update order status (admin)
  updateOrderStatus: async (id, statusData) => {
    const response = await apiClient.patch(`${BASE_URL}/${id}/status`, statusData);
    return response;
  },

  // Confirm payment for an order (admin)
  confirmPayment: async (id, paymentData) => {
    const response = await apiClient.post(`${BASE_URL}/${id}/confirm-payment`, paymentData);
    return response;
  }
};