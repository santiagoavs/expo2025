// services/orderService.js - Lógica de negocio con validadores centralizados
import Order from "../models/order.js";
import Design from "../models/design.js";
import Address from "../models/address.js";
import Product from "../models/product.js";
import mongoose from "mongoose";
import { validateDepartmentAndMunicipality } from "../utils/locationUtils.js";
import { notificationService } from "./email/notification.service.js";
import { validators, validateFields } from "../utils/validators.utils.js";

export const orderService = {

  /**
   * Validar datos del pedido antes de crearlo
   */
  async validateOrderData(body, userId) {
    const {
      designId,
      quantity = 1,
      deliveryType = 'meetup',
      addressId,
      meetupDetails,
      clientNotes,
      paymentData = {
        method: 'cash',
        timing: 'on_delivery'
      },
      isManualOrder = false,
      targetUserId,
      adminId
    } = body;

    console.log('🔍 Validando datos del pedido:', { designId, quantity, deliveryType, isManualOrder });

    // Validar campos básicos usando validadores centralizados
    const basicValidation = validateFields(body, {
      designId: (value) => validators.mongoId(value, 'ID de diseño'),
      quantity: (value) => validators.quantity(value || 1, 1, 100),
      clientNotes: (value) => validators.text(value, 0, 1000)
    });

    if (!basicValidation.isValid) {
      const error = new Error(basicValidation.errors.join('; '));
      error.statusCode = 400;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    const { designId: validDesignId, quantity: validQuantity, clientNotes: validClientNotes } = basicValidation.cleaned;

    // Validar tipo de entrega
    if (!['delivery', 'meetup'].includes(deliveryType)) {
      const error = new Error("Tipo de entrega debe ser 'delivery' o 'meetup'");
      error.statusCode = 400;
      error.code = 'INVALID_DELIVERY_TYPE';
      throw error;
    }

    // Validar método de pago
    if (!['cash', 'bank_transfer', 'wompi'].includes(paymentData.method)) {
      const error = new Error("Método de pago inválido. Métodos permitidos: cash, bank_transfer, wompi");
      error.statusCode = 400;
      error.code = 'INVALID_PAYMENT_METHOD';
      throw error;
    }

    // Validar timing de pago
    if (!['on_delivery', 'advance', 'partial'].includes(paymentData.timing)) {
      const error = new Error("Timing de pago inválido");
      error.statusCode = 400;
      error.code = 'INVALID_PAYMENT_TIMING';
      throw error;
    }

    // Buscar y validar diseño
    const design = await Design.findById(validDesignId)
      .populate('product')
      .populate('user');

    if (!design) {
      const error = new Error("Diseño no encontrado");
      error.statusCode = 404;
      error.code = 'DESIGN_NOT_FOUND';
      throw error;
    }

    // Para pedidos manuales, el admin puede crear para cualquier usuario
    const isAdmin = isManualOrder && adminId;
    if (!isAdmin && !design.user._id.equals(userId)) {
      const error = new Error("No tienes permiso para crear un pedido con este diseño");
      error.statusCode = 403;
      error.code = 'UNAUTHORIZED_DESIGN_ACCESS';
      throw error;
    }

    // El diseño debe estar cotizado para crear pedido
    if (!['quoted', 'approved'].includes(design.status)) {
      const error = new Error(`El diseño debe estar cotizado para crear un pedido. Estado actual: ${design.status}`);
      error.statusCode = 400;
      error.code = 'DESIGN_NOT_QUOTED';
      throw error;
    }

    // Verificar que no exista pedido activo para este diseño
    const existingOrder = await Order.findOne({
      'items.design': validDesignId,
      status: { $nin: ['cancelled', 'rejected'] }
    });

    if (existingOrder) {
      const error = new Error("Ya existe un pedido activo para este diseño");
      error.statusCode = 400;
      error.code = 'DUPLICATE_ORDER';
      throw error;
    }

    // Validar dirección si es entrega a domicilio
    let deliveryAddress = null;
    if (deliveryType === 'delivery') {
      deliveryAddress = await this.validateDeliveryAddress(addressId, body.address, userId);
    }

    // Validar punto de encuentro
    let processedMeetupDetails = null;
    if (deliveryType === 'meetup') {
      processedMeetupDetails = await this.validateMeetupDetails(meetupDetails);
    }

    // Validar targetUserId si es pedido manual
    let finalTargetUserId = userId;
    if (isManualOrder && targetUserId) {
      const userIdValidation = validators.mongoId(targetUserId, 'ID de usuario objetivo');
      if (!userIdValidation.isValid) {
        const error = new Error(userIdValidation.error);
        error.statusCode = 400;
        error.code = 'INVALID_TARGET_USER';
        throw error;
      }
      finalTargetUserId = userIdValidation.cleaned;
    }

    return {
      design,
      quantity: validQuantity,
      deliveryType,
      deliveryAddress,
      meetupDetails: processedMeetupDetails,
      clientNotes: validClientNotes || '',
      paymentData,
      isManualOrder,
      targetUserId: finalTargetUserId
    };
  },

  /**
   * Validar dirección de entrega usando validadores centralizados
   */
  async validateDeliveryAddress(addressId, newAddress, userId) {
    if (addressId) {
      // Validar ID de dirección
      const addressIdValidation = validators.mongoId(addressId, 'ID de dirección');
      if (!addressIdValidation.isValid) {
        const error = new Error(addressIdValidation.error);
        error.statusCode = 400;
        error.code = 'INVALID_ADDRESS_ID';
        throw error;
      }

      // Usar dirección existente
      const address = await Address.findOne({
        _id: addressIdValidation.cleaned,
        user: userId,
        isActive: true
      });

      if (!address) {
        const error = new Error("Dirección no encontrada");
        error.statusCode = 404;
        error.code = 'ADDRESS_NOT_FOUND';
        throw error;
      }

      return {
        label: address.label,
        recipient: address.recipient,
        phoneNumber: address.phoneNumber,
        department: address.department,
        municipality: address.municipality,
        address: address.address,
        additionalDetails: address.additionalDetails
      };
    }

    if (newAddress) {
      // Validar nueva dirección usando validador centralizado
      const addressValidation = validators.address(newAddress);
      if (!addressValidation.isValid) {
        const error = new Error(addressValidation.error);
        error.statusCode = 400;
        error.code = 'INVALID_ADDRESS_DATA';
        throw error;
      }

      return {
        label: newAddress.label || "Dirección de entrega",
        ...addressValidation.cleaned
      };
    }

    const error = new Error("Debe proporcionar dirección para entrega a domicilio");
    error.statusCode = 400;
    error.code = 'ADDRESS_REQUIRED';
    throw error;
  },

  /**
   * Validar detalles del punto de encuentro
   */
  async validateMeetupDetails(meetupDetails) {
    if (!meetupDetails) {
      const error = new Error("Debe proporcionar detalles del punto de encuentro");
      error.statusCode = 400;
      error.code = 'MEETUP_DETAILS_REQUIRED';
      throw error;
    }

    const cleanedDetails = {
      location: {
        type: "Point",
        coordinates: meetupDetails.location?.coordinates || [-89.2182, 13.6929],
        address: "",
        placeName: ""
      },
      notes: ""
    };

    // Validar fecha si se proporciona
    if (meetupDetails.date) {
      const dateValidation = validators.futureDate(meetupDetails.date, 24);
      if (!dateValidation.isValid) {
        const error = new Error(dateValidation.error);
        error.statusCode = 400;
        error.code = 'INVALID_MEETUP_DATE';
        throw error;
      }
      cleanedDetails.date = dateValidation.cleaned;
    }

    // Validar dirección del punto de encuentro
    if (meetupDetails.address) {
      const addressValidation = validators.text(meetupDetails.address, 5, 200);
      if (!addressValidation.isValid) {
        const error = new Error(`Dirección del punto de encuentro: ${addressValidation.error}`);
        error.statusCode = 400;
        error.code = 'INVALID_MEETUP_ADDRESS';
        throw error;
      }
      cleanedDetails.location.address = addressValidation.cleaned;
    }

    // Validar nombre del lugar
    if (meetupDetails.placeName) {
      const placeValidation = validators.text(meetupDetails.placeName, 2, 100);
      if (!placeValidation.isValid) {
        const error = new Error(`Nombre del lugar: ${placeValidation.error}`);
        error.statusCode = 400;
        error.code = 'INVALID_PLACE_NAME';
        throw error;
      }
      cleanedDetails.location.placeName = placeValidation.cleaned;
    }

    // Validar notas
    if (meetupDetails.notes) {
      const notesValidation = validators.text(meetupDetails.notes, 0, 500);
      if (!notesValidation.isValid) {
        const error = new Error(`Notas del encuentro: ${notesValidation.error}`);
        error.statusCode = 400;
        error.code = 'INVALID_MEETUP_NOTES';
        throw error;
      }
      cleanedDetails.notes = notesValidation.cleaned;
    }

    return cleanedDetails;
  },

  /**
   * Crear nuevo pedido
   */
  async createOrder(orderData, session) {
    const { design, targetUserId, quantity, deliveryType, deliveryAddress, meetupDetails, clientNotes, paymentData } = orderData;

    console.log('📦 Creando pedido con diseño cotizado:', {
      designId: design._id,
      designPrice: design.price,
      quantity
    });

    // Validar precio del diseño
    const priceValidation = validators.price(design.price);
    if (!priceValidation.isValid) {
      const error = new Error(`Precio del diseño inválido: ${priceValidation.error}`);
      error.statusCode = 400;
      error.code = 'INVALID_DESIGN_PRICE';
      throw error;
    }

    // USAR PRECIO MANUAL DEL DISEÑO (NO CALCULAR)
    const unitPrice = priceValidation.cleaned;
    const subtotal = unitPrice * quantity;

    // Crear pedido SIN cálculos automáticos de envío/impuestos
    const newOrder = new Order({
      user: targetUserId,
      items: [{
        product: design.product._id,
        design: design._id,
        options: design.productOptions || [],
        quantity,
        unitPrice,
        totalPrice: subtotal, // Cambiar subtotal por totalPrice
        status: 'pending',
        productionStatus: 'not_started',
        productionStages: this.getInitialProductionStages()
      }],
      status: 'pending_approval',
      deliveryType,
      deliveryAddress,
      meetupDetails,
      subtotal,
      discounts: 0,
      deliveryFee: 0, // El admin cotizará manualmente
      tax: 0, // El admin cotizará manualmente
      total: subtotal, // Solo el precio del diseño inicialmente
      estimatedReadyDate: new Date(Date.now() + (design.productionDays || 7) * 24 * 60 * 60 * 1000),
      clientNotes,
      statusHistory: [{
        status: 'pending_approval',
        changedBy: targetUserId,
        changedByModel: 'User',
        notes: 'Pedido creado - esperando cotización final del admin',
        timestamp: new Date()
      }],
      payment: {
        method: paymentData.method,
        status: 'pending',
        timing: paymentData.timing,
        amount: subtotal // Se actualizará cuando el admin cotice
      },
      metadata: {
        source: 'web',
        priority: 'normal',
        isLargeOrder: quantity > 10 || subtotal > 100,
        requiresManualQuote: true // Siempre requiere cotización manual
      }
    });

    await newOrder.save({ session });

    // Actualizar diseño a aprobado si estaba solo cotizado
    if (design.status === 'quoted') {
      design.status = 'approved';
      design.approvedAt = new Date();
      await design.save({ session });
    }

    console.log('✅ Pedido creado exitosamente:', newOrder.orderNumber);
    return newOrder;
  },

  /**
   * Obtener pedido por ID con validación de permisos
   */
  async getOrderById(id, userId, isAdmin) {
    // Validar ID usando validador centralizado
    const idValidation = validators.mongoId(id, 'ID de pedido');
    if (!idValidation.isValid) {
      const error = new Error(idValidation.error);
      error.statusCode = 400;
      error.code = 'INVALID_ORDER_ID';
      throw error;
    }

    const order = await Order.findById(idValidation.cleaned)
      .populate('user', 'name email phoneNumber')
      .populate('items.product', 'name images')
      .populate('items.design', 'name previewImage');

    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    // Verificar permisos
    if (!isAdmin && !order.user._id.equals(userId)) {
      const error = new Error("No tienes permiso para ver este pedido");
      error.statusCode = 403;
      error.code = 'UNAUTHORIZED_ACCESS';
      throw error;
    }

    return order;
  },

  /**
   * Cotización manual del admin con validación de precios
   */
  async submitManualQuote(orderId, adminId, totalPrice, deliveryFee, tax, notes) {
    // Validar IDs
    const orderIdValidation = validators.mongoId(orderId, 'ID de pedido');
    const adminIdValidation = validators.mongoId(adminId, 'ID de administrador');
    
    if (!orderIdValidation.isValid || !adminIdValidation.isValid) {
      const error = new Error('IDs inválidos');
      error.statusCode = 400;
      error.code = 'INVALID_IDS';
      throw error;
    }

    // Validar precios usando validadores centralizados
    const priceValidation = validateFields({
      totalPrice,
      deliveryFee: deliveryFee || 0,
      tax: tax || 0
    }, {
      totalPrice: (value) => validators.price(value, 0.01),
      deliveryFee: (value) => validators.price(value, 0),
      tax: (value) => validators.price(value, 0)
    });

    if (!priceValidation.isValid) {
      const error = new Error(`Precios inválidos: ${priceValidation.errors.join('; ')}`);
      error.statusCode = 400;
      error.code = 'INVALID_PRICES';
      throw error;
    }

    // Validar notas
    let cleanedNotes = '';
    if (notes) {
      const notesValidation = validators.text(notes, 0, 1000);
      if (!notesValidation.isValid) {
        const error = new Error(`Notas inválidas: ${notesValidation.error}`);
        error.statusCode = 400;
        error.code = 'INVALID_NOTES';
        throw error;
      }
      cleanedNotes = notesValidation.cleaned;
    }

    const order = await Order.findById(orderIdValidation.cleaned).populate('user', 'email name');

    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (order.status !== 'pending_approval') {
      const error = new Error("Solo se pueden cotizar pedidos pendientes de aprobación");
      error.statusCode = 400;
      error.code = 'INVALID_ORDER_STATUS';
      throw error;
    }

    // Actualizar precios con valores validados
    const { totalPrice: validTotal, deliveryFee: validDeliveryFee, tax: validTax } = priceValidation.cleaned;
    
    order.deliveryFee = validDeliveryFee;
    order.tax = validTax;
    order.total = validTotal;
    order.payment.amount = validTotal;

    order.status = 'quoted';
    order.adminNotes = cleanedNotes;
    order.statusHistory.push({
      status: 'quoted',
      changedBy: adminIdValidation.cleaned,
      changedByModel: 'Employee',
      notes: `Pedido cotizado manualmente. Total: ${validTotal}`,
      timestamp: new Date()
    });

    await order.save();

    // Notificar al cliente
    notificationService.sendQuoteReadyNotification({
      orderNumber: order.orderNumber,
      total: order.total,
      deliveryFee: order.deliveryFee,
      tax: order.tax,
      userEmail: order.user.email,
      userName: order.user.name
    }).catch(console.error);

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      total: order.total,
      deliveryFee: order.deliveryFee,
      tax: order.tax,
      status: order.status
    };
  },

  /**
   * Finalizar pedido presencial con validación de datos de pago
   */
  async finalizeOrder(orderId, adminId, finalData) {
    // Validar IDs
    const idsValidation = validateFields({ orderId, adminId }, {
      orderId: (value) => validators.mongoId(value, 'ID de pedido'),
      adminId: (value) => validators.mongoId(value, 'ID de administrador')
    });

    if (!idsValidation.isValid) {
      const error = new Error(idsValidation.errors.join('; '));
      error.statusCode = 400;
      error.code = 'INVALID_IDS';
      throw error;
    }

    const order = await Order.findById(idsValidation.cleaned.orderId).populate('user', 'email name');

    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (order.status !== 'delivered') {
      const error = new Error("Solo se pueden finalizar pedidos entregados");
      error.statusCode = 400;
      error.code = 'INVALID_ORDER_STATUS';
      throw error;
    }

    // Validar datos de finalización
    let cleanedDeliveryNotes = '';
    if (finalData.deliveryNotes) {
      const notesValidation = validators.text(finalData.deliveryNotes, 0, 500);
      if (!notesValidation.isValid) {
        const error = new Error(`Notas de entrega inválidas: ${notesValidation.error}`);
        error.statusCode = 400;
        error.code = 'INVALID_DELIVERY_NOTES';
        throw error;
      }
      cleanedDeliveryNotes = notesValidation.cleaned;
    }

    // Validar datos de pago en efectivo si se proporcionan
    if (finalData.cashPayment && order.payment.method === 'cash') {
      const cashValidation = validators.cashPayment(finalData.cashPayment, order.total);
      if (!cashValidation.isValid) {
        const error = new Error(`Datos de pago inválidos: ${cashValidation.error}`);
        error.statusCode = 400;
        error.code = 'INVALID_CASH_PAYMENT';
        throw error;
      }
      
      // Actualizar información de pago
      order.payment.cashDetails = cashValidation.cleaned;
      order.payment.status = 'paid';
    }

    order.status = 'completed';
    order.completedAt = new Date();
    order.canReview = true;
    order.adminNotes = (order.adminNotes || '') + (cleanedDeliveryNotes ? '\n' + cleanedDeliveryNotes : '');

    order.statusHistory.push({
      status: 'completed',
      changedBy: idsValidation.cleaned.adminId,
      changedByModel: 'Employee',
      notes: `Pedido finalizado. ${cleanedDeliveryNotes}`,
      timestamp: new Date()
    });

    await order.save();

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      completedAt: order.completedAt,
      paymentStatus: order.payment.status
    };
  },

  // ==================== MÉTODOS AUXILIARES (sin cambios) ====================

  getInitialProductionStages() {
    return {
      sourcing_product: { completed: false },
      preparing_materials: { completed: false },
      printing: { completed: false },
      sublimating: { completed: false },
      quality_check: { completed: false },
      packaging: { completed: false }
    };
  },

  getStatusTitle(status) {
    const titles = {
      'pending_approval': 'Esperando Aprobación',
      'quoted': 'Cotizado',
      'approved': 'Aprobado',
      'rejected': 'Rechazado',
      'in_production': 'En Producción',
      'ready_for_delivery': 'Listo para Entrega',
      'delivered': 'Entregado',
      'completed': 'Completado',
      'cancelled': 'Cancelado'
    };
    return titles[status] || status;
  },

  getStatusDescription(status) {
    const descriptions = {
      'pending_approval': 'Tu pedido está siendo revisado',
      'quoted': 'Hemos cotizado tu pedido',
      'approved': 'Tu pedido ha sido aprobado',
      'rejected': 'Tu pedido ha sido rechazado',
      'in_production': 'Estamos produciendo tu pedido',
      'ready_for_delivery': 'Tu pedido está listo',
      'delivered': 'Tu pedido ha sido entregado',
      'completed': 'Pedido completado exitosamente',
      'cancelled': 'El pedido ha sido cancelado'
    };
    return descriptions[status] || '';
  },

  getStageTitle(stage) {
    const titles = {
      'sourcing_product': 'Adquisición de Producto',
      'preparing_materials': 'Preparación de Materiales',
      'printing': 'Impresión',
      'sublimating': 'Sublimación',
      'quality_check': 'Control de Calidad',
      'packaging': 'Empaquetado'
    };
    return titles[stage] || stage;
  },

  formatProductionStages(stages) {
    if (!stages) return [];
    
    return Object.entries(stages).map(([stage, data]) => ({
      stage,
      title: this.getStageTitle(stage),
      completed: data.completed || false,
      completedAt: data.completedAt,
      notes: data.notes,
      photoUrl: data.photoUrl
    }));
  },

  getAvailableActions(order, isAdmin) {
    const actions = [];

    if (isAdmin) {
      if (order.status === 'pending_approval') {
        actions.push('quote', 'reject');
      }
      if (['approved', 'in_production'].includes(order.status)) {
        actions.push('update_production', 'upload_photo');
      }
      if (order.status === 'ready_for_delivery') {
        actions.push('mark_delivered');
      }
      if (order.status === 'delivered') {
        actions.push('complete');
      }
      if (['pending_approval', 'quoted', 'approved'].includes(order.status)) {
        actions.push('cancel');
      }
    } else {
      if (order.status === 'quoted') {
        actions.push('accept_quote', 'reject_quote');
      }
      if (order.productionPhotos?.some(photo => !photo.clientApproved)) {
        actions.push('approve_photos');
      }
      if (['pending_approval', 'quoted'].includes(order.status)) {
        actions.push('cancel');
      }
      if (order.status === 'completed' && order.canReview) {
        actions.push('leave_review');
      }
    }

    return actions;
  },

  // ==================== MÉTODOS ADICIONALES CON VALIDADORES ====================

  /**
   * Obtener tracking detallado estilo Temu
   */
  async getOrderTracking(id, userId, isAdmin) {
    const order = await this.getOrderById(id, userId, isAdmin);

    const tracking = {
      orderNumber: order.orderNumber,
      status: order.status,
      estimatedReadyDate: order.estimatedReadyDate,
      actualReadyDate: order.actualReadyDate,
      deliveredAt: order.deliveredAt,
      completedAt: order.completedAt,
      
      // Timeline estilo Temu
      timeline: this.buildOrderTimeline(order),
      
      // Progreso de producción
      productionProgress: order.items.map(item => ({
        productName: item.product.name,
        designName: item.design.name,
        progress: item.productionProgress || 0,
        currentStage: item.productionStatus,
        stages: this.formatProductionStages(item.productionStages)
      })),

      // Información de entrega
      deliveryInfo: order.deliveryType === 'delivery' 
        ? order.deliveryAddress 
        : order.meetupDetails,
      deliveryType: order.deliveryType,

      // Estado del pago
      payment: {
        method: order.payment.method,
        status: order.payment.status,
        timing: order.payment.timing,
        amount: order.payment.amount
      },

      // Fotos de producción pendientes de aprobación
      pendingPhotos: order.productionPhotos?.filter(photo => 
        !photo.clientApproved && !photo.clientResponse?.approved
      ) || [],

      // Acciones disponibles para el cliente
      availableActions: this.getAvailableActions(order, isAdmin)
    };

    return tracking;
  },

  /**
   * Construir timeline del pedido estilo Temu
   */
  buildOrderTimeline(order) {
    const timeline = [];

    // Agregar eventos del historial de estados
    order.statusHistory?.forEach(entry => {
      timeline.push({
        date: entry.timestamp,
        status: entry.status,
        title: this.getStatusTitle(entry.status),
        description: entry.notes || this.getStatusDescription(entry.status),
        type: 'status_change',
        completed: true
      });
    });

    // Agregar eventos de producción
    order.items?.forEach(item => {
      Object.entries(item.productionStages || {}).forEach(([stage, data]) => {
        if (data.completed) {
          timeline.push({
            date: data.completedAt,
            status: 'production',
            title: this.getStageTitle(stage),
            description: data.notes || `${this.getStageTitle(stage)} completada`,
            type: 'production',
            completed: true,
            photoUrl: data.photoUrl
          });
        }
      });
    });

    // Ordenar por fecha
    timeline.sort((a, b) => new Date(a.date) - new Date(b.date));

    return timeline;
  },

  /**
   * Obtener pedidos del usuario con validación de filtros
   */
  async getUserOrders(userId, filters) {
    // Validar userId
    const userIdValidation = validators.mongoId(userId, 'ID de usuario');
    if (!userIdValidation.isValid) {
      const error = new Error(userIdValidation.error);
      error.statusCode = 400;
      error.code = 'INVALID_USER_ID';
      throw error;
    }

    // Validar filtros
    const { page = 1, limit = 10, status } = filters;
    
    const pageValidation = validators.quantity(page, 1, 1000);
    const limitValidation = validators.quantity(limit, 1, 100);
    
    if (!pageValidation.isValid || !limitValidation.isValid) {
      const error = new Error('Parámetros de paginación inválidos');
      error.statusCode = 400;
      error.code = 'INVALID_PAGINATION';
      throw error;
    }
    
    const filter = { user: userIdValidation.cleaned };
    
    // Validar status si se proporciona
    if (status) {
      const validStatuses = [
        'pending_approval', 'quoted', 'approved', 'rejected',
        'in_production', 'ready_for_delivery', 'delivered', 
        'completed', 'cancelled'
      ];
      
      if (!validStatuses.includes(status)) {
        const error = new Error('Estado de filtro inválido');
        error.statusCode = 400;
        error.code = 'INVALID_STATUS_FILTER';
        throw error;
      }
      
      filter.status = status;
    }

    const options = {
      page: pageValidation.cleaned,
      limit: limitValidation.cleaned,
      sort: { createdAt: -1 },
      populate: [
        { path: 'items.product', select: 'name images' },
        { path: 'items.design', select: 'name previewImage' }
      ]
    };

    const result = await Order.paginate(filter, options);

    return {
      orders: result.docs.map(order => order.toSafeObject()),
      pagination: {
        total: result.totalDocs,
        pages: result.totalPages,
        currentPage: result.page,
        limit: result.limit,
        hasNext: result.hasNextPage,
        hasPrev: result.hasPrevPage
      }
    };
  },

  /**
   * Obtener todos los pedidos (admin) con validación de filtros
   */
  async getAllOrders(filters) {
    const { page = 1, limit = 10, status, user, search, startDate, endDate } = filters;

    // Validar paginación
    const paginationValidation = validateFields({ page, limit }, {
      page: (value) => validators.quantity(value, 1, 1000),
      limit: (value) => validators.quantity(value, 1, 100)
    });

    if (!paginationValidation.isValid) {
      const error = new Error(`Paginación inválida: ${paginationValidation.errors.join('; ')}`);
      error.statusCode = 400;
      error.code = 'INVALID_PAGINATION';
      throw error;
    }

    let filter = {};
    
    // Validar status si se proporciona
    if (status) {
      const validStatuses = [
        'pending_approval', 'quoted', 'approved', 'rejected',
        'in_production', 'ready_for_delivery', 'delivered', 
        'completed', 'cancelled'
      ];
      
      if (!validStatuses.includes(status)) {
        const error = new Error('Estado de filtro inválido');
        error.statusCode = 400;
        error.code = 'INVALID_STATUS_FILTER';
        throw error;
      }
      
      filter.status = status;
    }

    // Validar user ID si se proporciona
    if (user) {
      const userValidation = validators.mongoId(user, 'ID de usuario');
      if (!userValidation.isValid) {
        const error = new Error(userValidation.error);
        error.statusCode = 400;
        error.code = 'INVALID_USER_FILTER';
        throw error;
      }
      filter.user = userValidation.cleaned;
    }
    
    // Validar y limpiar búsqueda
    if (search) {
      const searchValidation = validators.text(search, 1, 100);
      if (!searchValidation.isValid) {
        const error = new Error(`Término de búsqueda inválido: ${searchValidation.error}`);
        error.statusCode = 400;
        error.code = 'INVALID_SEARCH_TERM';
        throw error;
      }
      
      const cleanSearch = searchValidation.cleaned;
      filter.$or = [
        { orderNumber: { $regex: cleanSearch, $options: 'i' } },
        { clientNotes: { $regex: cleanSearch, $options: 'i' } },
        { adminNotes: { $regex: cleanSearch, $options: 'i' } }
      ];
    }

    // Validar fechas si se proporcionan
    if (startDate || endDate) {
      const dateFilter = {};
      
      if (startDate) {
        const startValidation = validators.futureDate(startDate, -365 * 24); // Permitir fechas pasadas
        if (!startValidation.isValid) {
          // Si no es válida como fecha futura, intentar como fecha normal
          const startDateObj = new Date(startDate);
          if (isNaN(startDateObj.getTime())) {
            const error = new Error('Fecha de inicio inválida');
            error.statusCode = 400;
            error.code = 'INVALID_START_DATE';
            throw error;
          }
          dateFilter.$gte = startDateObj;
        } else {
          dateFilter.$gte = startValidation.cleaned;
        }
      }
      
      if (endDate) {
        const endDateObj = new Date(endDate);
        if (isNaN(endDateObj.getTime())) {
          const error = new Error('Fecha de fin inválida');
          error.statusCode = 400;
          error.code = 'INVALID_END_DATE';
          throw error;
        }
        dateFilter.$lte = endDateObj;
      }
      
      if (Object.keys(dateFilter).length > 0) {
        filter.createdAt = dateFilter;
      }
    }

    const options = {
      page: paginationValidation.cleaned.page,
      limit: paginationValidation.cleaned.limit,
      sort: { createdAt: -1 },
      populate: [
        { path: 'user', select: 'name email phone' },
        { path: 'items.product', select: 'name images' },
        { path: 'items.design', select: 'name previewImage' }
      ]
    };

    const result = await Order.paginate(filter, options);

    return {
      orders: result.docs,
      pagination: {
        total: result.totalDocs,
        pages: result.totalPages,
        currentPage: result.page,
        limit: result.limit,
        hasNext: result.hasNextPage,
        hasPrev: result.hasPrevPage
      }
    };
  },

  /**
   * Responder a cotización (cliente) con validación
   */
  async respondToQuote(orderId, userId, accept, clientNotes) {
    // Validar IDs
    const idsValidation = validateFields({ orderId, userId }, {
      orderId: (value) => validators.mongoId(value, 'ID de pedido'),
      userId: (value) => validators.mongoId(value, 'ID de usuario')
    });

    if (!idsValidation.isValid) {
      const error = new Error(idsValidation.errors.join('; '));
      error.statusCode = 400;
      error.code = 'INVALID_IDS';
      throw error;
    }

    // Validar accept como booleano
    if (typeof accept !== 'boolean') {
      const error = new Error('La respuesta debe ser true (aceptar) o false (rechazar)');
      error.statusCode = 400;
      error.code = 'INVALID_ACCEPT_VALUE';
      throw error;
    }

    // Validar notas del cliente
    let cleanedNotes = '';
    if (clientNotes) {
      const notesValidation = validators.text(clientNotes, 0, 1000);
      if (!notesValidation.isValid) {
        const error = new Error(`Notas del cliente inválidas: ${notesValidation.error}`);
        error.statusCode = 400;
        error.code = 'INVALID_CLIENT_NOTES';
        throw error;
      }
      cleanedNotes = notesValidation.cleaned;
    }

    const order = await Order.findById(idsValidation.cleaned.orderId).populate('user', 'email name');

    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (!order.user._id.equals(idsValidation.cleaned.userId)) {
      const error = new Error("No tienes permiso para responder a esta cotización");
      error.statusCode = 403;
      error.code = 'UNAUTHORIZED_ACCESS';
      throw error;
    }

    if (order.status !== 'quoted') {
      const error = new Error("Solo se puede responder a pedidos cotizados");
      error.statusCode = 400;
      error.code = 'INVALID_ORDER_STATUS';
      throw error;
    }

    if (accept) {
      order.status = 'approved';
      order.clientNotes = cleanedNotes || order.clientNotes;
      order.statusHistory.push({
        status: 'approved',
        changedBy: idsValidation.cleaned.userId,
        changedByModel: 'User',
        notes: `Cotización aceptada por el cliente${cleanedNotes ? ': ' + cleanedNotes : ''}`,
        timestamp: new Date()
      });

      await order.save();

      // Notificar al admin
      notificationService.sendQuoteAcceptedNotification({
        orderNumber: order.orderNumber,
        userName: order.user.name,
        clientNotes: cleanedNotes
      }).catch(console.error);

      return {
        message: "Cotización aceptada. Tu pedido será procesado.",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          total: order.total
        }
      };

    } else {
      order.status = 'rejected';
      order.rejectedAt = new Date();
      order.rejectionReason = cleanedNotes || "Cotización rechazada por el cliente";
      order.statusHistory.push({
        status: 'rejected',
        changedBy: idsValidation.cleaned.userId,
        changedByModel: 'User',
        notes: order.rejectionReason,
        timestamp: new Date()
      });

      await order.save();

      // Notificar al admin
      notificationService.sendQuoteRejectedNotification({
        orderNumber: order.orderNumber,
        userName: order.user.name,
        reason: order.rejectionReason
      }).catch(console.error);

      return {
        message: "Cotización rechazada",
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          status: order.status,
          rejectionReason: order.rejectionReason
        }
      };
    }
  },

  /**
   * Actualizar estado del pedido con validación
   */
  async updateOrderStatus(orderId, adminId, status, notes) {
    // Validar IDs
    const idsValidation = validateFields({ orderId, adminId }, {
      orderId: (value) => validators.mongoId(value, 'ID de pedido'),
      adminId: (value) => validators.mongoId(value, 'ID de administrador')
    });

    if (!idsValidation.isValid) {
      const error = new Error(idsValidation.errors.join('; '));
      error.statusCode = 400;
      error.code = 'INVALID_IDS';
      throw error;
    }

    // Validar estado
    const validStatuses = [
      'pending_approval', 'quoted', 'approved', 'rejected',
      'in_production', 'ready_for_delivery', 'delivered', 
      'completed', 'cancelled'
    ];

    if (!validStatuses.includes(status)) {
      const error = new Error(`Estado inválido: ${status}. Estados válidos: ${validStatuses.join(', ')}`);
      error.statusCode = 400;
      error.code = 'INVALID_STATUS';
      throw error;
    }

    // Validar notas
    let cleanedNotes = '';
    if (notes) {
      const notesValidation = validators.text(notes, 0, 1000);
      if (!notesValidation.isValid) {
        const error = new Error(`Notas inválidas: ${notesValidation.error}`);
        error.statusCode = 400;
        error.code = 'INVALID_NOTES';
        throw error;
      }
      cleanedNotes = notesValidation.cleaned;
    }

    const order = await Order.findById(idsValidation.cleaned.orderId).populate('user', 'email name');

    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    const previousStatus = order.status;
    order.status = status;

    // Actualizar campos específicos según el estado
    switch (status) {
      case 'delivered':
        order.deliveredAt = new Date();
        break;
      case 'completed':
        order.completedAt = new Date();
        order.canReview = true;
        break;
      case 'cancelled':
        order.cancelledAt = new Date();
        order.cancellationReason = cleanedNotes || 'Cancelado por administrador';
        break;
      case 'ready_for_delivery':
        order.actualReadyDate = new Date();
        break;
    }

    order.statusHistory.push({
      status,
      previousStatus,
      changedBy: idsValidation.cleaned.adminId,
      changedByModel: 'Employee',
      notes: cleanedNotes || `Estado cambiado a ${status}`,
      timestamp: new Date()
    });

    await order.save();

    // Notificar al cliente
    notificationService.sendStatusUpdateNotification({
      orderNumber: order.orderNumber,
      newStatus: status,
      previousStatus,
      notes: cleanedNotes,
      userEmail: order.user.email,
      userName: order.user.name,
      userPhone: order.user.phoneNumber,
      order: order
    }).catch(console.error);

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      newStatus: status,
      previousStatus
    };
  },

  /**
   * Actualizar etapa de producción con validación
   */
  async updateProductionStage(orderId, adminId, productionStage, notes, photoUrl, estimatedCompletion) {
    // Validar IDs
    const idsValidation = validateFields({ orderId, adminId }, {
      orderId: (value) => validators.mongoId(value, 'ID de pedido'),
      adminId: (value) => validators.mongoId(value, 'ID de administrador')
    });

    if (!idsValidation.isValid) {
      const error = new Error(idsValidation.errors.join('; '));
      error.statusCode = 400;
      error.code = 'INVALID_IDS';
      throw error;
    }

    // Validar etapa de producción
    const validStages = [
      'sourcing_product', 'preparing_materials', 'printing',
      'sublimating', 'quality_check', 'packaging'
    ];

    if (!validStages.includes(productionStage)) {
      const error = new Error(`Etapa de producción inválida: ${productionStage}. Etapas válidas: ${validStages.join(', ')}`);
      error.statusCode = 400;
      error.code = 'INVALID_PRODUCTION_STAGE';
      throw error;
    }

    // Validar notas
    let cleanedNotes = '';
    if (notes) {
      const notesValidation = validators.text(notes, 0, 500);
      if (!notesValidation.isValid) {
        const error = new Error(`Notas de producción inválidas: ${notesValidation.error}`);
        error.statusCode = 400;
        error.code = 'INVALID_PRODUCTION_NOTES';
        throw error;
      }
      cleanedNotes = notesValidation.cleaned;
    }

    // Validar URL de foto si se proporciona
    if (photoUrl && typeof photoUrl !== 'string') {
      const error = new Error('URL de foto debe ser texto');
      error.statusCode = 400;
      error.code = 'INVALID_PHOTO_URL';
      throw error;
    }

    // Validar fecha estimada de completación
    let validatedEstimatedCompletion = null;
    if (estimatedCompletion) {
      const dateValidation = validators.futureDate(estimatedCompletion, 1);
      if (!dateValidation.isValid) {
        const error = new Error(`Fecha estimada inválida: ${dateValidation.error}`);
        error.statusCode = 400;
        error.code = 'INVALID_ESTIMATED_COMPLETION';
        throw error;
      }
      validatedEstimatedCompletion = dateValidation.cleaned;
    }

    const order = await Order.findById(idsValidation.cleaned.orderId)
      .populate('user', 'email name')
      .populate('items.product', 'name');

    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (!['approved', 'in_production'].includes(order.status)) {
      const error = new Error("El pedido debe estar aprobado o en producción");
      error.statusCode = 400;
      error.code = 'INVALID_ORDER_STATUS';
      throw error;
    }

    // Cambiar a in_production si está approved
    if (order.status === 'approved') {
      order.status = 'in_production';
      order.statusHistory.push({
        status: 'in_production',
        changedBy: idsValidation.cleaned.adminId,
        changedByModel: 'Employee',
        notes: 'Iniciando producción',
        timestamp: new Date()
      });
    }

    // Actualizar etapa específica
    order.items.forEach(item => {
      item.productionStages[productionStage] = {
        completed: true,
        completedAt: new Date(),
        completedBy: idsValidation.cleaned.adminId,
        notes: cleanedNotes,
        photoUrl: photoUrl || null
      };

      // Actualizar progreso
      const stages = Object.keys(item.productionStages);
      const completedStages = stages.filter(stage => 
        item.productionStages[stage].completed
      );
      
      item.productionProgress = Math.round((completedStages.length / stages.length) * 100);
      
      if (completedStages.length === stages.length) {
        item.status = 'ready';
        item.readyAt = new Date();
      } else {
        item.status = 'in_production';
      }
    });

    // Si todos los items están listos, cambiar estado del pedido
    const allItemsReady = order.items.every(item => item.status === 'ready');
    if (allItemsReady) {
      order.status = 'ready_for_delivery';
      order.actualReadyDate = new Date();
      order.statusHistory.push({
        status: 'ready_for_delivery',
        changedBy: idsValidation.cleaned.adminId,
        changedByModel: 'Employee',
        notes: 'Todos los productos están listos',
        timestamp: new Date()
      });
    }

    if (validatedEstimatedCompletion) {
      order.estimatedReadyDate = validatedEstimatedCompletion;
    }

    await order.save();

    // Notificar al cliente
    notificationService.sendProductionUpdateNotification({
      orderNumber: order.orderNumber,
      stage: productionStage,
      stageLabel: this.getStageTitle(productionStage),
      progress: order.items[0].productionProgress,
      userEmail: order.user.email,
      userName: order.user.name,
      photoUrl,
      notes: cleanedNotes
    }).catch(console.error);

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      productionProgress: order.items[0].productionProgress,
      completedStages: Object.keys(order.items[0].productionStages)
        .filter(stage => order.items[0].productionStages[stage].completed)
    };
  },

  /**
   * Subir foto de producción con validación
   */
  async uploadProductionPhoto(orderId, adminId, stage, photoUrl, notes) {
    // Validar IDs
    const idsValidation = validateFields({ orderId, adminId }, {
      orderId: (value) => validators.mongoId(value, 'ID de pedido'),
      adminId: (value) => validators.mongoId(value, 'ID de administrador')
    });

    if (!idsValidation.isValid) {
      const error = new Error(idsValidation.errors.join('; '));
      error.statusCode = 400;
      error.code = 'INVALID_IDS';
      throw error;
    }

    // Validar etapa de foto
    const validStages = ['printing', 'sublimating', 'quality_check', 'final'];
    if (!validStages.includes(stage)) {
      const error = new Error(`Etapa de foto inválida: ${stage}. Etapas válidas: ${validStages.join(', ')}`);
      error.statusCode = 400;
      error.code = 'INVALID_PHOTO_STAGE';
      throw error;
    }

    // Validar URL de foto
    if (!photoUrl || typeof photoUrl !== 'string' || photoUrl.trim().length === 0) {
      const error = new Error('URL de foto requerida');
      error.statusCode = 400;
      error.code = 'PHOTO_URL_REQUIRED';
      throw error;
    }

    // Validar notas
    let cleanedNotes = '';
    if (notes) {
      const notesValidation = validators.text(notes, 0, 500);
      if (!notesValidation.isValid) {
        const error = new Error(`Notas de foto inválidas: ${notesValidation.error}`);
        error.statusCode = 400;
        error.code = 'INVALID_PHOTO_NOTES';
        throw error;
      }
      cleanedNotes = notesValidation.cleaned;
    }

    const order = await Order.findById(idsValidation.cleaned.orderId).populate('user', 'email name');

    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    const photoData = {
      url: photoUrl.trim(),
      stage,
      uploadedAt: new Date(),
      uploadedBy: idsValidation.cleaned.adminId,
      notes: cleanedNotes,
      clientApproved: false
    };

    if (!order.productionPhotos) {
      order.productionPhotos = [];
    }
    
    order.productionPhotos.push(photoData);
    await order.save();

    // Notificar al cliente para que apruebe la foto
    notificationService.sendPhotoUploadedNotification({
      orderNumber: order.orderNumber,
      stage,
      photoUrl: photoUrl.trim(),
      userEmail: order.user.email,
      userName: order.user.name
    }).catch(console.error);

    return {
      photoId: photoData._id,
      stage,
      photoUrl: photoUrl.trim(),
      needsClientApproval: true
    };
  },

  /**
   * Aprobar foto de producción (cliente) con validación
   */
  async approveProductPhoto(orderId, userId, photoId, approved, changeRequested, clientNotes) {
    // Validar IDs
    const idsValidation = validateFields({ orderId, userId, photoId }, {
      orderId: (value) => validators.mongoId(value, 'ID de pedido'),
      userId: (value) => validators.mongoId(value, 'ID de usuario'),
      photoId: (value) => validators.mongoId(value, 'ID de foto')
    });

    if (!idsValidation.isValid) {
      const error = new Error(idsValidation.errors.join('; '));
      error.statusCode = 400;
      error.code = 'INVALID_IDS';
      throw error;
    }

    // Validar approved como booleano
    if (typeof approved !== 'boolean') {
      const error = new Error('La aprobación debe ser true o false');
      error.statusCode = 400;
      error.code = 'INVALID_APPROVAL_VALUE';
      throw error;
    }

    // Validar cambios solicitados
    let cleanedChangeRequested = '';
    if (changeRequested) {
      const changeValidation = validators.text(changeRequested, 0, 500);
      if (!changeValidation.isValid) {
        const error = new Error(`Cambios solicitados inválidos: ${changeValidation.error}`);
        error.statusCode = 400;
        error.code = 'INVALID_CHANGE_REQUEST';
        throw error;
      }
      cleanedChangeRequested = changeValidation.cleaned;
    }

    // Validar notas del cliente
    let cleanedClientNotes = '';
    if (clientNotes) {
      const notesValidation = validators.text(clientNotes, 0, 500);
      if (!notesValidation.isValid) {
        const error = new Error(`Notas del cliente inválidas: ${notesValidation.error}`);
        error.statusCode = 400;
        error.code = 'INVALID_CLIENT_NOTES';
        throw error;
      }
      cleanedClientNotes = notesValidation.cleaned;
    }

    const order = await Order.findById(idsValidation.cleaned.orderId);

    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (!order.user.equals(idsValidation.cleaned.userId)) {
      const error = new Error("No tienes permiso para aprobar fotos de este pedido");
      error.statusCode = 403;
      error.code = 'UNAUTHORIZED_ACCESS';
      throw error;
    }

    const photo = order.productionPhotos.id(idsValidation.cleaned.photoId);
    if (!photo) {
      const error = new Error("Foto no encontrada");
      error.statusCode = 404;
      error.code = 'PHOTO_NOT_FOUND';
      throw error;
    }

    photo.clientResponse = {
      approved,
      changeRequested: cleanedChangeRequested,
      notes: cleanedClientNotes,
      respondedAt: new Date()
    };

    photo.clientApproved = approved;
    await order.save();

    // Notificar al admin
    notificationService.sendPhotoApprovalNotification({
      orderNumber: order.orderNumber,
      stage: photo.stage,
      approved,
      changeRequested: cleanedChangeRequested,
      clientNotes: cleanedClientNotes
    }).catch(console.error);

    return {
      message: approved ? "Foto aprobada" : "Cambios solicitados",
      data: {
        photoId: idsValidation.cleaned.photoId,
        approved,
        changeRequested: cleanedChangeRequested
      }
    };
  },

  /**
   * Cancelar pedido con validación
   */
  async cancelOrder(orderId, userId, isAdmin, reason) {
    // Validar IDs
    const idsValidation = validateFields({ orderId, userId }, {
      orderId: (value) => validators.mongoId(value, 'ID de pedido'),
      userId: (value) => validators.mongoId(value, 'ID de usuario')
    });

    if (!idsValidation.isValid) {
      const error = new Error(idsValidation.errors.join('; '));
      error.statusCode = 400;
      error.code = 'INVALID_IDS';
      throw error;
    }

    // Validar razón
    let cleanedReason = '';
    if (reason) {
      const reasonValidation = validators.text(reason, 0, 500);
      if (!reasonValidation.isValid) {
        const error = new Error(`Razón de cancelación inválida: ${reasonValidation.error}`);
        error.statusCode = 400;
        error.code = 'INVALID_CANCELLATION_REASON';
        throw error;
      }
      cleanedReason = reasonValidation.cleaned;
    }

    const order = await Order.findById(idsValidation.cleaned.orderId).populate('user', 'email name');

    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (!isAdmin && !order.user._id.equals(idsValidation.cleaned.userId)) {
      const error = new Error("No tienes permiso para cancelar este pedido");
      error.statusCode = 403;
      error.code = 'UNAUTHORIZED_ACCESS';
      throw error;
    }

    const cancellableStatuses = ['pending_approval', 'quoted', 'approved'];
    if (!cancellableStatuses.includes(order.status) || order.payment.status === 'paid') {
      const error = new Error("Este pedido no puede ser cancelado en su estado actual");
      error.statusCode = 400;
      error.code = 'CANNOT_CANCEL';
      throw error;
    }

    const previousStatus = order.status;
    order.status = 'cancelled';
    order.cancelledAt = new Date();
    order.cancellationReason = cleanedReason || 'Cancelado por el usuario';

    order.statusHistory.push({
      status: 'cancelled',
      previousStatus,
      changedBy: idsValidation.cleaned.userId,
      changedByModel: isAdmin ? 'Employee' : 'User',
      notes: cleanedReason || 'Pedido cancelado',
      timestamp: new Date()
    });

    await order.save();

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      cancelledAt: order.cancelledAt,
      cancellationReason: order.cancellationReason
    };
  }
};