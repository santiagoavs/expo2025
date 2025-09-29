// controllers/order.controller.js - ACTUALIZADO para nueva arquitectura de pagos
import Order from "../models/order.js";
import Design from "../models/design.js";
import Address from "../models/address.js";
import mongoose from "mongoose";
import { orderService } from "../services/order.service.js";
import { paymentProcessor } from "../services/payment/PaymentProcessor.js";
import { validators } from "../utils/validators.utils.js";
import { notificationService } from "../services/email/notification.service.js";
import { qualityApprovalService } from "../services/email/quality-approval.service.js";

const orderController = {};

// ==================== MÉTODOS CLIENTE + ADMIN ====================

/**
 * Crear nuevo pedido (normal + manual para clientes mayores)
 */
orderController.createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    console.log('📦 Creando pedido:', {
      userId: req.user._id,
      isManualOrder: req.body.isManualOrder || false
    });

    // Validar datos del pedido usando el validador
    const orderValidation = validators.orderData(req.body);
    if (!orderValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Datos de pedido inválidos",
        error: orderValidation.error
      });
    }

    // Validar dirección si es entrega a domicilio
    if (req.body.deliveryType === 'delivery') {
      const addressValidation = validators.address(req.body.deliveryAddress);
      if (!addressValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Dirección de entrega inválida",
          error: addressValidation.error
        });
      }
      // Usar datos limpios de la validación
      req.body.deliveryAddress = addressValidation.cleaned;
    }

    // Buscar el diseño en la base de datos
    const design = await Design.findById(req.body.designId).populate('product user');
    if (!design) {
      return res.status(404).json({
        success: false,
        message: "Diseño no encontrado",
        error: 'DESIGN_NOT_FOUND'
      });
    }

    // Usar datos limpios de la validación
    const orderData = {
      ...orderValidation.cleaned,
      design, // Pasar el objeto design completo
      targetUserId: req.body.userId || req.user._id, // Usar userId del body o el usuario autenticado
      isManualOrder: req.body.isManualOrder || false,
      paymentData: req.body.paymentData, // Pasar los datos de pago
      deliveryType: req.body.deliveryType,
      deliveryAddress: req.body.deliveryAddress,
      quantity: req.body.quantity || 1,
      clientNotes: req.body.notes
    };
    
    // Crear pedido usando el servicio
    const newOrder = await orderService.createOrder(orderData, session);
    
    await session.commitTransaction();

    // Notificar (sin bloquear respuesta)
    notificationService.sendNewOrderNotification(newOrder).catch(console.error);

    res.status(201).json({
      success: true,
      message: "Pedido creado exitosamente",
      data: {
        order: newOrder.toPublicObject(),
        _links: {
          order: `/api/orders/${newOrder._id}`,
          tracking: `/api/orders/${newOrder._id}/tracking`
        }
      }
    });

  } catch (error) {
    // Solo hacer abort si la transacción no fue committeada
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    console.error("❌ Error en createOrder:", error);
    
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al crear el pedido",
      error: error.code || 'INTERNAL_ERROR'
    });
  } finally {
    session.endSession();
  }
};

/**
 * Responder a cotización (aceptar/rechazar)
 */
orderController.respondToQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { accept, clientNotes } = req.body;
    const userId = req.user._id;

    // Validar ID de la orden
    const orderIdValidation = validators.mongoId(id, 'ID de pedido');
    if (!orderIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "ID de pedido inválido",
        error: orderIdValidation.error
      });
    }

    // Validar notas del cliente (opcional)
    let validatedNotes;
    if (clientNotes) {
      const notesValidation = validators.text(clientNotes, 0, 1000);
      if (!notesValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Notas inválidas",
          error: notesValidation.error
        });
      }
      validatedNotes = notesValidation.cleaned;
    }

    const result = await orderService.respondToQuote(
      orderIdValidation.cleaned, 
      userId, 
      accept, 
      validatedNotes
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });

  } catch (error) {
    console.error("❌ Error en respondToQuote:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al responder cotización",
      error: error.code || 'INTERNAL_ERROR'
    });
  }
};

/**
 * Cotizar manualmente (SIN cálculos automáticos)
 */
orderController.submitQuote = async (req, res) => {
  try {
    const { id } = req.params;
    const { totalPrice, deliveryFee, tax, notes } = req.body;
    const adminId = req.user._id;

    // Validar ID de la orden
    const orderIdValidation = validators.mongoId(id, 'ID de pedido');
    if (!orderIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "ID de pedido inválido",
        error: orderIdValidation.error
      });
    }

    // Validar precio total
    const priceValidation = validators.price(totalPrice);
    if (!priceValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Precio total inválido",
        error: priceValidation.error
      });
    }

    // Validar tarifa de entrega (opcional)
    let validatedDeliveryFee = 0;
    if (deliveryFee !== undefined) {
      const deliveryFeeValidation = validators.price(deliveryFee, 0);
      if (!deliveryFeeValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Tarifa de entrega inválida",
          error: deliveryFeeValidation.error
        });
      }
      validatedDeliveryFee = deliveryFeeValidation.cleaned;
    }

    // Validar impuesto (opcional)
    let validatedTax = 0;
    if (tax !== undefined) {
      const taxValidation = validators.price(tax, 0);
      if (!taxValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Impuesto inválido",
          error: taxValidation.error
        });
      }
      validatedTax = taxValidation.cleaned;
    }

    // Validar notas (opcional)
    let validatedNotes;
    if (notes) {
      const notesValidation = validators.text(notes, 0, 500);
      if (!notesValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Notas inválidas",
          error: notesValidation.error
        });
      }
      validatedNotes = notesValidation.cleaned;
    }

    const result = await orderService.submitManualQuote(
      orderIdValidation.cleaned, 
      adminId, 
      priceValidation.cleaned, 
      validatedDeliveryFee, 
      validatedTax, 
      validatedNotes
    );

    res.status(200).json({
      success: true,
      message: "Cotización enviada al cliente",
      data: result
    });

  } catch (error) {
    console.error("❌ Error en submitQuote:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al cotizar pedido",
      error: error.code || 'INTERNAL_ERROR'
    });
  }
};

/**
 * Registrar pago en efectivo - ACTUALIZADO para nueva arquitectura
 */
