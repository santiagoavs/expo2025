// src/api/OrderService.jsx - Servicio de órdenes refactorizado para nueva arquitectura
import apiClient from './ApiClient';

const orderService = {
  // ==================== MÉTODOS DE ÓRDENES ====================
  
  /**
   * Obtener todas las órdenes con filtros
   */
  async getOrders(filters = {}) {
    try {
      console.log('📦 [orderService] Obteniendo órdenes con filtros:', filters);
      
      const response = await apiClient.get('/orders', {
        params: {
          ...filters,
          page: filters.page || 1,
          limit: filters.limit || 20
        }
      });
      
      // Formatear órdenes para el frontend
      if (response.success && response.data?.orders) {
        response.data.orders = response.data.orders.map(order => this.formatOrderForDisplay(order));
      }
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error obteniendo órdenes:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Obtener orden específica por ID con detalles completos
   */
  async getOrderById(orderId) {
    try {
      console.log('🔍 [orderService] Obteniendo orden:', orderId);
      
      const response = await apiClient.get(`/orders/${orderId}`);
      
      if (response.success && response.data) {
        response.data = this.formatOrderForDisplay(response.data);
      }
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error obteniendo orden:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Crear nuevo pedido (normal)
   */
  async createOrder(orderData) {
    try {
      console.log('📝 [orderService] Creando orden:', orderData);
      
      const response = await apiClient.post('/orders', orderData);
      
      if (response.success && response.data) {
        response.data = this.formatOrderForDisplay(response.data);
      }
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error creando orden:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Actualizar estado de orden
   */
  async updateOrderStatus(orderId, status, notes = '') {
    try {
      console.log('🔄 [orderService] Actualizando estado:', orderId, status);
      
      const response = await apiClient.patch(`/orders/${orderId}/status`, {
        status,
        notes
      });
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error actualizando estado:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Cotizar diseño para pedido manual
   */
  async quoteDesign(designId, quoteData) {
    try {
      console.log('💰 [orderService] Cotizando diseño:', designId, quoteData);
      
      const response = await apiClient.post(`/orders/quote-design/${designId}`, quoteData);
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error cotizando diseño:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Obtener órdenes por usuario (para clientes)
   */
  async getUserOrders(userId, filters = {}) {
    try {
      console.log('👤 [orderService] Obteniendo órdenes del usuario:', userId);
      
      const response = await apiClient.get(`/orders/user/${userId}`, {
        params: filters
      });
      
      if (response.success && response.data?.orders) {
        response.data.orders = response.data.orders.map(order => this.formatOrderForDisplay(order));
      }
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error obteniendo órdenes del usuario:', error);
      throw this.handleError(error);
    }
  },

  // ==================== BÚSQUEDA Y FILTROS ====================
  
  /**
   * Buscar órdenes por múltiples criterios
   */
  async searchOrders(searchParams) {
    try {
      console.log('🔍 [orderService] Buscando órdenes:', searchParams);
      
      const response = await apiClient.get('/orders/search', {
        params: searchParams
      });
      
      if (response.success && response.data?.orders) {
        response.data.orders = response.data.orders.map(order => this.formatOrderForDisplay(order));
      }
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error buscando órdenes:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Obtener estadísticas de órdenes
   */
  async getOrderStats(filters = {}) {
    try {
      console.log('📊 [orderService] Obteniendo estadísticas:', filters);
      
      const response = await apiClient.get('/orders/stats', {
        params: filters
      });
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error obteniendo estadísticas:', error);
      throw this.handleError(error);
    }
  },

  // ==================== REPORTES ====================
  
  /**
   * Obtener métricas del dashboard
   */
  async getDashboardStats(filters = {}) {
    try {
      console.log('📊 [orderService] Obteniendo stats del dashboard:', filters);
      
      const response = await apiClient.get('/orders/reports/dashboard', {
        params: filters
      });
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error obteniendo dashboard:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Reporte de ventas por período
   */
  async getSalesReport(filters = {}) {
    try {
      console.log('💰 [orderService] Obteniendo reporte de ventas:', filters);
      
      const response = await apiClient.get('/orders/reports/sales', {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          groupBy: filters.groupBy || 'day',
          ...filters
        }
      });
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error obteniendo reporte ventas:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Reporte de productos más vendidos
   */
  async getTopProductsReport(filters = {}) {
    try {
      console.log('🏆 [orderService] Obteniendo productos top:', filters);
      
      const response = await apiClient.get('/orders/reports/top-products', {
        params: {
          limit: filters.limit || 10,
          startDate: filters.startDate,
          endDate: filters.endDate,
          ...filters
        }
      });
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error obteniendo productos top:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Reporte de clientes frecuentes
   */
  async getTopCustomersReport(filters = {}) {
    try {
      console.log('👑 [orderService] Obteniendo clientes top:', filters);
      
      const response = await apiClient.get('/orders/reports/top-customers', {
        params: {
          limit: filters.limit || 10,
          sortBy: filters.sortBy || 'totalSpent',
          ...filters
        }
      });
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error obteniendo clientes top:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Reporte de tiempos de producción
   */
  async getProductionReport(filters = {}) {
    try {
      console.log('⏱️ [orderService] Obteniendo reporte de producción:', filters);
      
      const response = await apiClient.get('/orders/reports/production', {
        params: filters
      });
      
      return response;
    } catch (error) {
      console.error('❌ [orderService] Error obteniendo reporte producción:', error);
      throw this.handleError(error);
    }
  },

  // ==================== UTILIDADES ====================
  
  /**
   * Formatear orden para mostrar en la UI
   */
  formatOrderForDisplay(order) {
    if (!order) return null;
    
    const statusLabels = {
      pending_approval: 'Pendiente Aprobación',
      quoted: 'Cotizado',
      approved: 'Aprobado',
      in_production: 'En Producción',
      quality_check: 'Control de Calidad',
      quality_approved: 'Calidad Aprobada',
      packaging: 'Empacando',
      ready_for_delivery: 'Listo para Entrega',
      out_for_delivery: 'En Camino',
      delivered: 'Entregado',
      completed: 'Completado',
      cancelled: 'Cancelado',
      on_hold: 'En Espera'
    };
    
    const deliveryLabels = {
      delivery: 'Entrega a domicilio',
      meetup: 'Punto de encuentro'
    };
    
    return {
      ...order,
      statusLabel: statusLabels[order.status] || order.status,
      deliveryLabel: deliveryLabels[order.deliveryType] || order.deliveryType,
      formattedTotal: new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'USD'
      }).format(order.total || 0),
      formattedCreatedAt: new Date(order.createdAt).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      isCompleted: ['delivered', 'completed', 'cancelled'].includes(order.status),
      isPending: ['pending_approval', 'quoted'].includes(order.status),
      canBeEdited: ['pending_approval', 'quoted', 'approved'].includes(order.status),
      canBeCancelled: !['delivered', 'completed', 'cancelled'].includes(order.status)
    };
  },

  /**
   * Obtener colores por estado
   */
  getStatusColor(status) {
    const colors = {
      pending_approval: '#f59e0b', // amber
      quoted: '#06b6d4', // cyan  
      approved: '#10b981', // emerald
      in_production: '#3b82f6', // blue
      quality_check: '#f97316', // orange
      quality_approved: '#84cc16', // lime
      packaging: '#a855f7', // purple
      ready_for_delivery: '#8b5cf6', // violet
      out_for_delivery: '#06b6d4', // cyan
      delivered: '#22c55e', // green
      completed: '#059669', // emerald-600
      cancelled: '#ef4444', // red
      on_hold: '#6b7280' // gray
    };
    
    return colors[status] || '#6b7280';
  },

  /**
   * Validar datos de orden
   */
  validateOrderData(orderData) {
    const errors = [];
    
    if (!orderData.designId) {
      errors.push('ID de diseño requerido');
    }
    
    if (!orderData.quantity || orderData.quantity < 1) {
      errors.push('Cantidad debe ser mayor a 0');
    }
    
    if (!orderData.deliveryType || !['delivery', 'meetup'].includes(orderData.deliveryType)) {
      errors.push('Tipo de entrega inválido');
    }
    
    if (orderData.deliveryType === 'delivery' && !orderData.deliveryAddress) {
      errors.push('Dirección de entrega requerida');
    }
    
    if (!orderData.paymentData || !orderData.paymentData.method) {
      errors.push('Método de pago requerido');
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
        message: error.response.data.message || 'Error en el servicio de órdenes',
        code: error.response.data.error || 'ORDER_ERROR',
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
      message: error.message || 'Error desconocido en órdenes',
      code: 'UNKNOWN_ERROR'
    };
  }
};

export default orderService;