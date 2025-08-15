// controllers/order.controller.js - REFACTORIZADO (Sin cálculos automáticos)
import Order from "../models/order.js";
import Design from "../models/design.js";
import Address from "../models/address.js";
import mongoose from "mongoose";
import { orderService } from "../services/order.service.js";
import { paymentService } from "../services/payment.service.js";
import { notificationService } from "../services/notification.service.js";

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

    const orderData = await orderService.validateOrderData(req.body, req.user._id);
    
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
 * Obtener pedido por ID (cliente o admin)
 */
orderController.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.roles?.some(role => ['admin', 'manager'].includes(role));

    const order = await orderService.getOrderById(id, userId, isAdmin);

    res.status(200).json({
      success: true,
      data: { 
        order: order.toDetailedObject(),
        _links: {
          tracking: `/api/orders/${order._id}/tracking`,
          payment: order.payment.wompiData?.paymentUrl || null
        }
      }
    });

  } catch (error) {
    console.error("❌ Error en getOrderById:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al obtener el pedido",
      error: error.code || 'INTERNAL_ERROR'
    });
  }
};

/**
 * Obtener tracking detallado tipo Temu
 */
orderController.getOrderTracking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const isAdmin = req.user.roles?.some(role => ['admin', 'manager'].includes(role));

    const tracking = await orderService.getOrderTracking(id, userId, isAdmin);

    res.status(200).json({
      success: true,
      data: { tracking }
    });

  } catch (error) {
    console.error("❌ Error en getOrderTracking:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al obtener tracking",
      error: error.code || 'INTERNAL_ERROR'
    });
  }
};

// ==================== MÉTODOS SOLO CLIENTE ====================

/**
 * Obtener mis pedidos
 */
orderController.getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10, status } = req.query;

    const result = await orderService.getUserOrders(userId, { page, limit, status });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("❌ Error en getMyOrders:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener tus pedidos",
      error: 'INTERNAL_ERROR'
    });
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

    const result = await orderService.respondToQuote(id, userId, accept, clientNotes);

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
 * Aprobar foto de control de calidad
 */
orderController.approveProductPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { photoId, approved, changeRequested, clientNotes } = req.body;
    const userId = req.user._id;

    const result = await orderService.approveProductPhoto(
      id, userId, photoId, approved, changeRequested, clientNotes
    );

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });

  } catch (error) {
    console.error("❌ Error en approveProductPhoto:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al procesar aprobación",
      error: error.code || 'INTERNAL_ERROR'
    });
  }
};

/**
 * Cancelar pedido
 */
orderController.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user._id;
    const isAdmin = req.user.roles?.some(role => ['admin', 'manager'].includes(role));

    const result = await orderService.cancelOrder(id, userId, isAdmin, reason);

    res.status(200).json({
      success: true,
      message: "Pedido cancelado exitosamente",
      data: result
    });

  } catch (error) {
    console.error("❌ Error en cancelOrder:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al cancelar pedido",
      error: error.code || 'INTERNAL_ERROR'
    });
  }
};

// ==================== MÉTODOS SOLO ADMIN ====================

/**
 * Obtener todas las solicitudes de pedidos
 */
orderController.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, user, search, startDate, endDate } = req.query;

    const result = await orderService.getAllOrders({
      page, limit, status, user, search, startDate, endDate
    });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("❌ Error en getAllOrders:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener pedidos",
      error: 'INTERNAL_ERROR'
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

    // Validar precios manuales
    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "Debe proporcionar un precio total válido",
        error: 'INVALID_PRICE'
      });
    }

    const result = await orderService.submitManualQuote(
      id, adminId, totalPrice, deliveryFee || 0, tax || 0, notes
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
 * Actualizar estado del pedido
 */
orderController.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const adminId = req.user._id;

    const result = await orderService.updateOrderStatus(id, adminId, status, notes);

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
 * Actualizar etapas de producción
 */
orderController.updateProductionStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { productionStage, notes, photoUrl, estimatedCompletion } = req.body;
    const adminId = req.user._id;

    const result = await orderService.updateProductionStage(
      id, adminId, productionStage, notes, photoUrl, estimatedCompletion
    );

    res.status(200).json({
      success: true,
      message: `Etapa "${productionStage}" completada`,
      data: result
    });

  } catch (error) {
    console.error("❌ Error en updateProductionStage:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al actualizar producción",
      error: error.code || 'INTERNAL_ERROR'
    });
  }
};

/**
 * Subir foto de control de calidad
 */
orderController.uploadProductionPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, photoUrl, notes } = req.body;
    const adminId = req.user._id;

    const result = await orderService.uploadProductionPhoto(
      id, adminId, stage, photoUrl, notes
    );

    res.status(200).json({
      success: true,
      message: "Foto subida exitosamente",
      data: result
    });

  } catch (error) {
    console.error("❌ Error en uploadProductionPhoto:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al subir foto",
      error: error.code || 'INTERNAL_ERROR'
    });
  }
};

/**
 * Registrar pago en efectivo
 */
orderController.registerCashPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;
    const adminId = req.user._id;

    const result = await paymentService.registerCashPayment(id, adminId, paymentData);

    res.status(200).json({
      success: true,
      message: "Pago en efectivo registrado",
      data: result
    });

  } catch (error) {
    console.error("❌ Error en registerCashPayment:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al registrar pago",
      error: error.code || 'INTERNAL_ERROR'
    });
  }
};

/**
 * Finalizar pedido presencial
 */
orderController.finalizeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { deliveryNotes, customerSatisfaction } = req.body;
    const adminId = req.user._id;

    const result = await orderService.finalizeOrder(id, adminId, {
      deliveryNotes,
      customerSatisfaction
    });

    res.status(200).json({
      success: true,
      message: "Pedido finalizado exitosamente",
      data: result
    });

  } catch (error) {
    console.error("❌ Error en finalizeOrder:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al finalizar pedido",
      error: error.code || 'INTERNAL_ERROR'
    });
  }
};

export default orderController;