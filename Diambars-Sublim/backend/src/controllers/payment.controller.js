// src/controllers/payment.controller.js - Controlador simplificado
import { paymentService } from "../services/payment/unifiedPayment.service.js";
import { validators } from "../utils/validators.utils.js";

const paymentController = {};

// ==================== PROCESAMIENTO DE PAGOS ====================

/**
 * Procesar pago digital (Wompi)
 */
paymentController.processDigitalPayment = async (req, res) => {
  try {
    const { orderId, customerData } = req.body;
    
    // Validar entrada
    const orderIdCheck = validators.mongoId(orderId, 'ID de pedido');
    if (!orderIdCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: orderIdCheck.error,
        error: 'INVALID_ORDER_ID'
      });
    }

    const result = await paymentService.processPayment('wompi', {
      orderId: orderIdCheck.cleaned,
      customerData
    });

    res.status(200).json({
      success: true,
      message: result.isFictitious ? 'Link de pago simulado generado' : 'Link de pago generado',
      data: result
    });

  } catch (error) {
    console.error("❌ Error en processDigitalPayment:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al procesar pago digital",
      error: error.code || 'PAYMENT_ERROR'
    });
  }
};

/**
 * Registrar pago en efectivo
 */
paymentController.registerCashPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const adminId = req.user._id;
    
    // Validar datos de entrada
    const orderIdCheck = validators.mongoId(orderId, 'ID de pedido');
    if (!orderIdCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: orderIdCheck.error,
        error: 'INVALID_ORDER_ID'
      });
    }

    const cashCheck = validators.cashPayment(req.body, null); // null porque se valida en el servicio
    if (!cashCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: cashCheck.error,
        error: 'INVALID_CASH_DATA'
      });
    }

    const result = await paymentService.processPayment('cash', {
      orderId: orderIdCheck.cleaned,
      ...cashCheck.cleaned,
      adminId
    });

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
 * Confirmar pago manualmente (admin)
 */
paymentController.confirmManualPayment = async (req, res) => {
  try {
    const { orderId, method, amount, notes } = req.body;
    const adminId = req.user._id;

    // Validaciones
    const orderIdCheck = validators.mongoId(orderId, 'ID de pedido');
    if (!orderIdCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: orderIdCheck.error,
        error: 'INVALID_ORDER_ID'
      });
    }

    if (!method || !['cash', 'card', 'transfer'].includes(method)) {
      return res.status(400).json({
        success: false,
        message: 'Método de pago inválido',
        error: 'INVALID_PAYMENT_METHOD'
      });
    }

    if (amount) {
      const amountCheck = validators.price(amount);
      if (!amountCheck.isValid) {
        return res.status(400).json({
          success: false,
          message: amountCheck.error,
          error: 'INVALID_AMOUNT'
        });
      }
    }

    const result = await paymentService.processPayment('manual', {
      orderId: orderIdCheck.cleaned,
      method,
      amount,
      adminId,
      notes: notes?.trim()
    });

    res.status(200).json({
      success: true,
      message: "Pago confirmado manualmente",
      data: result
    });

  } catch (error) {
    console.error("❌ Error en confirmManualPayment:", error);
    res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Error al confirmar pago",
      error: error.code || 'MANUAL_PAYMENT_ERROR'
    });
  }
};

/**
 * Simular pago (desarrollo/testing)
 */
paymentController.simulatePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status = 'approved' } = req.body;

    // Solo permitir en desarrollo
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        message: "Simulación no disponible en producción",
        error: 'SIMULATION_NOT_ALLOWED'
      });
    }

    const orderIdCheck = validators.mongoId(orderId, 'ID de pedido');
    if (!orderIdCheck.isValid) {
      return res.status(400).json({
        success: false,
        message: orderIdCheck.error,
        error: 'INVALID_ORDER_ID'
      });
    }

    if (!['approved', 'declined'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado de simulación inválido',
        error: 'INVALID_STATUS'
      });
    }

    const result = await paymentService.processPayment('simulate', {
      orderId: orderIdCheck.cleaned,
      status
    });

    res.status(200).json({
      success: true,
      message: result.success ? "Pago simulado exitoso" : "Pago simulado falló",
      data: result
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

// ==================== WEBHOOKS ====================

/**
 * Webhook de Wompi
 */
paymentController.wompiWebhook = async (req, res) => {
  try {
    console.log('📥 Webhook recibido de Wompi');

    // Validar webhook
    const isValid = paymentService.validateWompiWebhook(req);
    if (!isValid) {
      console.error('❌ Webhook inválido');
      return res.status(400).json({ 
        success: false, 
        message: 'Webhook inválido' 
      });
    }

    // Procesar webhook
    const result = await paymentService.processWompiWebhook(req.body);

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

// ==================== CONFIGURACIÓN ====================

/**
 * Obtener configuración pública de pagos
 */
paymentController.getPaymentConfig = async (req, res) => {
  try {
    const config = paymentService.getPublicConfig();
    
    res.status(200).json({
      success: true,
      data: config
    });

  } catch (error) {
    console.error("❌ Error en getPaymentConfig:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo configuración",
      error: 'CONFIG_ERROR'
    });
  }
};

/**
 * Verificar estado de pagos
 */
paymentController.getPaymentStatus = async (req, res) => {
  try {
    const config = paymentService.getPublicConfig();
    
    res.status(200).json({
      success: true,
      data: {
        wompi: {
          enabled: config.wompi.enabled,
          environment: config.wompi.environment,
          message: config.wompi.enabled 
            ? 'Wompi configurado correctamente'
            : 'Wompi en modo simulado'
        },
        cash: {
          enabled: true,
          message: 'Pagos en efectivo disponibles'
        },
        manual: {
          enabled: true,
          message: 'Confirmación manual disponible'
        }
      }
    });

  } catch (error) {
    console.error("❌ Error en getPaymentStatus:", error);
    res.status(500).json({
      success: false,
      message: "Error verificando estado de pagos",
      error: 'STATUS_ERROR'
    });
  }
};

// ==================== ESTADÍSTICAS (BÁSICAS) ====================

/**
 * Estadísticas básicas de pagos
 */
paymentController.getBasicStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Validar fechas si se proporcionan
    let dateFilter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Fechas inválidas',
          error: 'INVALID_DATES'
        });
      }
      
      dateFilter = { startDate: start, endDate: end };
    }

    // Por ahora, respuesta básica - implementar lógica real después
    res.status(200).json({
      success: true,
      message: "Estadísticas básicas",
      data: {
        totalPayments: 0,
        methods: {
          cash: 0,
          wompi: 0,
          manual: 0
        },
        revenue: 0,
        filters: dateFilter
      }
    });

  } catch (error) {
    console.error("❌ Error en getBasicStats:", error);
    res.status(500).json({
      success: false,
      message: "Error obteniendo estadísticas",
      error: 'STATS_ERROR'
    });
  }
};

export default paymentController;