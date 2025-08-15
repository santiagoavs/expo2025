// routes/payment.routes.js - Rutas específicas para pagos
import { Router } from "express";
import * as paymentController from "../controllers/payment.controller.js"; // CAMBIO: import con *
import { authRequired, roleRequired } from "../middlewares/auth.middleware.js";
import { validateRequest, validateMongoId } from "../middlewares/validation.middleware.js";
import { body, param, query } from "express-validator";

const router = Router();

// ==================== VALIDACIONES ====================
const paymentValidations = {
  createMethod: [
    body('number')
      .isLength({ min: 13, max: 19 })
      .matches(/^\d+$/)
      .withMessage('Número de tarjeta debe contener solo dígitos y tener entre 13-19 caracteres'),
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Nombre debe tener entre 2 y 100 caracteres'),
    body('expiry')
      .matches(/^(0[1-9]|1[0-2])\/\d{2}$/)
      .withMessage('Fecha de expiración debe tener formato MM/AA'),
    body('cvc')
      .isLength({ min: 3, max: 4 })
      .matches(/^\d+$/)
      .withMessage('CVC debe contener solo dígitos y tener entre 3-4 caracteres'),
    body('issuer')
      .optional()
      .isIn(['visa', 'mastercard', 'amex', 'discover', 'unknown'])
      .withMessage('Tipo de tarjeta inválido')
  ],

  processPayment: [
    body('orderId')
      .notEmpty()
      .isMongoId()
      .withMessage('ID de pedido inválido'),
    body('paymentMethodId')
      .optional()
      .isMongoId()
      .withMessage('ID de método de pago inválido'),
    body('customerData')
      .optional()
      .isObject()
      .withMessage('Datos del cliente deben ser un objeto')
  ],

  cashPayment: [
    body('orderId')
      .notEmpty()
      .isMongoId()
      .withMessage('ID de pedido requerido'),
    body('totalAmount')
      .notEmpty()
      .isFloat({ min: 0.01 })
      .withMessage('Monto total debe ser mayor que 0'),
    body('cashReceived')
      .notEmpty()
      .isFloat({ min: 0.01 })
      .withMessage('Monto recibido debe ser mayor que 0'),
    body('paymentLocation')
      .notEmpty()
      .isLength({ min: 5, max: 200 })
      .withMessage('Ubicación debe tener entre 5 y 200 caracteres'),
    body('adminNotes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Notas no pueden exceder 500 caracteres')
  ]
};

// ==================== FUNCIONES TEMPORALES PARA DESARROLLO ====================
// Estas funciones temporales evitarán el error hasta que crees el controlador completo

const createTemporaryHandler = (functionName) => {
  return (req, res) => {
    res.status(501).json({
      success: false,
      message: `Función ${functionName} aún no implementada`,
      error: 'NOT_IMPLEMENTED',
      endpoint: req.originalUrl,
      method: req.method
    });
  };
};

// Verificar qué funciones existen en el controlador
const safeController = {
  // Webhooks
  wompiWebhook: paymentController.wompiWebhook || createTemporaryHandler('wompiWebhook'),
  
  // Métodos de pago
  getPaymentMethods: paymentController.getPaymentMethods || createTemporaryHandler('getPaymentMethods'),
  createPaymentMethod: paymentController.createPaymentMethod || createTemporaryHandler('createPaymentMethod'),
  updatePaymentMethod: paymentController.updatePaymentMethod || createTemporaryHandler('updatePaymentMethod'),
  deletePaymentMethod: paymentController.deletePaymentMethod || createTemporaryHandler('deletePaymentMethod'),
  togglePaymentMethod: paymentController.togglePaymentMethod || createTemporaryHandler('togglePaymentMethod'),
  
  // Procesamiento
  processWompiPayment: paymentController.processWompiPayment || createTemporaryHandler('processWompiPayment'),
  simulatePayment: paymentController.simulatePayment || createTemporaryHandler('simulatePayment'),
  confirmManualPayment: paymentController.confirmManualPayment || createTemporaryHandler('confirmManualPayment'),
  
  // Efectivo
  registerCashPayment: paymentController.registerCashPayment || createTemporaryHandler('registerCashPayment'),
  getCashPaymentHistory: paymentController.getCashPaymentHistory || createTemporaryHandler('getCashPaymentHistory'),
  
  // Estadísticas
  getPaymentStats: paymentController.getPaymentStats || createTemporaryHandler('getPaymentStats'),
  getPaymentMethodReport: paymentController.getPaymentMethodReport || createTemporaryHandler('getPaymentMethodReport'),
  getCashDetailedReport: paymentController.getCashDetailedReport || createTemporaryHandler('getCashDetailedReport'),
  
  // Validación
  getWompiStatus: paymentController.getWompiStatus || createTemporaryHandler('getWompiStatus'),
  validateCard: paymentController.validateCard || createTemporaryHandler('validateCard'),
  
  // Configuración
  getPaymentConfig: paymentController.getPaymentConfig || createTemporaryHandler('getPaymentConfig'),
  updatePaymentConfig: paymentController.updatePaymentConfig || createTemporaryHandler('updatePaymentConfig')
};