orderController.registerCashPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;
    const adminId = req.user._id;

    console.log('💰 [OrderController] Registrando pago en efectivo para orden:', id);

    // Validar ID de la orden
    const orderIdValidation = validators.mongoId(id, 'ID de pedido');
    if (!orderIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "ID de pedido inválido",
        error: orderIdValidation.error
      });
    }

    // Obtener la orden para validación
    const order = await Order.findById(orderIdValidation.cleaned);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }

    // ✅ VALIDACIÓN DE NEGOCIO: Solo permitir pago en efectivo cuando esté en "en camino"
    if (order.status !== 'out_for_delivery') {
      return res.status(400).json({
        success: false,
        message: "Los pagos en efectivo solo se pueden registrar cuando la orden está 'En Camino' (out_for_delivery)",
        error: 'INVALID_ORDER_STATUS_FOR_CASH',
        currentStatus: order.status,
        requiredStatus: 'out_for_delivery'
      });
    }

    // Validar que la orden tenga un total válido
    if (!order.total || order.total <= 0) {
      return res.status(400).json({
        success: false,
        message: "La orden no tiene un monto válido para pagar",
        error: 'INVALID_ORDER_AMOUNT'
      });
    }

    // Validar datos de pago en efectivo
    const cashPaymentValidation = validators.cashPayment(paymentData, order.total);
    if (!cashPaymentValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Datos de pago en efectivo inválidos",
        error: cashPaymentValidation.error
      });
    }

    // ✅ USAR LA NUEVA ARQUITECTURA DE PAGOS
    
    // 1. Primero crear el pago como "pending" si no existe
    const userContext = {
      adminId,
      userAgent: req.get('User-Agent'),
      ipAddress: req.ip,
      source: 'admin'
    };

    const paymentCreationData = {
      method: 'cash',
      amount: order.total,
      timing: 'on_delivery',
      paymentType: 'full',
      notes: 'Pago en efectivo registrado por admin'
    };

    // Verificar si ya existe un pago para esta orden
    const Payment = (await import('../models/payment.js')).default;
    let existingPayment = await Payment.findOne({
      orderId: order._id,
      method: 'cash',
      status: { $in: ['pending', 'processing'] }
    });

    let paymentResult;

    if (!existingPayment) {
      // Crear nuevo pago
      paymentResult = await paymentProcessor.processPayment(
        { orderId: order._id },
        paymentCreationData,
        userContext
      );
      existingPayment = await Payment.findById(paymentResult.paymentId);
    }

    // 2. Confirmar el pago con los datos recibidos
    const confirmationData = {
      receivedAmount: cashPaymentValidation.cleaned.cashReceived,
      changeGiven: cashPaymentValidation.cleaned.changeGiven,
      location: cashPaymentValidation.cleaned.location,
      notes: cashPaymentValidation.cleaned.notes,
      deliveredAt: new Date()
    };

    const confirmationResult = await paymentProcessor.confirmPayment(
      existingPayment._id,
      confirmationData,
      { adminId, adminRole: req.user.role }
    );

    res.status(200).json({
      success: true,
      message: "Pago en efectivo registrado exitosamente",
      data: {
        paymentId: confirmationResult.paymentId,
        orderId: confirmationResult.orderId,
        receiptNumber: confirmationResult.receiptNumber || `CASH-${order.orderNumber}-${Date.now()}`,
        receivedAmount: confirmationData.receivedAmount,
        changeGiven: confirmationData.changeGiven,
        collectedBy: adminId,
        collectedAt: confirmationData.deliveredAt
      }
    });

  } catch (error) {
    console.error("❌ Error en registerCashPayment:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al registrar pago en efectivo",
      error: error.code || 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtener todas las órdenes (Admin)
 */
orderController.getAllOrders = async (req, res) => {
  try {
    const filters = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      status: req.query.status || '',
      deliveryType: req.query.deliveryType || '',
      paymentStatus: req.query.paymentStatus || '',
      search: req.query.search || '',
      userId: req.query.userId || '',
      startDate: req.query.startDate || '',
      endDate: req.query.endDate || '',
      sort: req.query.sort || 'createdAt',
      order: req.query.order || 'desc'
    };

    console.log('📦 [orderController] Obteniendo todas las órdenes con filtros:', filters);

    // Construir query
    let query = {};
    
    // Filtros básicos
    if (filters.status && filters.status !== '') {
      query.status = filters.status;
    }
    
    if (filters.deliveryType && filters.deliveryType !== '') {
      query.deliveryType = filters.deliveryType;
    }
    
    if (filters.paymentStatus && filters.paymentStatus !== '') {
      query['payment.status'] = filters.paymentStatus;
    }
    
    if (filters.userId && filters.userId !== '') {
      const userIdValidation = validators.mongoId(filters.userId, 'ID de usuario');
      if (userIdValidation.isValid) {
        query.user = userIdValidation.cleaned;
      }
    }

    // Búsqueda de texto
    if (filters.search && filters.search !== '') {
      query.$or = [
        { orderNumber: { $regex: filters.search, $options: 'i' } },
        { 'user.name': { $regex: filters.search, $options: 'i' } },
        { 'user.email': { $regex: filters.search, $options: 'i' } }
      ];
    }

    // Filtros de fecha
    if (filters.startDate && filters.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      
      if (!isNaN(startDate) && !isNaN(endDate)) {
        query.createdAt = {
          $gte: startDate,
          $lte: endDate
        };
      }
    }

    // Configurar ordenamiento
    const sortField = filters.sort || 'createdAt';
    const sortOrder = filters.order === 'asc' ? 1 : -1;
    const sortObj = { [sortField]: sortOrder };

    // Ejecutar consulta con paginación
    const options = {
      page: filters.page,
      limit: Math.min(filters.limit, 100), // Máximo 100 por página
      sort: sortObj,
      populate: [
        { 
          path: 'user', 
          select: 'name email phone' 
        },
        { 
          path: 'items.product', 
          select: 'name images category' 
        },
        { 
          path: 'items.design', 
          select: 'name previewImage' 
        }
      ],
      lean: false
    };

    const result = await Order.paginate(query, options);

    const orders = result.docs.map(order => {
      if (typeof order.toSafeObject === 'function') {
        return order.toSafeObject();
      }
      // Fallback si no existe el método
      return {
        _id: order._id,
        orderNumber: order.orderNumber,
        user: order.user,
        status: order.status,
        items: order.items,
        total: order.total,
        deliveryType: order.deliveryType,
        createdAt: order.createdAt,
        payment: {
          method: order.payment?.method,
          status: order.payment?.status
        }
      };
    });

    res.status(200).json({
      success: true,
      data: {
        orders,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.totalDocs,
          totalPages: result.totalPages,
          hasNext: result.hasNextPage,
          hasPrev: result.hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error("❌ Error en getAllOrders:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al obtener órdenes",
      error: error.code || 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtener orden por ID
 */
orderController.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = ['admin', 'manager'].includes(req.user.role);

    console.log('🔍 [orderController] Obteniendo orden:', id);

    // Validar ID
    const orderIdValidation = validators.mongoId(id, 'ID de pedido');
    if (!orderIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "ID de pedido inválido",
        error: orderIdValidation.error
      });
    }

    const order = await Order.findById(orderIdValidation.cleaned)
      .populate({
        path: 'user',
        select: 'name email phoneNumber phone', // Incluir ambos campos por compatibilidad
        options: { strictPopulate: false } // Permitir campos que no existen
      })
      .populate('items.product', 'name images category description')
      .populate('items.design', 'name previewImage elements customizationAreas');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
        error: 'ORDER_NOT_FOUND'
      });
    }

    // Si no tiene phoneNumber, hacer consulta directa
    if (order.user && !order.user.phoneNumber && !order.user.phone) {
      try {
        const User = (await import('../models/users.js')).default;
        const fullUser = await User.findById(order.user._id).select('name email phoneNumber phone');
        
        // Actualizar el objeto user con los datos completos
        if (fullUser) {
          order.user.phoneNumber = fullUser.phoneNumber;
          order.user.phone = fullUser.phone;
        }
      } catch (error) {
        console.error('Error consultando usuario:', error);
      }
    }

    // Verificar permisos (admin puede ver todas, usuario solo las suyas)
    if (!isAdmin && !order.user._id.equals(userId)) {
      return res.status(403).json({
        success: false,
        message: "No tienes permisos para ver esta orden",
        error: 'ACCESS_DENIED'
      });
    }

    // Usar método de respuesta detallada si existe
    const orderData = typeof order.toDetailedObject === 'function' 
      ? order.toDetailedObject() 
      : order.toObject();

    // ✅ AGREGAR INFORMACIÓN DE PAGOS DE LA NUEVA ARQUITECTURA
    try {
      const paymentStatus = await paymentProcessor.getOrderPaymentStatus(
        order._id,
        { userId: isAdmin ? null : userId, adminId: isAdmin ? userId : null }
      );
      
      orderData.paymentDetails = paymentStatus;
    } catch (paymentError) {
      console.error('❌ Error obteniendo detalles de pago:', paymentError);
      // No fallar si hay error en pagos, solo loggear
    }

    res.status(200).json({
      success: true,
      data: orderData
    });

  } catch (error) {
    console.error("❌ Error en getOrderById:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al obtener orden",
      error: error.code || 'INTERNAL_ERROR'
    });
  }
};

