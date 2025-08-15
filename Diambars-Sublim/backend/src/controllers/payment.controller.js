// controllers/payment.controller.js - Manejo de PaymentMethod + Efectivo + Webhooks
import { paymentService } from "../services/payment.service.js";
import { 
  processWompiPayment, 
  validateWompiWebhook, 
  simulatePaymentConfirmation,
  isWompiConfigured 
} from "../services/wompi.service.js";

const paymentController = {};

// ==================== MÉTODOS DE PAGO DIGITALES ====================

/**
 * Procesar pago con Wompi
 */
paymentController.processWompiPayment = async (req, res) => {
  try {
    const { orderId, paymentMethodId, customerData } = req.body;
    const userId = req.user._id;

    const result = await paymentService.processDigitalPayment({
      orderId,
      paymentMethodId,
      customerData,
      userId,
      method: 'wompi'
    });

    res.status(200).json({
      success: true,
      message: "Link de pago generado",
      data: result
    });

  } catch (error) {
    console.error("❌ Error en processWompiPayment:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al procesar pago",
      error: error.code || 'PAYMENT_ERROR'
    });
  }
};

/**
 * Simular pago para desarrollo/testing
 */
paymentController.simulatePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status = 'approved' } = req.body;

    // Solo permitir en desarrollo o cuando Wompi no esté configurado
    if (process.env.NODE_ENV === 'production' && isWompiConfigured()) {
      return res.status(403).json({
        success: false,
        message: "Simulación no disponible en producción con Wompi configurado",
        error: 'SIMULATION_NOT_ALLOWED'
      });
    }

    const result = await paymentService.simulatePayment(orderId, status);

    res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });

  } catch (error) {
    console.error("❌ Error en simulatePayment:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al simular pago",
      error: error.code || 'SIMULATION_ERROR'
    });
  }
};

/**
 * Confirmar pago manual (admin)
 */
paymentController.confirmManualPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { method, amount, receiptNumber, notes } = req.body;
    const adminId = req.user._id;

    const result = await paymentService.confirmManualPayment({
      orderId,
      method,
      amount,
      receiptNumber,
      notes,
      adminId
    });

    res.status(200).json({
      success: true,
      message: "Pago confirmado exitosamente",
      data: result
    });

  } catch (error) {
    console.error("❌ Error en confirmManualPayment:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al confirmar pago",
      error: error.code || 'PAYMENT_CONFIRMATION_ERROR'
    });
  }
};

// ==================== PAGOS EN EFECTIVO ====================

/**
 * Registrar pago en efectivo (entrega presencial)
 */
paymentController.registerCashPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const cashData = req.body;
    const adminId = req.user._id;

    const result = await paymentService.registerCashPayment(orderId, adminId, cashData);

    res.status(200).json({
      success: true,
      message: "Pago en efectivo registrado",
      data: result
    });

  } catch (error) {
    console.error("❌ Error en registerCashPayment:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al registrar pago en efectivo",
      error: error.code || 'CASH_PAYMENT_ERROR'
    });
  }
};

/**
 * Obtener historial de pagos en efectivo
 */
paymentController.getCashPaymentHistory = async (req, res) => {
  try {
    const { startDate, endDate, adminId } = req.query;

    const result = await paymentService.getCashPaymentHistory({
      startDate,
      endDate,
      adminId
    });

    res.status(200).json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error("❌ Error en getCashPaymentHistory:", error);
    res.status(500).json({
      success: false,
      message: "Error al obtener historial de pagos",
      error: 'HISTORY_ERROR'
    });
  }
};

// ==================== WEBHOOKS ====================

/**
 * Webhook de Wompi
 */