// ==================== WEBHOOKS (SIN AUTENTICACIÓN) ====================

// Webhook de Wompi
router.post('/webhook/wompi', safeController.wompiWebhook);

// ==================== MÉTODOS DE PAGO GUARDADOS ====================

// Obtener métodos de pago del usuario
router.get('/methods',
  authRequired,
  safeController.getPaymentMethods
);

// Crear método de pago
router.post('/methods',
  authRequired,
  paymentValidations.createMethod,
  validateRequest,
  safeController.createPaymentMethod
);

// Actualizar método de pago
router.put('/methods/:methodId',
  authRequired,
  validateMongoId('methodId'),
  paymentValidations.createMethod,
  validateRequest,
  safeController.updatePaymentMethod
);

// Eliminar método de pago
router.delete('/methods/:methodId',
  authRequired,
  validateMongoId('methodId'),
  safeController.deletePaymentMethod
);

// Activar/desactivar método de pago
router.patch('/methods/:methodId/toggle',
  authRequired,
  validateMongoId('methodId'),
  body('active').isBoolean().withMessage('active debe ser true o false'),
  validateRequest,
  safeController.togglePaymentMethod
);

// ==================== PROCESAMIENTO DE PAGOS ====================

// Procesar pago digital (Wompi)
router.post('/process/digital',
  authRequired,
  paymentValidations.processPayment,
  validateRequest,
  safeController.processWompiPayment
);

// Simular pago (desarrollo/testing)
router.post('/simulate/:orderId',
  authRequired,
  validateMongoId('orderId'),
  body('status')
    .optional()
    .isIn(['approved', 'declined', 'error'])
    .withMessage('Estado de simulación inválido'),
  validateRequest,
  safeController.simulatePayment
);

// Confirmar pago manual (admin)
router.post('/confirm/manual',
  authRequired,
  roleRequired(['admin', 'manager']),
  body('orderId').notEmpty().isMongoId(),
  body('method').notEmpty().isIn(['cash', 'card', 'transfer']),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('receiptNumber').optional().isString(),
  body('notes').optional().isLength({ max: 500 }),
  validateRequest,
  safeController.confirmManualPayment
);

// ==================== PAGOS EN EFECTIVO ====================

// Registrar pago en efectivo
router.post('/cash/register',
  authRequired,
  roleRequired(['admin', 'manager']),
  paymentValidations.cashPayment,
  validateRequest,
  safeController.registerCashPayment
);

// Obtener historial de pagos en efectivo
router.get('/cash/history',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('adminId').optional().isMongoId(),
  validateRequest,
  safeController.getCashPaymentHistory
);

// ==================== ESTADÍSTICAS Y REPORTES ====================

// Estadísticas generales de pagos
router.get('/stats',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('method').optional().isIn(['cash', 'card', 'transfer', 'wompi']),
  validateRequest,
  safeController.getPaymentStats
);

// Reporte detallado de pagos por método
router.get('/reports/by-method',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('groupBy').optional().isIn(['day', 'week', 'month']),
  validateRequest,
  safeController.getPaymentMethodReport
);

// Reporte de efectivo con denominaciones
router.get('/reports/cash-detailed',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('includeChange').optional().isBoolean(),
  validateRequest,
  safeController.getCashDetailedReport
);

// ==================== VALIDACIÓN Y TESTING ====================

// Verificar estado de Wompi
router.get('/wompi/status',
  authRequired,
  roleRequired(['admin', 'manager']),
  safeController.getWompiStatus
);

// Validar método de pago (sin guardar)
router.post('/validate/card',
  authRequired,
  body('number').isLength({ min: 13, max: 19 }).matches(/^\d+$/),
  body('expiry').matches(/^(0[1-9]|1[0-2])\/\d{2}$/),
  body('cvc').isLength({ min: 3, max: 4 }).matches(/^\d+$/),
  validateRequest,
  safeController.validateCard
);

// ==================== CONFIGURACIÓN ====================

// Obtener configuración pública de pagos
router.get('/config',
  safeController.getPaymentConfig
);

// Actualizar configuración de pagos (admin)
router.put('/config',
  authRequired,
  roleRequired(['admin']),
  body('wompiEnabled').optional().isBoolean(),
  body('cashEnabled').optional().isBoolean(),
  body('cardEnabled').optional().isBoolean(),
  body('minimumAmount').optional().isFloat({ min: 0 }),
  body('maximumAmount').optional().isFloat({ min: 0 }),
  validateRequest,
  safeController.updatePaymentConfig
);

export default router;