/**
 * Actualizar estado de orden
 */
orderController.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const adminId = req.user._id;

    console.log('🔄 [orderController] Actualizando estado:', id, status);

    // Validar ID de la orden
    const orderIdValidation = validators.mongoId(id, 'ID de pedido');
    if (!orderIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "ID de pedido inválido",
        error: orderIdValidation.error
      });
    }

    // Validar notas (opcional)
    let validatedNotes = '';
    if (notes) {
      const notesValidation = validators.text(notes, 0, 1000);
      if (!notesValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: "Notas inválidas",
          error: notesValidation.error
        });
      }
      validatedNotes = notesValidation.cleaned;
    }

    // Usar el servicio para actualizar el estado
    const result = await orderService.updateOrderStatus(
      orderIdValidation.cleaned,
      adminId,
      status,
      validatedNotes
    );

    res.status(200).json({
      success: true,
      message: `Estado actualizado a ${status}`,
      data: result
    });

  } catch (error) {
    console.error("❌ Error en updateOrderStatus:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al actualizar estado",
      error: error.code || 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtener detalles de pago de una orden
 */
orderController.getOrderPaymentDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role && ['admin', 'manager'].includes(req.user.role);

    // Validar ID de la orden
    const orderIdValidation = validators.mongoId(id, 'ID de pedido');
    if (!orderIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "ID de pedido inválido",
        error: orderIdValidation.error
      });
    }

    // Buscar orden
    const query = { _id: orderIdValidation.cleaned };
    if (!isAdmin) {
      query.user = userId; // Los usuarios solo pueden ver sus propias órdenes
    }

    const order = await Order.findOne(query)
      .populate('user', 'name email phoneNumber')
      .select('orderNumber status payment deliveryType deliveryAddress meetupDetails total subtotal deliveryFee tax createdAt');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }

    // ✅ VALIDACIONES DE NEGOCIO PARA PAGOS
    const canProcessCashPayment = order.status === 'out_for_delivery' && order.payment?.method === 'cash';
    const canProcessBankTransfer = ['pending_approval', 'approved', 'quoted'].includes(order.status);
    const canProcessWompiPayment = ['pending_approval', 'approved', 'quoted'].includes(order.status);

    // Preparar respuesta con información de pago MEJORADA
    const paymentDetails = {
      orderNumber: order.orderNumber,
      status: order.status,
      payment: {
        method: order.payment?.method,
        status: order.payment?.status,
        totalPaid: order.payment?.totalPaid || 0,
        balance: order.payment?.balance || order.total,
        lastPaidAt: order.payment?.lastPaidAt,
        requiresAdvancePayment: order.requiresAdvancePayment(),
        paymentProgress: Math.round(((order.payment?.totalPaid || 0) / order.total) * 100),
        // ✅ NUEVAS VALIDACIONES DE NEGOCIO FLEXIBLES
        businessRules: {
          canProcessCashPayment,
          canProcessBankTransfer,
          canProcessWompiPayment,
          // ✅ FLEXIBILIDAD: Permitir efectivo en más estados
          cashPaymentAllowed: ['ready_for_delivery', 'out_for_delivery', 'delivered'].includes(order.status),
          // ✅ FLEXIBILIDAD: Permitir transferencias en más estados
          bankTransferAllowed: ['pending_approval', 'approved', 'quoted', 'ready_for_delivery'].includes(order.status),
          // ✅ FLEXIBILIDAD: Permitir Wompi en más estados
          wompiPaymentAllowed: ['pending_approval', 'approved', 'quoted', 'ready_for_delivery'].includes(order.status)
        },
        // Información de estado para el admin
        statusInfo: {
          currentStatus: order.status,
          statusLabel: orderController.getStatusLabel(order.status),
          paymentMethodRestrictions: {
            cash: ['ready_for_delivery', 'out_for_delivery', 'delivered'].includes(order.status) ? 'Permitido' : 'Solo cuando esté listo para entrega o en camino',
            bank_transfer: ['pending_approval', 'approved', 'quoted', 'ready_for_delivery'].includes(order.status) ? 'Permitido' : 'Solo en estados iniciales o listo para entrega',
            wompi: ['pending_approval', 'approved', 'quoted', 'ready_for_delivery'].includes(order.status) ? 'Permitido' : 'Solo en estados iniciales o listo para entrega'
          }
        }
      },
      financial: {
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        tax: order.tax,
        total: order.total
      },
      delivery: {
        type: order.deliveryType,
        address: order.deliveryAddress,
        meetupDetails: order.meetupDetails
      },
      createdAt: order.createdAt
    };

    // ✅ AGREGAR PAGOS INDIVIDUALES PARA EL FRONTEND
    try {
      const Payment = (await import('../models/payment.js')).default;
      const individualPayments = await Payment.findByOrderId(order._id);
      
      // Formatear pagos para el frontend
      paymentDetails.payments = individualPayments.map(payment => ({
        _id: payment._id,
        orderId: payment.orderId,
        amount: payment.amount,
        formattedAmount: payment.formattedAmount,
        currency: payment.currency,
        method: payment.method,
        status: payment.status,
        statusLabel: payment.status === 'pending' ? 'Pendiente' : 
                    payment.status === 'processing' ? 'Procesando' :
                    payment.status === 'completed' ? 'Completado' :
                    payment.status === 'failed' ? 'Fallido' :
                    payment.status === 'cancelled' ? 'Cancelado' : payment.status,
        timing: payment.timing,
        paymentType: payment.paymentType,
        percentage: payment.percentage,
        createdAt: payment.createdAt,
        processedAt: payment.processedAt,
        completedAt: payment.completedAt,
        isExpired: payment.isExpired,
        canBeProcessed: payment.canBeProcessed(),
        canBeCompleted: payment.canBeCompleted(),
        providerInfo: payment.toPublicObject().providerInfo
      }));
    } catch (paymentError) {
      console.error('❌ Error obteniendo pagos individuales:', paymentError);
      paymentDetails.payments = [];
    }

    // Si es admin, agregar información adicional
    if (isAdmin) {
      paymentDetails.payment.metadata = order.payment?.metadata;
      paymentDetails.payment.primaryPaymentId = order.payment?.primaryPaymentId;
      paymentDetails.user = {
        name: order.user.name,
        email: order.user.email,
        phoneNumber: order.user.phoneNumber
      };
      // ✅ INFORMACIÓN ADICIONAL PARA ADMIN
      paymentDetails.adminInfo = {
        canChangeStatus: orderController.canChangeStatus(order.status),
        recommendedActions: orderController.getRecommendedActions(order.status, order.payment?.status)
      };
    }

    res.status(200).json({
      success: true,
      data: paymentDetails
    });

  } catch (error) {
    console.error("❌ Error en getOrderPaymentDetails:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al obtener detalles de pago",
      error: error.code || 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtener línea de tiempo de una orden (para usuarios)
 */
orderController.getOrderTimeline = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.role && ['admin', 'manager'].includes(req.user.role);

    // Validar ID de la orden
    const orderIdValidation = validators.mongoId(id, 'ID de pedido');
    if (!orderIdValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "ID de pedido inválido",
        error: orderIdValidation.error
      });
    }

    // Buscar orden
    const query = { _id: orderIdValidation.cleaned };
    if (!isAdmin) {
      query.user = userId;
    }

    const order = await Order.findOne(query)
      .populate('productionPhotos.uploadedBy', 'name')
      .select('orderNumber status statusHistory productionPhotos createdAt quotedAt approvedAt actualReadyDate deliveredAt completedAt');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }

    // Construir línea de tiempo
    const timeline = [];

    // Evento: Pedido creado
    timeline.push({
      event: 'order_created',
      title: 'Pedido Creado',
      description: 'Tu pedido ha sido recibido y está siendo revisado',
      timestamp: order.createdAt,
      status: 'completed',
      icon: '📝',
      changedBy: 'Sistema'
    });

    // Evento: Cotizado
    if (order.quotedAt) {
      timeline.push({
        event: 'quoted',
        title: 'Pedido Cotizado',
        description: 'Tu pedido ha sido cotizado y está esperando confirmación',
        timestamp: order.quotedAt,
        status: 'completed',
        icon: '💰',
        changedBy: 'Sistema'
      });
    }

    // Evento: Aprobado
    if (order.approvedAt) {
      timeline.push({
        event: 'approved',
        title: 'Pedido Aprobado',
        description: 'Tu pedido ha sido aprobado y entrará en producción',
        timestamp: order.approvedAt,
        status: 'completed',
        icon: '✅',
        changedBy: 'Sistema'
      });
    }

    // Evento: En Producción
    if (order.status === 'in_production' || order.status === 'quality_check' || order.status === 'quality_approved' || order.status === 'packaging') {
      timeline.push({
        event: 'in_production',
        title: 'En Producción',
        description: 'Tu pedido está siendo fabricado',
        timestamp: order.approvedAt || order.createdAt,
        status: 'completed',
        icon: '🏭',
        changedBy: 'Sistema'
      });
    }

    // Evento: Control de Calidad
    if (order.status === 'quality_check' || order.status === 'quality_approved' || order.status === 'packaging') {
      timeline.push({
        event: 'quality_check',
        title: 'Control de Calidad',
        description: 'Tu pedido está en etapa de control de calidad',
        timestamp: order.approvedAt || order.createdAt,
        status: order.status === 'quality_approved' ? 'completed' : 'current',
        icon: '🔍',
        changedBy: 'Sistema'
      });
    }

    // Evento: Calidad Aprobada
    if (order.status === 'quality_approved' || order.status === 'packaging') {
      timeline.push({
        event: 'quality_approved',
        title: 'Calidad Aprobada',
        description: 'La calidad de tu pedido ha sido aprobada',
        timestamp: order.approvedAt || order.createdAt,
        status: 'completed',
        icon: '✅',
        changedBy: 'Sistema'
      });
    }

    // Eventos de producción (basados en fotos)
    const productionStages = {
      'cutting': { title: 'Corte', icon: '✂️' },
      'printing': { title: 'Impresión', icon: '🖨️' },
      'pressing': { title: 'Prensado', icon: '🔥' },
      'quality_check': { title: 'Control de Calidad', icon: '🔍' },
      'packaging': { title: 'Empacado', icon: '📦' }
    };

    // Agrupar fotos por etapa
    const photosByStage = order.productionPhotos.reduce((acc, photo) => {
      if (!acc[photo.stage]) acc[photo.stage] = [];
      acc[photo.stage].push(photo);
      return acc;
    }, {});

    // Agregar eventos de producción
    Object.entries(productionStages).forEach(([stage, config]) => {
      const stagePhotos = photosByStage[stage] || [];
      if (stagePhotos.length > 0) {
        const latestPhoto = stagePhotos[stagePhotos.length - 1];
        timeline.push({
          event: `production_${stage}`,
          title: config.title,
          description: `Etapa de ${config.title.toLowerCase()} completada`,
          timestamp: latestPhoto.uploadedAt,
          status: 'completed',
          icon: config.icon,
          changedBy: 'Sistema',
          photos: stagePhotos.map(photo => ({
            url: photo.photoUrl,
            notes: photo.notes,
            uploadedAt: photo.uploadedAt
          }))
        });
      }
    });

    // Evento: Listo para entrega
    if (order.actualReadyDate) {
      timeline.push({
        event: 'ready_for_delivery',
        title: 'Listo para Entrega',
        description: 'Tu pedido está listo y será enviado pronto',
        timestamp: order.actualReadyDate,
        status: 'completed',
        icon: '🚚',
        changedBy: 'Sistema'
      });
    }

    // Evento: Entregado
    if (order.deliveredAt) {
      timeline.push({
        event: 'delivered',
        title: 'Entregado',
        description: 'Tu pedido ha sido entregado exitosamente',
        timestamp: order.deliveredAt,
        status: 'completed',
        icon: '✅',
        changedBy: 'Sistema'
      });
    }

    // Evento: Completado
    if (order.completedAt) {
      timeline.push({
        event: 'completed',
        title: 'Pedido Completado',
        description: 'Tu pedido ha sido completado. ¡Gracias por tu compra!',
        timestamp: order.completedAt,
        status: 'completed',
        icon: '🎉',
        changedBy: 'Sistema'
      });
    }

    // Procesar eventos del statusHistory
    if (order.statusHistory && order.statusHistory.length > 0) {
      order.statusHistory.forEach((historyItem, index) => {
        // Validar que el statusHistory tenga timestamp
        if (!historyItem.timestamp) {
          console.log('⚠️ [Timeline] StatusHistory item sin timestamp:', historyItem);
          return;
        }

        let changedByName = 'Sistema';
        if (historyItem.changedBy && typeof historyItem.changedBy === 'object') {
          changedByName = historyItem.changedBy.name || 'Usuario';
        } else if (historyItem.changedByModel === 'User' || historyItem.changedByModel === 'Employee') {
          changedByName = 'Usuario';
        }

        // Mapear estados a nombres más legibles
        const statusMap = {
          'pending': 'Pendiente',
          'pending_approval': 'Pendiente de Aprobación',
          'approved': 'Aprobado',
          'in_production': 'En Producción',
          'quality_check': 'Control de Calidad',
          'quality_approved': 'Calidad Aprobada',
          'packaging': 'Empacado',
          'out_for_delivery': 'En Camino',
          'delivered': 'Entregado',
          'completed': 'Completado',
          'cancelled': 'Cancelado',
          'returned': 'Devuelto',
          'refunded': 'Reembolsado'
        };

        // Determinar el estado basado en el contexto del historyItem
        let currentStatus = order.status; // Estado actual por defecto
        if (historyItem.previousStatus) {
          // Si hay previousStatus, el estado actual es el que se cambió
          currentStatus = order.status;
        }

        const statusName = statusMap[currentStatus] || currentStatus;
        const eventTitle = historyItem.previousStatus 
          ? `Cambio de Estado: ${statusMap[historyItem.previousStatus] || historyItem.previousStatus} → ${statusName}`
          : `Estado: ${statusName}`;

        timeline.push({
          event: `status_change_${index}`,
          title: eventTitle,
          description: historyItem.notes || `Estado actualizado a ${statusName}`,
          timestamp: historyItem.timestamp,
          status: 'completed',
          icon: '🔄',
          changedBy: changedByName,
          originalStatus: currentStatus,
          previousStatus: historyItem.previousStatus
        });
      });
    }

    // Ordenar por fecha
    timeline.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    // Marcar el evento actual
    const currentStatusIndex = timeline.findIndex(event => 
      event.event.includes(order.status) || 
      (order.status === 'in_production' && event.event.startsWith('production_'))
    );

    if (currentStatusIndex !== -1) {
      timeline[currentStatusIndex].status = 'current';
    }

    // Debug: Log del timeline generado
    console.log('📊 [Timeline] Timeline generado:', {
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      totalEvents: timeline.length,
      timelineEvents: timeline.map(e => ({
        event: e.event,
        title: e.title,
        status: e.status,
        timestamp: e.timestamp
      }))
    });

    res.status(200).json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        currentStatus: order.status,
        timeline,
        totalEvents: timeline.length,
        completedEvents: timeline.filter(e => e.status === 'completed').length
      }
    });

  } catch (error) {
    console.error("❌ Error en getOrderTimeline:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al obtener línea de tiempo",
      error: error.code || 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtener datos de control de calidad de una orden
 */
orderController.getQualityControlData = async (req, res) => {
  try {
    const { id: orderId } = req.params;

    // Validar ID de orden
    if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "ID de orden inválido"
      });
    }

    // Buscar orden con datos de control de calidad
    const order = await Order.findById(orderId)
      .populate('user', 'name email phoneNumber phone')
      .select('orderNumber status statusHistory productionPhotos createdAt user');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada"
      });
    }

    // Procesar datos de control de calidad
    const qualityControlData = {
      orderId: order._id,
      orderNumber: order.orderNumber,
      currentStatus: order.status,
      lastUpdate: order.updatedAt,
      client: {
        name: order.user?.name || 'N/A',
        email: order.user?.email || 'N/A',
        phone: order.user?.phoneNumber || order.user?.phone || 'N/A'
      },
      stats: {
        totalAttempts: 0,
        approvedCount: 0,
        rejectedCount: 0,
        pendingCount: 0
      },
      attempts: []
    };

    // Procesar intentos de control de calidad desde statusHistory
    if (order.statusHistory && order.statusHistory.length > 0) {
      const qualityAttempts = order.statusHistory.filter(item => 
        item.notes && (
          item.notes.includes('control de calidad') || 
          item.notes.includes('Foto de control') ||
          item.notes.includes('Calidad aprobada') ||
          item.notes.includes('Calidad rechazada')
        )
      );

      qualityControlData.attempts = qualityAttempts.map((attempt, index) => {
        let status = 'pending';
        let clientResponse = null;

        // Determinar estado basado en las notas
        if (attempt.notes.includes('Calidad aprobada')) {
          status = 'approved';
        } else if (attempt.notes.includes('Calidad rechazada')) {
          status = 'rejected';
        } else if (attempt.notes.includes('Foto de control')) {
          status = 'sent';
        }

        // Buscar respuesta del cliente en el historial
        const clientResponseItem = order.statusHistory.find(item => 
          item.timestamp > attempt.timestamp && 
          item.notes && (
            item.notes.includes('Calidad aprobada por el cliente') ||
            item.notes.includes('Calidad rechazada por el cliente')
          )
        );

        if (clientResponseItem) {
          clientResponse = {
            approved: clientResponseItem.notes.includes('aprobada'),
            notes: clientResponseItem.notes,
            responseDate: clientResponseItem.timestamp
          };
        }

        return {
          attemptNumber: index + 1,
          status: status,
          notes: attempt.notes,
          timestamp: attempt.timestamp,
          changedBy: attempt.changedBy,
          clientResponse: clientResponse
        };
      });

      // Calcular estadísticas
      qualityControlData.stats.totalAttempts = qualityControlData.attempts.length;
      qualityControlData.stats.approvedCount = qualityControlData.attempts.filter(a => a.status === 'approved').length;
      qualityControlData.stats.rejectedCount = qualityControlData.attempts.filter(a => a.status === 'rejected').length;
      qualityControlData.stats.pendingCount = qualityControlData.attempts.filter(a => a.status === 'pending' || a.status === 'sent').length;
    }

    console.log('📊 [QualityControl] Datos generados:', {
      orderNumber: order.orderNumber,
      totalAttempts: qualityControlData.stats.totalAttempts,
      currentStatus: qualityControlData.currentStatus
    });

    res.status(200).json({
      success: true,
      data: qualityControlData
    });

  } catch (error) {
    console.error("❌ Error en getQualityControlData:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

// Exportar el controlador con métodos validados
/**
 * Cambiar estado de una orden con validaciones
 */
orderController.changeOrderStatus = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { newStatus, reason, skipValidation = false } = req.body;
    const adminId = req.user._id;

    // Validar ID de orden
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "ID de orden inválido",
        error: 'INVALID_ORDER_ID'
      });
    }

    // Buscar la orden
    const order = await Order.findById(orderId).populate('user', 'name email phoneNumber');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
        error: 'ORDER_NOT_FOUND'
      });
    }

    // Estados válidos
    const validStatuses = [
      'pending_approval', 'quoted', 'approved', 'in_production', 
      'quality_check', 'quality_approved', 'packaging', 
      'ready_for_delivery', 'out_for_delivery', 'delivered', 
      'completed', 'cancelled', 'on_hold', 'returned', 'refunded'
    ];

    if (!validStatuses.includes(newStatus)) {
      return res.status(400).json({
        success: false,
        message: "Estado inválido",
        error: 'INVALID_STATUS'
      });
    }

    // No permitir cambiar al mismo estado
    if (order.status === newStatus) {
      return res.status(400).json({
        success: false,
        message: "La orden ya está en ese estado",
        error: 'SAME_STATUS'
      });
    }

    // Validaciones de flujo de negocio
    if (!skipValidation) {
      const validationResult = await validateStatusChange(order, newStatus);
      if (!validationResult.isValid) {
        return res.status(400).json({
          success: false,
          message: validationResult.message,
          error: 'STATUS_CHANGE_VALIDATION_FAILED',
          warnings: validationResult.warnings
        });
      }
    }

    // Actualizar estado
    const previousStatus = order.status;
    order.status = newStatus;
    
    // Agregar al historial
    order.statusHistory.push({
      status: newStatus,
      changedAt: new Date(),
      changedBy: adminId,
      reason: reason || 'Cambio de estado por administrador',
      previousStatus: previousStatus
    });

    await order.save();

    // Notificar al cliente si es necesario
    if (shouldNotifyCustomer(previousStatus, newStatus)) {
      await notificationService.sendStatusUpdateNotification({
        orderNumber: order.orderNumber,
        newStatus: newStatus,
        previousStatus: previousStatus,
        userEmail: order.user.email,
        userName: order.user.name,
        userPhone: order.user.phoneNumber,
        order: order
      });
    }

    res.status(200).json({
      success: true,
      message: `Estado cambiado de ${previousStatus} a ${newStatus}`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        previousStatus,
        newStatus,
        changedAt: new Date(),
        changedBy: adminId
      }
    });

  } catch (error) {
    console.error("❌ Error en changeOrderStatus:", error);
    res.status(500).json({
      success: false,
      message: "Error cambiando estado de orden",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Registrar pago en efectivo
 */
orderController.registerCashPayment = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { amountReceived, changeGiven, notes } = req.body;
    const adminId = req.user._id;

    // Validar ID de orden
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "ID de orden inválido",
        error: 'INVALID_ORDER_ID'
      });
    }

    // Buscar la orden
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
        error: 'ORDER_NOT_FOUND'
      });
    }

    // Validar que sea pago en efectivo
    if (order.payment.method !== 'cash') {
      return res.status(400).json({
        success: false,
        message: "Esta orden no es de pago en efectivo",
        error: 'NOT_CASH_PAYMENT'
      });
    }

    // Validar montos
    if (amountReceived < order.total) {
      return res.status(400).json({
        success: false,
        message: "El monto recibido es menor al total de la orden",
        error: 'INSUFFICIENT_PAYMENT'
      });
    }

    // Registrar pago en efectivo
    order.payment.cashPayment = {
      received: true,
      receivedAt: new Date(),
      receivedBy: adminId,
      amountReceived: amountReceived,
      changeGiven: changeGiven || 0,
      notes: notes || ''
    };

    // Actualizar estado de pago
    order.payment.status = 'completed';
    order.payment.totalPaid = order.total;
    order.payment.balance = 0;
    order.payment.lastPaidAt = new Date();

    await order.save();

    res.status(200).json({
      success: true,
      message: "Pago en efectivo registrado exitosamente",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        amountReceived,
        changeGiven,
        total: order.total,
        receivedAt: new Date()
      }
    });

  } catch (error) {
    console.error("❌ Error en registerCashPayment:", error);
    res.status(500).json({
      success: false,
      message: "Error registrando pago en efectivo",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

/**
 * Registrar devolución
 */
orderController.registerReturn = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { returnReason, returnDescription, refundAmount, refundMethod } = req.body;
    const adminId = req.user._id;

    // Validar ID de orden
    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({
        success: false,
        message: "ID de orden inválido",
        error: 'INVALID_ORDER_ID'
      });
    }

    // Buscar la orden
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
        error: 'ORDER_NOT_FOUND'
      });
    }

    // Registrar devolución
    order.payment.returnInfo = {
      isReturned: true,
      returnedAt: new Date(),
      returnedBy: adminId,
      returnReason,
      returnDescription,
      refundAmount: refundAmount || order.total,
      refundMethod,
      refundedAt: new Date(),
      refundedBy: adminId
    };

    // Cambiar estado a devuelto
    order.status = 'returned';
    order.statusHistory.push({
      status: 'returned',
      changedAt: new Date(),
      changedBy: adminId,
      reason: `Devolución registrada: ${returnDescription}`,
      previousStatus: order.status
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: "Devolución registrada exitosamente",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        returnReason,
        refundAmount,
        refundMethod,
        returnedAt: new Date()
      }
    });

  } catch (error) {
    console.error("❌ Error en registerReturn:", error);
    res.status(500).json({
      success: false,
      message: "Error registrando devolución",
      error: process.env.NODE_ENV === 'development' ? error.message : 'INTERNAL_ERROR'
    });
  }
};

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Validar cambio de estado
 */
