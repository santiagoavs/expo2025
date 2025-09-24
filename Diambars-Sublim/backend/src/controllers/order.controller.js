// controllers/order.controller.js - ACTUALIZADO para nueva arquitectura de pagos
import Order from "../models/order.js";
import Design from "../models/design.js";
import Address from "../models/address.js";
import mongoose from "mongoose";
import { orderService } from "../services/order.service.js";
import { paymentProcessor } from "../services/payment/PaymentProcessor.js";
import { validators } from "../utils/validators.utils.js";
import { notificationService } from "../services/email/notification.service.js";

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

    // Usar datos limpios de la validación
    const orderData = {
      ...orderValidation.cleaned,
      userId: req.user._id,
      isManualOrder: req.body.isManualOrder || false
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
        order: newOrder.toSafeObject(),
        _links: {
          order: `/api/orders/${newOrder._id}`,
          tracking: `/api/orders/${newOrder._id}/tracking`
        }
      }
    });

  } catch (error) {
    await session.abortTransaction();
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
      .populate('user', 'name email phone')
      .populate('items.product', 'name images category description')
      .populate('items.design', 'name previewImage elements customizationAreas');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Orden no encontrada",
        error: 'ORDER_NOT_FOUND'
      });
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

// Exportar el controlador con métodos validados
export default orderController;