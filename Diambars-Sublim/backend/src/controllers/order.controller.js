// controllers/order.controller.js - REFACTORIZADO con Validators
import Order from "../models/order.js";
import Design from "../models/design.js";
import Address from "../models/address.js";
import mongoose from "mongoose";
import { orderService } from "../services/order.service.js";
import { paymentService } from "../services/unifiedPayment.service.js";
import { validators } from "../utils/validators.utils.js";
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
 * Registrar pago en efectivo
 */
orderController.registerCashPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const paymentData = req.body;
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

    // Obtener el total del pedido para validación
    const order = await Order.findById(orderIdValidation.cleaned);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pedido no encontrado",
        error: 'ORDER_NOT_FOUND'
      });
    }

    // Validar datos de pago en efectivo
    const cashPaymentValidation = validators.cashPayment(paymentData, order.totalPrice);
    if (!cashPaymentValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: "Datos de pago inválidos",
        error: cashPaymentValidation.error
      });
    }

    const result = await paymentService.registerCashPayment(
      orderIdValidation.cleaned, 
      adminId, 
      cashPaymentValidation.cleaned
    );

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

// Exportar el controlador con métodos validados
export default orderController;