paymentController.wompiWebhook = async (req, res) => {
  try {
    console.log('📥 Webhook recibido de Wompi');

    // Validar webhook
    const isValid = await validateWompiWebhook(req);
    if (!isValid) {
      console.error('❌ Webhook inválido');
      return res.status(400).json({ 
        success: false, 
        message: 'Webhook inválido' 
      });
    }

    const event = req.body;
    console.log('📨 Evento válido:', event.event, event.data?.id);

    // Procesar según tipo de evento
    let result;
    switch (event.event) {
      case 'transaction.updated':
        result = await paymentService.handleTransactionUpdate(event.data);
        break;
      case 'payment_link.paid':
        result = await paymentService.handlePaymentLinkPaid(event.data);
        break;
      default:
        console.log('ℹ️ Evento no manejado:', event.event);
        result = { processed: false, message: 'Evento no manejado' };
    }

    res.status(200).json({ 
      received: true,
      processed: result.processed,
      message: result.message
    });

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error procesando webhook' 
    });
  }
};

// ==================== MÉTODOS DE PAGO GUARDADOS ====================

/**
 * Obtener métodos de pago del usuario
 */
paymentController.getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const methods = await paymentService.getUserPaymentMethods(userId);
    
    res.status(200).json({
      success: true,
      data: {
        paymentMethods: methods,
        wompiConfigured: isWompiConfigured()
      }
    });

  } catch (error) {
    console.error("❌ Error en getPaymentMethods:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo métodos de pago",
      error: 'METHODS_ERROR'
    });
  }
};

/**
 * Crear método de pago
 */
paymentController.createPaymentMethod = async (req, res) => {
  try {
    const userId = req.user._id;
    const methodData = req.body;

    const result = await paymentService.createPaymentMethod(userId, methodData);

    res.status(201).json({
      success: true,
      message: "Método de pago creado",
      data: result
    });

  } catch (error) {
    console.error("❌ Error en createPaymentMethod:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error creando método de pago",
      error: error.code || 'METHOD_CREATION_ERROR'
    });
  }
};

/**
 * Actualizar método de pago
 */
paymentController.updatePaymentMethod = async (req, res) => {
  try {
    const { methodId } = req.params;
    const userId = req.user._id;
    const updateData = req.body;

    const result = await paymentService.updatePaymentMethod(methodId, userId, updateData);

    res.status(200).json({
      success: true,
      message: "Método de pago actualizado",
      data: result
    });

  } catch (error) {
    console.error("❌ Error en updatePaymentMethod:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error actualizando método de pago",
      error: error.code || 'METHOD_UPDATE_ERROR'
    });
  }
};

/**
 * Eliminar método de pago
 */
paymentController.deletePaymentMethod = async (req, res) => {
  try {
    const { methodId } = req.params;
    const userId = req.user._id;

    await paymentService.deletePaymentMethod(methodId, userId);

    res.status(200).json({
      success: true,
      message: "Método de pago eliminado"
    });

  } catch (error) {
    console.error("❌ Error en deletePaymentMethod:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error eliminando método de pago",
      error: error.code || 'METHOD_DELETE_ERROR'
    });
  }
};

/**
 * Activar/desactivar método de pago
 */
paymentController.togglePaymentMethod = async (req, res) => {
  try {
    const { methodId } = req.params;
    const { active } = req.body;
    const userId = req.user._id;

    const result = await paymentService.togglePaymentMethod(methodId, userId, active);

    res.status(200).json({
      success: true,
      message: `Método ${active ? 'activado' : 'desactivado'}`,
      data: result
    });

  } catch (error) {
    console.error("❌ Error en togglePaymentMethod:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error cambiando estado del método",
      error: error.code || 'METHOD_TOGGLE_ERROR'
    });
  }
};

// ==================== REPORTES DE PAGOS ====================

/**
 * Obtener estadísticas de pagos
 */
paymentController.getPaymentStats = async (req, res) => {
  try {
    const { startDate, endDate, method } = req.query;

    const stats = await paymentService.getPaymentStats({
      startDate,
      endDate,
      method
    });

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error("❌ Error en getPaymentStats:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo estadísticas",
      error: 'STATS_ERROR'
    });
  }
};

export default paymentController;