async function validateStatusChange(order, newStatus) {
  const warnings = [];
  
  // ==================== VALIDACIONES DE PAGO FLEXIBLES ====================
  
  // Estados que requieren pago completo (solo para métodos que no sean efectivo)
  const paymentRequiredStates = ['in_production', 'quality_check', 'packaging'];
  
  // Estados que permiten cambio sin pago completo
  const flexiblePaymentStates = ['ready_for_delivery', 'out_for_delivery'];
  
  console.log('🔍 [validateStatusChange] Validando pagos:', {
    newStatus,
    paymentMethod: order.payment.method,
    paymentStatus: order.payment.status,
    orderStatus: order.status
  });
  
  // ✅ VALIDACIÓN FLEXIBLE POR MÉTODO DE PAGO
  if (order.payment.method === 'cash') {
    // Para pagos en efectivo: MÁXIMA FLEXIBILIDAD
    // Solo validar pago para estados de entrega final (delivered)
    const cashPaymentRequiredStates = ['delivered'];
    
    if (cashPaymentRequiredStates.includes(newStatus) && order.payment.status !== 'completed') {
      console.log('❌ [validateStatusChange] Pago en efectivo requerido para entrega final');
      return {
        isValid: false,
        message: "Para pagos en efectivo, el pago se registra al momento de la entrega final",
        warnings: []
      };
    }
    
    console.log('✅ [validateStatusChange] Pago en efectivo - cambio permitido:', newStatus);
    
  } else if (order.payment.method === 'bank_transfer') {
    // Para transferencias bancarias: FLEXIBILIDAD MEDIA
    // Permitir cambio a ready_for_delivery y out_for_delivery sin pago completo
    const bankTransferRequiredStates = ['delivered'];
    
    if (bankTransferRequiredStates.includes(newStatus) && order.payment.status !== 'completed') {
      console.log('❌ [validateStatusChange] Transferencia bancaria requerida para entrega final');
      return {
        isValid: false,
        message: "Para transferencias bancarias, el pago debe estar confirmado antes de marcar como entregado",
        warnings: []
      };
    }
    
    console.log('✅ [validateStatusChange] Transferencia bancaria - cambio permitido:', newStatus);
    
  } else if (order.payment.method === 'wompi') {
    // Para Wompi: VALIDACIÓN ESTRICTA
    // Requerir pago completo para estados de producción
    if (paymentRequiredStates.includes(newStatus) && order.payment.status !== 'completed') {
      console.log('❌ [validateStatusChange] Pago Wompi requerido para producción');
      return {
        isValid: false,
        message: "Para pagos con tarjeta (Wompi), el pago debe estar completado antes de iniciar producción",
        warnings: []
      };
    }
    
    console.log('✅ [validateStatusChange] Pago Wompi - cambio permitido:', newStatus);
    
  } else {
    // Para otros métodos o sin método definido: VALIDACIÓN BÁSICA
    if (paymentRequiredStates.includes(newStatus) && order.payment.status !== 'completed') {
      console.log('❌ [validateStatusChange] Pago requerido para producción');
      return {
        isValid: false,
        message: "El pago debe estar completado antes de iniciar la producción",
        warnings: []
      };
    }
    
    console.log('✅ [validateStatusChange] Método de pago - cambio permitido:', newStatus);
  }

  // Validar saltos de etapas
  const statusOrder = [
    'pending_approval', 'quoted', 'approved', 'in_production', 
    'quality_check', 'quality_approved', 'packaging', 
    'ready_for_delivery', 'out_for_delivery', 'delivered', 'completed'
  ];
  
  const currentIndex = statusOrder.indexOf(order.status);
  const newIndex = statusOrder.indexOf(newStatus);
  
  if (newIndex > currentIndex + 1) {
    warnings.push("Estás saltando etapas del proceso. ¿Estás seguro?");
  }

  // Validar control de calidad
  if (newStatus === 'packaging' && order.status !== 'quality_approved') {
    warnings.push("¿Estás seguro de saltar el control de calidad?");
  }

  return {
    isValid: true,
    warnings
  };
}

