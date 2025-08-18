// src/routes/payment.routes.js - Rutas simplificadas
import { Router } from "express";
import paymentController from "../controllers/payment.controller.js";
import { authRequired, roleRequired } from "../middlewares/auth.middleware.js";
import { validateRequest, validateMongoId } from "../middlewares/validation.middleware.js";
import { body, param, query } from "express-validator";

const router = Router();

// ==================== WEBHOOKS (SIN AUTENTICACIÓN) ====================

/**
 * Webhook de Wompi - debe ir primero para evitar conflictos
 */
router.post('/webhook/wompi', paymentController.wompiWebhook);

// ==================== PROCESAMIENTO DE PAGOS ====================

/**
 * Procesar pago digital (Wompi)
 */
router.post('/process/digital',
  authRequired,
  [
    body('orderId')
      .notEmpty().withMessage('ID de pedido requerido')
      .isMongoId().withMessage('ID de pedido inválido'),
    body('customerData')
      .optional()
      .isObject().withMessage('Datos del cliente deben ser un objeto')
  ],
  validateRequest,
  paymentController.processDigitalPayment
);

/**
 * Registrar pago en efectivo (admin)
 */
router.post('/cash/:orderId',
  authRequired,
  roleRequired(['admin', 'manager']),
  [
    param('orderId').isMongoId().withMessage('ID de pedido inválido'),
    body('totalAmount')
      .optional()
      .isFloat({ min: 0.01 }).withMessage('Monto total debe ser mayor que 0'),
    body('cashReceived')
      .notEmpty().withMessage('Monto recibido requerido')
      .isFloat({ min: 0.01 }).withMessage('Monto recibido debe ser mayor que 0'),
    body('location')
      .notEmpty().withMessage('Ubicación del pago requerida')
      .isLength({ min: 5, max: 200 }).withMessage('Ubicación debe tener entre 5 y 200 caracteres'),
    body('notes')
      .optional()
      .isLength({ max: 500 }).withMessage('Notas no pueden exceder 500 caracteres')
  ],
  validateRequest,
  paymentController.registerCashPayment
);

/**
 * Confirmar pago manualmente (admin)
 */
router.post('/manual/confirm',
  authRequired,
  roleRequired(['admin', 'manager']),
  [
    body('orderId')
      .notEmpty().withMessage('ID de pedido requerido')
      .isMongoId().withMessage('ID de pedido inválido'),
    body('method')
      .notEmpty().withMessage('Método de pago requerido')
      .isIn(['cash', 'card', 'transfer']).withMessage('Método de pago inválido'),
    body('amount')
      .optional()
      .isFloat({ min: 0.01 }).withMessage('Monto debe ser mayor que 0'),
    body('notes')
      .optional()
      .isLength({ max: 500 }).withMessage('Notas no pueden exceder 500 caracteres')
  ],
  validateRequest,
  paymentController.confirmManualPayment
);

// ==================== SIMULACIÓN (SOLO DESARROLLO) ====================

/**
 * Simular pago - solo en desarrollo
 */
if (process.env.NODE_ENV !== 'production') {
  router.post('/simulate/:orderId',
    authRequired,
    [
      param('orderId').isMongoId().withMessage('ID de pedido inválido'),
      body('status')
        .optional()
        .isIn(['approved', 'declined']).withMessage('Estado inválido')
    ],
    validateRequest,
    paymentController.simulatePayment
  );
}

// ==================== CONFIGURACIÓN Y ESTADO ====================

/**
 * Obtener configuración pública de pagos
 */
router.get('/config', paymentController.getPaymentConfig);

/**
 * Verificar estado de servicios de pago
 */
router.get('/status', paymentController.getPaymentStatus);

// ==================== ESTADÍSTICAS (ADMIN) ====================

/**
 * Estadísticas básicas de pagos
 */
router.get('/stats',
  authRequired,
  roleRequired(['admin', 'manager']),
  [
    query('startDate').optional().isISO8601().withMessage('Fecha de inicio inválida'),
    query('endDate').optional().isISO8601().withMessage('Fecha de fin inválida')
  ],
  validateRequest,
  paymentController.getBasicStats
);

// ==================== RUTAS DE INFORMACIÓN ====================

/**
 * Métodos de pago disponibles
 */
router.get('/methods',
  authRequired,
  async (req, res) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          cash: {
            enabled: true,
            name: 'Efectivo',
            description: 'Pago en efectivo al momento de la entrega',
            timing: 'on_delivery'
          },
          wompi: {
            enabled: process.env.WOMPI_PUBLIC_KEY ? true : false,
            name: 'Pago Digital',
            description: 'Pago con tarjeta o transferencia',
            timing: 'advance'
          },
          manual: {
            enabled: true,
            name: 'Confirmación Manual',
            description: 'Confirmado manualmente por el administrador',
            timing: 'flexible'
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo métodos de pago'
      });
    }
  }
);

/**
 * Información de comisiones (informativo)
 */
router.get('/fees',
  async (req, res) => {
    try {
      res.status(200).json({
        success: true,
        data: {
          cash: {
            fee: 0,
            description: 'Sin comisiones adicionales'
          },
          wompi: {
            fee: '3.5%',
            description: 'Comisión aproximada del procesador',
            note: 'Las comisiones las asume Diambars'
          },
          message: 'Todos los métodos de pago están disponibles sin costo adicional para el cliente'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo información de comisiones'
      });
    }
  }
);

export default router;