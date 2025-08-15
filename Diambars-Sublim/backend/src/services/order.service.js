// services/orderService.js - Lógica de negocio sin cálculos automáticos
import Order from "../models/order.js";
import Design from "../models/design.js";
import Address from "../models/address.js";
import Product from "../models/product.js";
import mongoose from "mongoose";
import { validateDepartmentAndMunicipality } from "../utils/locationUtils.js";
import { notificationService } from "./notification.service.js";

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
      paymentMethod = 'cash',
      paymentTiming = 'on_delivery',
      isManualOrder = false // Para pedidos manuales de clientes mayores
    } = body;

    console.log('🔍 Validando datos del pedido:', { designId, quantity, deliveryType, isManualOrder });

    // Validar diseño
    if (!designId || !mongoose.Types.ObjectId.isValid(designId)) {
      const error = new Error("ID de diseño inválido");
      error.statusCode = 400;
      error.code = 'INVALID_DESIGN_ID';
      throw error;
    }

    const design = await Design.findById(designId)
      .populate('product')
      .populate('user');

    if (!design) {
      const error = new Error("Diseño no encontrado");
      error.statusCode = 404;
      error.code = 'DESIGN_NOT_FOUND';
      throw error;
    }

    // Para pedidos manuales, el admin puede crear para cualquier usuario
    const isAdmin = body.isManualOrder && body.adminId;
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
      'items.design': designId,
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

    return {
      design,
      quantity: Math.max(1, Math.min(100, parseInt(quantity) || 1)),
      deliveryType,
      deliveryAddress,
      meetupDetails: processedMeetupDetails,
      clientNotes: clientNotes?.trim() || '',
      paymentMethod,
      paymentTiming,
      isManualOrder,
      targetUserId: isManualOrder ? body.targetUserId || userId : userId
    };
  },

  /**
   * Validar dirección de entrega
   */
  async validateDeliveryAddress(addressId, newAddress, userId) {
    if (addressId) {
      // Usar dirección existente
      const address = await Address.findOne({
        _id: addressId,
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
      // Validar nueva dirección
      const required = ['recipient', 'phoneNumber', 'department', 'municipality', 'address'];
      const missing = required.filter(field => !newAddress[field]);
      
      if (missing.length > 0) {
        const error = new Error(`Faltan campos en la dirección: ${missing.join(', ')}`);
        error.statusCode = 400;
        error.code = 'INCOMPLETE_ADDRESS';
        throw error;
      }

      const locationValidation = validateDepartmentAndMunicipality(
        newAddress.department, 
        newAddress.municipality
      );

      if (!locationValidation.isValid) {
        const error = new Error(locationValidation.message);
        error.statusCode = 400;
        error.code = locationValidation.error;
        throw error;
      }

      return {
        label: newAddress.label || "Dirección de entrega",
        recipient: newAddress.recipient.trim(),
        phoneNumber: newAddress.phoneNumber.replace(/[\s-]/g, ''),
        department: newAddress.department.trim(),
        municipality: newAddress.municipality.trim(),
        address: newAddress.address.trim(),
        additionalDetails: newAddress.additionalDetails?.trim() || ""
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

    const processed = {
      date: meetupDetails.date ? new Date(meetupDetails.date) : null,
      location: {
        type: "Point",
        coordinates: meetupDetails.location?.coordinates || [-89.2182, 13.6929],
        address: meetupDetails.address || "",
        placeName: meetupDetails.placeName || ""
      },
      notes: meetupDetails.notes || ""
    };

    // Validar fecha futura
    if (processed.date && processed.date < new Date(Date.now() + 24 * 60 * 60 * 1000)) {
      const error = new Error("La fecha del encuentro debe ser al menos 24 horas en el futuro");
      error.statusCode = 400;
      error.code = 'INVALID_MEETUP_DATE';
      throw error;
    }

    return processed;
  },

  /**
   * Crear nuevo pedido
   */
  async createOrder(orderData, session) {
    const { design, targetUserId, quantity, deliveryType, deliveryAddress, meetupDetails, clientNotes, paymentMethod, paymentTiming } = orderData;

    console.log('📦 Creando pedido con diseño cotizado:', {
      designId: design._id,
      designPrice: design.price,
      quantity
    });

    // USAR PRECIO MANUAL DEL DISEÑO (NO CALCULAR)
    const unitPrice = design.price; // El admin ya cotizó manualmente
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
        subtotal,
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
        method: paymentMethod,
        status: 'pending',
        timing: paymentTiming,
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = new Error("ID de pedido inválido");
      error.statusCode = 400;
      error.code = 'INVALID_ORDER_ID';
      throw error;
    }

    const order = await Order.findById(id)
      .populate('user', 'name email phone')
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
   * Obtener pedidos del usuario
   */
  async getUserOrders(userId, filters) {
    const { page = 1, limit = 10, status } = filters;
    
    const filter = { user: userId };
    if (status) filter.status = status;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
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
   * Obtener todos los pedidos (admin)
   */
  async getAllOrders(filters) {
    const { page = 1, limit = 10, status, user, search, startDate, endDate } = filters;

    let filter = {};
    
    if (status) filter.status = status;
    if (user && mongoose.Types.ObjectId.isValid(user)) filter.user = user;
    
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { clientNotes: { $regex: search, $options: 'i' } },
        { adminNotes: { $regex: search, $options: 'i' } }
      ];
    }

    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
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
   * Cotización manual del admin (SIN cálculos automáticos)
   */
  async submitManualQuote(orderId, adminId, totalPrice, deliveryFee, tax, notes) {
    const order = await Order.findById(orderId).populate('user', 'email name');

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

    // Actualizar precios con valores manuales del admin
    order.deliveryFee = Math.max(0, parseFloat(deliveryFee) || 0);
    order.tax = Math.max(0, parseFloat(tax) || 0);
    order.total = Math.max(0, parseFloat(totalPrice));
    order.payment.amount = order.total;

    order.status = 'quoted';
    order.adminNotes = notes || '';
    order.statusHistory.push({
      status: 'quoted',
      changedBy: adminId,
      changedByModel: 'Employee',
      notes: `Pedido cotizado manualmente. Total: ${order.total}`,
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
   * Responder a cotización (cliente)
   */
  async respondToQuote(orderId, userId, accept, clientNotes) {
    const order = await Order.findById(orderId).populate('user', 'email name');

    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (!order.user._id.equals(userId)) {
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
      order.clientNotes = clientNotes || order.clientNotes;
      order.statusHistory.push({
        status: 'approved',
        changedBy: userId,
        changedByModel: 'User',
        notes: `Cotización aceptada por el cliente${clientNotes ? ': ' + clientNotes : ''}`,
        timestamp: new Date()
      });

      await order.save();

      // Notificar al admin
      notificationService.sendQuoteAcceptedNotification({
        orderNumber: order.orderNumber,
        userName: order.user.name,
        clientNotes
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
      order.rejectionReason = clientNotes || "Cotización rechazada por el cliente";
      order.statusHistory.push({
        status: 'rejected',
        changedBy: userId,
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
   * Actualizar estado del pedido
   */
  async updateOrderStatus(orderId, adminId, status, notes) {
    const validStatuses = [
      'pending_approval', 'quoted', 'approved', 'rejected',
      'in_production', 'ready_for_delivery', 'delivered', 
      'completed', 'cancelled'
    ];

    if (!validStatuses.includes(status)) {
      const error = new Error(`Estado inválido: ${status}`);
      error.statusCode = 400;
      error.code = 'INVALID_STATUS';
      throw error;
    }

    const order = await Order.findById(orderId).populate('user', 'email name');

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
        order.cancellationReason = notes || 'Cancelado por administrador';
        break;
      case 'ready_for_delivery':
        order.actualReadyDate = new Date();
        break;
    }

    order.statusHistory.push({
      status,
      previousStatus,
      changedBy: adminId,
      changedByModel: 'Employee',
      notes: notes || `Estado cambiado a ${status}`,
      timestamp: new Date()
    });

    await order.save();

    // Notificar al cliente
    notificationService.sendStatusUpdateNotification({
      orderNumber: order.orderNumber,
      newStatus: status,
      previousStatus,
      notes,
      userEmail: order.user.email,
      userName: order.user.name
    }).catch(console.error);

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      newStatus: status,
      previousStatus
    };
  },

  /**
   * Actualizar etapa de producción
   */
  async updateProductionStage(orderId, adminId, productionStage, notes, photoUrl, estimatedCompletion) {
    const validStages = [
      'sourcing_product', 'preparing_materials', 'printing',
      'sublimating', 'quality_check', 'packaging'
    ];

    if (!validStages.includes(productionStage)) {
      const error = new Error("Etapa de producción inválida");
      error.statusCode = 400;
      error.code = 'INVALID_PRODUCTION_STAGE';
      throw error;
    }

    const order = await Order.findById(orderId)
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
        changedBy: adminId,
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
        completedBy: adminId,
        notes: notes || '',
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
        changedBy: adminId,
        changedByModel: 'Employee',
        notes: 'Todos los productos están listos',
        timestamp: new Date()
      });
    }

    if (estimatedCompletion) {
      order.estimatedReadyDate = new Date(estimatedCompletion);
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
      notes
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
   * Subir foto de producción
   */
  async uploadProductionPhoto(orderId, adminId, stage, photoUrl, notes) {
    const order = await Order.findById(orderId).populate('user', 'email name');

    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    const validStages = ['printing', 'sublimating', 'quality_check', 'final'];
    if (!validStages.includes(stage)) {
      const error = new Error("Etapa de foto inválida");
      error.statusCode = 400;
      error.code = 'INVALID_PHOTO_STAGE';
      throw error;
    }

    const photoData = {
      url: photoUrl,
      stage,
      uploadedAt: new Date(),
      uploadedBy: adminId,
      notes: notes || '',
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
      photoUrl,
      userEmail: order.user.email,
      userName: order.user.name
    }).catch(console.error);

    return {
      photoId: photoData._id,
      stage,
      photoUrl,
      needsClientApproval: true
    };
  },

  /**
   * Aprobar foto de producción (cliente)
   */
  async approveProductPhoto(orderId, userId, photoId, approved, changeRequested, clientNotes) {
    const order = await Order.findById(orderId);

    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (!order.user.equals(userId)) {
      const error = new Error("No tienes permiso para aprobar fotos de este pedido");
      error.statusCode = 403;
      error.code = 'UNAUTHORIZED_ACCESS';
      throw error;
    }

    const photo = order.productionPhotos.id(photoId);
    if (!photo) {
      const error = new Error("Foto no encontrada");
      error.statusCode = 404;
      error.code = 'PHOTO_NOT_FOUND';
      throw error;
    }

    photo.clientResponse = {
      approved,
      changeRequested: changeRequested || '',
      notes: clientNotes || '',
      respondedAt: new Date()
    };

    photo.clientApproved = approved;
    await order.save();

    // Notificar al admin
    notificationService.sendPhotoApprovalNotification({
      orderNumber: order.orderNumber,
      stage: photo.stage,
      approved,
      changeRequested,
      clientNotes
    }).catch(console.error);

    return {
      message: approved ? "Foto aprobada" : "Cambios solicitados",
      data: {
        photoId,
        approved,
        changeRequested
      }
    };
  },

  /**
   * Cancelar pedido
   */
  async cancelOrder(orderId, userId, isAdmin, reason) {
    const order = await Order.findById(orderId).populate('user', 'email name');

    if (!order) {
      const error = new Error("Pedido no encontrado");
      error.statusCode = 404;
      error.code = 'ORDER_NOT_FOUND';
      throw error;
    }

    if (!isAdmin && !order.user._id.equals(userId)) {
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
    order.cancellationReason = reason || 'Cancelado por el usuario';

    order.statusHistory.push({
      status: 'cancelled',
      previousStatus,
      changedBy: userId,
      changedByModel: isAdmin ? 'Employee' : 'User',
      notes: reason || 'Pedido cancelado',
      timestamp: new Date()
    });

    await order.save();

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      cancelledAt: order.cancelledAt
    };
  },

  /**
   * Finalizar pedido presencial
   */
  async finalizeOrder(orderId, adminId, finalData) {
    const order = await Order.findById(orderId).populate('user', 'email name');

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

    order.status = 'completed';
    order.completedAt = new Date();
    order.canReview = true;
    order.adminNotes = (order.adminNotes || '') + '\n' + (finalData.deliveryNotes || '');

    order.statusHistory.push({
      status: 'completed',
      changedBy: adminId,
      changedByModel: 'Employee',
      notes: `Pedido finalizado. ${finalData.deliveryNotes || ''}`,
      timestamp: new Date()
    });

    await order.save();

    return {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.status,
      completedAt: order.completedAt
    };
  },

  // ==================== MÉTODOS AUXILIARES ====================

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
  }
};