/**
 * Determinar si se debe notificar al cliente
 */
function shouldNotifyCustomer(previousStatus, newStatus) {
  const notificationStates = ['approved', 'in_production', 'quality_check', 'quality_approved', 'packaging', 'ready_for_delivery', 'out_for_delivery', 'delivered', 'completed'];
  return notificationStates.includes(newStatus);
}

/**
 * Subir foto de producción y enviar correo de aprobación
 */
orderController.uploadProductionPhoto = async (req, res) => {
  try {
    const { id: orderId } = req.params;
    const { stage, notes } = req.body;
    const photo = req.file;

    // Validar ID de orden
    if (!orderId || !orderId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "ID de orden inválido"
      });
    }

    // Validar que se subió una foto
    if (!photo) {
      return res.status(400).json({
        success: false,
        message: "Foto requerida"
      });
    }

    // Validar notas
    if (!notes || notes.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Notas del control de calidad requeridas"
      });
    }

    // Buscar la orden
    const order = await Order.findById(orderId)
      .populate('user', 'name email phoneNumber');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada"
      });
    }

    // Verificar que esté en control de calidad
    if (order.status !== 'quality_check') {
      return res.status(400).json({
        success: false,
        message: "La orden debe estar en etapa de control de calidad"
      });
    }

    // Crear URL de la foto
    const photoUrl = `${process.env.BASE_URL || 'http://localhost:4000'}/uploads/${photo.filename}`;
    
    console.log('📸 [OrderController] Foto subida:', {
      filename: photo.filename,
      path: photo.path,
      size: photo.size,
      photoUrl: photoUrl,
      orderId: orderId,
      stage: stage,
      notes: notes
    });
    
    // Verificar que el archivo existe
    const fs = await import('fs');
    if (fs.existsSync(photo.path)) {
      console.log('✅ [OrderController] Archivo existe en:', photo.path);
    } else {
      console.log('❌ [OrderController] Archivo NO existe en:', photo.path);
    }

    // Agregar foto al historial de la orden
    order.statusHistory.push({
      status: 'quality_check',
      timestamp: new Date(),
      notes: `Foto de control de calidad subida: ${notes}`,
      updatedBy: req.user?._id || 'admin',
      photoUrl: photoUrl,
      adminNotes: notes
    });

    await order.save();

    // Enviar correo de aprobación de calidad
    const emailResult = await qualityApprovalService.sendQualityApprovalEmail(
      order, 
      photoUrl, 
      notes
    );

    if (emailResult.success) {
      console.log('✅ [OrderController] Foto subida y correo enviado para orden:', order.orderNumber);
    } else {
      console.log('⚠️ [OrderController] Foto subida pero correo no enviado:', emailResult.error);
    }

    res.json({
      success: true,
      message: "Foto subida exitosamente y correo de aprobación enviado",
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        photoUrl: photoUrl,
        emailSent: emailResult.success,
        emailError: emailResult.error || null
      }
    });

  } catch (error) {
    console.error('❌ [OrderController] Error subiendo foto de producción:', error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
};

// ==================== MÉTODOS AUXILIARES ====================

/**
 * Obtener etiqueta de estado legible
 */
orderController.getStatusLabel = (status) => {
  const statusLabels = {
    'pending_approval': 'Pendiente de Aprobación',
    'approved': 'Aprobado',
    'quoted': 'Cotizado',
    'in_production': 'En Producción',
    'quality_check': 'Control de Calidad',
    'quality_approved': 'Calidad Aprobada',
    'packaging': 'Empaquetando',
    'out_for_delivery': 'En Camino',
    'completed': 'Completado',
    'cancelled': 'Cancelado',
    'returned': 'Devuelto',
    'refunded': 'Reembolsado'
  };
  return statusLabels[status] || status;
};

/**
 * Verificar si se puede cambiar el estado de una orden
 */
orderController.canChangeStatus = (currentStatus) => {
  const allowedChanges = {
    'pending_approval': ['approved', 'cancelled'],
    'approved': ['in_production', 'cancelled'],
    'quoted': ['approved', 'cancelled'],
    'in_production': ['quality_check', 'cancelled'],
    'quality_check': ['quality_approved', 'in_production'],
    'quality_approved': ['packaging'],
    'packaging': ['out_for_delivery'],
    'out_for_delivery': ['completed', 'returned'],
    'completed': ['returned'],
    'returned': ['refunded'],
    'cancelled': [],
    'refunded': []
  };
  
  return allowedChanges[currentStatus] || [];
};

/**
 * Obtener acciones recomendadas para el admin
 */
orderController.getRecommendedActions = (orderStatus, paymentStatus) => {
  const actions = [];
  
  // Acciones basadas en estado de la orden
  switch (orderStatus) {
    case 'pending_approval':
      actions.push('Revisar y aprobar la orden');
      break;
    case 'approved':
      actions.push('Iniciar producción');
      break;
    case 'in_production':
      actions.push('Completar producción y enviar a control de calidad');
      break;
    case 'quality_check':
      actions.push('Revisar fotos de producción y aprobar calidad');
      break;
    case 'quality_approved':
      actions.push('Empaquetar y preparar para envío');
      break;
    case 'packaging':
      actions.push('Marcar como enviado');
      break;
    case 'out_for_delivery':
      actions.push('Registrar pago en efectivo si aplica');
      actions.push('Confirmar entrega');
      break;
  }
  
  // Acciones basadas en estado de pago
  if (paymentStatus === 'pending' && ['pending_approval', 'approved', 'quoted'].includes(orderStatus)) {
    actions.push('Procesar pago pendiente');
  }
  
  return actions;
};

export default orderController;