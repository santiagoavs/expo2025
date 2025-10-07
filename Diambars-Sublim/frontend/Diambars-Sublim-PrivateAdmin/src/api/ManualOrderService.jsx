// src/api/ManualOrderService.jsx - Servicio especializado para pedidos manuales
import apiClient from './ApiClient';
import orderService from './OrderService';

const manualOrderService = {
  // ==================== CREACIÓN DE PEDIDOS MANUALES ====================
  
  /**
   * Crear pedido manual para cliente existente
   */
  async createManualOrder(orderData) {
    try {
      console.log('📝 [manualOrderService] Creando pedido manual:', orderData);
      
      // Marcar como pedido manual
      const manualOrderData = {
        ...orderData,
        isManualOrder: true,
        createdByAdmin: true
      };
      
      const response = await apiClient.post('/orders', manualOrderData);
      
      if (response.success && response.data) {
        response.data = orderService.formatOrderForDisplay(response.data);
      }
      
      return response;
    } catch (error) {
      console.error('❌ [manualOrderService] Error creando pedido manual:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Cotizar diseño personalizado
   */
  async quoteCustomDesign(designData, pricingData) {
    try {
      console.log('💰 [manualOrderService] Cotizando diseño personalizado:', designData);
      
      const response = await apiClient.post('/orders/quote-custom-design', {
        designData,
        pricingData
      });
      
      return response;
    } catch (error) {
      console.error('❌ [manualOrderService] Error cotizando diseño:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Actualizar cotización de orden existente
   */
  async updateOrderQuote(orderId, quoteData) {
    try {
      console.log('🔄 [manualOrderService] Actualizando cotización:', orderId);
      
      const response = await apiClient.patch(`/orders/${orderId}/quote`, quoteData);
      
      return response;
    } catch (error) {
      console.error('❌ [manualOrderService] Error actualizando cotización:', error);
      throw this.handleError(error);
    }
  },

  // ==================== GESTIÓN DE CLIENTES ====================
  
  /**
   * Buscar clientes por criterios
   */
  async searchCustomers(searchQuery) {
    try {
      console.log('🔍 [manualOrderService] Buscando clientes:', searchQuery);
      
      const response = await apiClient.get('/users/search', {
        params: {
          q: searchQuery,
          type: 'customer',
          limit: 20
        }
      });
      
      return response;
    } catch (error) {
      console.error('❌ [manualOrderService] Error buscando clientes:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Obtener cliente por ID con historial
   */
  async getCustomerDetails(userId) {
    try {
      console.log('👤 [manualOrderService] Obteniendo detalles cliente:', userId);
      
      const response = await apiClient.get(`/users/${userId}/details`);
      
      return response;
    } catch (error) {
      console.error('❌ [manualOrderService] Error obteniendo cliente:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Crear cliente nuevo para pedido manual
   */
  async createCustomerForOrder(customerData) {
    try {
      console.log('➕ [manualOrderService] Creando cliente:', customerData);
      
      const response = await apiClient.post('/users/register', {
        ...customerData,
        createdByAdmin: true,
        skipEmailVerification: true
      });
      
      return response;
    } catch (error) {
      console.error('❌ [manualOrderService] Error creando cliente:', error);
      throw this.handleError(error);
    }
  },

  // ==================== GESTIÓN DE PRODUCTOS Y DISEÑOS ====================
  
  /**
   * Buscar productos para pedido manual
   */
  async searchProducts(searchQuery, filters = {}) {
    try {
      console.log('🔍 [manualOrderService] Buscando productos:', searchQuery);
      
      const response = await apiClient.get('/products/search', {
        params: {
          q: searchQuery,
          isActive: true,
          ...filters
        }
      });
      
      return response;
    } catch (error) {
      console.error('❌ [manualOrderService] Error buscando productos:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Obtener todos los diseños disponibles (solo aprobados en adelante)
   */
  async getAllDesigns() {
    try {
      console.log('🎨 [manualOrderService] Obteniendo diseños aprobados');
      
      // Primero intentar con filtro de estado aprobado
      let response = await apiClient.get('/designs', {
        params: {
          limit: 50,
          status: 'approved' // Solo diseños aprobados
        }
      });
      
      console.log('📥 [manualOrderService] Respuesta con filtro approved:', response);
      
      // Si no hay diseños aprobados, obtener todos para diagnosticar
      if (!response.data || response.data.length === 0) {
        console.log('🔍 [manualOrderService] No hay diseños aprobados, obteniendo todos para diagnosticar');
        response = await apiClient.get('/designs', {
          params: {
            limit: 50
            // Sin filtro de estado
          }
        });
        console.log('📥 [manualOrderService] Respuesta sin filtro:', response);
      }
      
      return response;
    } catch (error) {
      console.error('❌ [manualOrderService] Error obteniendo diseños:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Buscar diseños para pedido manual
   */
  async searchDesigns(searchQuery) {
    try {
      console.log('🔍 [manualOrderService] Buscando diseños:', searchQuery);
      
      // Usar el endpoint principal con filtros de búsqueda
      const response = await apiClient.get('/designs', {
        params: {
          search: searchQuery, // Usar 'search' en lugar de 'q'
          limit: 20,
          status: 'approved' // Solo diseños aprobados
        }
      });
      
      console.log('📥 [manualOrderService] Respuesta de búsqueda:', response);
      return response;
    } catch (error) {
      console.error('❌ [manualOrderService] Error buscando diseños:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Obtener diseños disponibles para un producto
   */
  async getProductDesigns(productId, filters = {}) {
    try {
      console.log('🎨 [manualOrderService] Obteniendo diseños del producto:', productId);
      
      const response = await apiClient.get(`/products/${productId}/designs`, {
        params: filters
      });
      
      return response;
    } catch (error) {
      console.error('❌ [manualOrderService] Error obteniendo diseños:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Crear diseño personalizado para pedido manual
   */
  async createCustomDesign(designData) {
    try {
      console.log('✨ [manualOrderService] Creando diseño personalizado:', designData);
      
      const response = await apiClient.post('/designs/custom', {
        ...designData,
        isCustomDesign: true,
        createdByAdmin: true
      });
      
      return response;
    } catch (error) {
      console.error('❌ [manualOrderService] Error creando diseño:', error);
      throw this.handleError(error);
    }
  },

  // ==================== CÁLCULOS Y PRECIOS ====================
  
  /**
   * Calcular precio estimado para pedido manual
   */
  async calculateEstimatedPrice(orderData) {
    try {
      console.log('💱 [manualOrderService] Calculando precio:', orderData);
      
      const response = await apiClient.post('/orders/calculate-price', orderData);
      
      return response;
    } catch (error) {
      console.error('❌ [manualOrderService] Error calculando precio:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Aplicar descuento especial
   */
  async applySpecialDiscount(orderId, discountData) {
    try {
      console.log('🏷️ [manualOrderService] Aplicando descuento:', orderId, discountData);
      
      const response = await apiClient.post(`/orders/${orderId}/apply-discount`, discountData);
      
      return response;
    } catch (error) {
      console.error('❌ [manualOrderService] Error aplicando descuento:', error);
      throw this.handleError(error);
    }
  },

  // ==================== VALIDACIONES ESPECIALIZADAS ====================
  
  /**
   * Validar datos de pedido manual
   */
  validateManualOrderData(orderData) {
    const errors = [];
    
    // Validaciones básicas
    if (!orderData.userId && !orderData.customerId && !orderData.customerData) {
      errors.push('Cliente requerido (ID existente o datos de nuevo cliente)');
    }
    
    if (!orderData.productId && !orderData.customProduct) {
      errors.push('Producto requerido');
    }
    
    if (!orderData.designId && !orderData.customDesign) {
      errors.push('Diseño requerido');
    }
    
    if (!orderData.quantity || orderData.quantity < 1) {
      errors.push('Cantidad debe ser mayor a 0');
    }
    
    if (!orderData.estimatedPrice || orderData.estimatedPrice <= 0) {
      errors.push('Precio estimado requerido');
    }
    
    // Validaciones de entrega
    if (!orderData.deliveryType || !['delivery', 'meetup'].includes(orderData.deliveryType)) {
      errors.push('Tipo de entrega inválido');
    }
    
    if (orderData.deliveryType === 'delivery') {
      if (!orderData.deliveryAddress) {
        errors.push('Dirección de entrega requerida');
      } else {
        const addressErrors = this.validateDeliveryAddress(orderData.deliveryAddress);
        errors.push(...addressErrors);
      }
    }
    
    // Validaciones de pago
    if (!orderData.paymentData) {
      errors.push('Datos de pago requeridos');
    } else {
      const paymentErrors = this.validatePaymentData(orderData.paymentData);
      errors.push(...paymentErrors);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validar dirección de entrega
   */
  validateDeliveryAddress(address) {
    const errors = [];
    
    // Soportar tanto "street" como "address" por compatibilidad
    const addressField = address.address || address.street;
    if (!addressField || addressField.trim().length < 5) {
      errors.push('Dirección debe tener al menos 5 caracteres');
    }
    
    // Soportar tanto "city" como "municipality" por compatibilidad
    const cityField = address.municipality || address.city;
    if (!cityField || cityField.trim().length < 2) {
      errors.push('Ciudad requerida');
    }
    
    if (!address.department) {
      errors.push('Departamento requerido');
    }
    
    // Validar teléfono si está presente (soportar phoneNumber o phone)
    const phoneField = address.phoneNumber || address.phone;
    if (phoneField && !/^\+?[\d\s-()]{8,}$/.test(phoneField)) {
      errors.push('Formato de teléfono inválido');
    }
    
    return errors;
  },

  /**
   * Validar datos de pago para pedido manual
   */
  validatePaymentData(paymentData) {
    const errors = [];
    
    if (!paymentData.method || !['cash', 'bank_transfer', 'wompi'].includes(paymentData.method)) {
      errors.push('Método de pago inválido');
    }
    
    if (!paymentData.timing || !['advance', 'on_delivery'].includes(paymentData.timing)) {
      errors.push('Tiempo de pago inválido');
    }
    
    if (paymentData.paymentType === 'partial') {
      if (!paymentData.percentage || paymentData.percentage < 1 || paymentData.percentage > 99) {
        errors.push('Porcentaje de pago parcial debe estar entre 1 y 99');
      }
    }
    
    return errors;
  },

  /**
   * Validar datos de cliente nuevo
   */
  validateNewCustomerData(customerData) {
    const errors = [];
    
    if (!customerData.name || customerData.name.trim().length < 2) {
      errors.push('Nombre debe tener al menos 2 caracteres');
    }
    
    if (!customerData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerData.email)) {
      errors.push('Email inválido');
    }
    
    if (!customerData.phone || !/^\+?[\d\s-()]{8,}$/.test(customerData.phone)) {
      errors.push('Formato de teléfono inválido');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // ==================== UTILIDADES ====================
  
  /**
   * Formatear datos de cliente para mostrar
   */
  formatCustomerForDisplay(customer) {
    if (!customer) return null;
    
    return {
      ...customer,
      displayName: customer.name || 'Sin nombre',
      displayEmail: customer.email || 'Sin email',
      displayPhone: customer.phone || 'Sin teléfono',
      formattedCreatedAt: customer.createdAt ? 
        new Date(customer.createdAt).toLocaleDateString('es-CO', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        }) : 'Fecha desconocida',
      totalOrders: customer.totalOrders || 0,
      totalSpent: customer.totalSpent || 0,
      formattedTotalSpent: new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'USD'
      }).format(customer.totalSpent || 0),
      isNewCustomer: !customer._id,
      isFrequentCustomer: (customer.totalOrders || 0) >= 3
    };
  },

  /**
   * Generar datos por defecto para pedido manual
   */
  generateDefaultOrderData() {
    return {
      quantity: 1,
      deliveryType: 'meetup',
      paymentData: {
        method: 'cash',
        timing: 'on_delivery',
        paymentType: 'full'
      },
      priority: 'normal',
      notes: '',
      isManualOrder: true,
      createdByAdmin: true
    };
  },

  /**
   * Manejo de errores centralizado
   */
  handleError(error) {
    if (error.response?.data) {
      return {
        message: error.response.data.message || 'Error en pedidos manuales',
        code: error.response.data.error || 'MANUAL_ORDER_ERROR',
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
      message: error.message || 'Error desconocido en pedidos manuales',
      code: 'UNKNOWN_ERROR'
    };
  }
};

export default manualOrderService;