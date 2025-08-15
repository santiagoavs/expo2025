// routes/order.routes.js - REFACTORIZADO
import { Router } from "express";
import orderController from "../controllers/order.controller.js";
import paymentController from "../controllers/payment.controller.js";
import reportController from "../controllers/report.controller.js";
import { authRequired, roleRequired } from "../middlewares/auth.middleware.js";
import { validateRequest, validateMongoId } from "../middlewares/validation.middleware.js";
import { body, param, query } from "express-validator";

const router = Router();

// ==================== VALIDACIONES ====================
const orderValidations = {
  create: [
    body('designId')
      .notEmpty().withMessage('El ID del diseño es requerido')
      .isMongoId().withMessage('ID de diseño inválido'),
    body('quantity')
      .optional()
      .isInt({ min: 1, max: 100 }).withMessage('La cantidad debe ser entre 1 y 100'),
    body('deliveryType')
      .optional()
      .isIn(['delivery', 'meetup']).withMessage('Tipo de entrega inválido'),
    body('paymentMethod')
      .optional()
      .isIn(['cash', 'card', 'transfer', 'wompi']).withMessage('Método de pago inválido'),
    body('clientNotes')
      .optional()
      .isLength({ max: 1000 }).withMessage('Las notas no pueden exceder 1000 caracteres')
  ],
  
  submitQuote: [
    param('id').isMongoId().withMessage('ID de pedido inválido'),
    body('totalPrice')
      .notEmpty().withMessage('El precio total es requerido')
      .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor que 0'),
    body('deliveryFee')
      .optional()
      .isFloat({ min: 0 }).withMessage('La tarifa de envío debe ser mayor o igual a 0'),
    body('tax')
      .optional()
      .isFloat({ min: 0 }).withMessage('El impuesto debe ser mayor o igual a 0'),
    body('notes')
      .optional()
      .isLength({ max: 500 }).withMessage('Las notas no pueden exceder 500 caracteres')
  ],
  
  respondToQuote: [
    param('id').isMongoId().withMessage('ID de pedido inválido'),
    body('accept')
      .notEmpty().withMessage('Debe especificar si acepta la cotización')
      .isBoolean().withMessage('accept debe ser true o false'),
    body('clientNotes')
      .optional()
      .isLength({ max: 500 }).withMessage('Las notas no pueden exceder 500 caracteres')
  ],
  
  updateProduction: [
    param('id').isMongoId().withMessage('ID de pedido inválido'),
    body('productionStage')
      .notEmpty().withMessage('La etapa de producción es requerida')
      .isIn([
        'sourcing_product', 'preparing_materials', 'printing',
        'sublimating', 'quality_check', 'packaging'
      ]).withMessage('Etapa de producción inválida'),
    body('notes')
      .optional()
      .isLength({ max: 500 }).withMessage('Las notas no pueden exceder 500 caracteres'),
    body('photoUrl')
      .optional()
      .isURL().withMessage('URL de foto inválida')
  ],
  
  cashPayment: [
    param('id').isMongoId().withMessage('ID de pedido inválido'),
    body('totalAmount')
      .notEmpty().withMessage('Monto total requerido')
      .isFloat({ min: 0.01 }).withMessage('Monto total debe ser mayor que 0'),
    body('cashReceived')
      .notEmpty().withMessage('Monto recibido requerido')
      .isFloat({ min: 0.01 }).withMessage('Monto recibido debe ser mayor que 0'),
    body('paymentLocation')
      .notEmpty().withMessage('Ubicación del pago requerida')
      .isLength({ min: 5, max: 200 }).withMessage('Ubicación debe tener entre 5 y 200 caracteres')
  ]
};

// ==================== WEBHOOKS (SIN AUTENTICACIÓN) ====================
router.post('/webhook/wompi', paymentController.wompiWebhook);

// ==================== RUTAS CLIENTE + ADMIN ====================

// Crear nuevo pedido
router.post('/',
  authRequired,
  orderValidations.create,
  validateRequest,
  orderController.createOrder
);

// Obtener pedido por ID
router.get('/:id',
  authRequired,
  validateMongoId('id'),
  orderController.getOrderById
);

// Obtener tracking detallado tipo Temu
router.get('/:id/tracking',
  authRequired,
  validateMongoId('id'),
  orderController.getOrderTracking
);

// ==================== RUTAS SOLO CLIENTE ====================

// Obtener mis pedidos
router.get('/my/orders',
  authRequired,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('status').optional().isString(),
  validateRequest,
  orderController.getMyOrders
);

// Responder a cotización (aceptar/rechazar)
router.post('/:id/respond-quote',
  authRequired,
  orderValidations.respondToQuote,
  validateRequest,
  orderController.respondToQuote
);

// Aprobar foto de control de calidad
router.post('/:id/approve-photo',
  authRequired,
  validateMongoId('id'),
  body('photoId').notEmpty().withMessage('ID de foto requerido'),
  body('approved').isBoolean().withMessage('Aprobación debe ser true o false'),
  body('changeRequested').optional().isString(),
  body('clientNotes').optional().isLength({ max: 500 }),
  validateRequest,
  orderController.approveProductPhoto
);

// Cancelar pedido
router.post('/:id/cancel',
  authRequired,
  validateMongoId('id'),
  body('reason').optional().isLength({ max: 500 }),
  validateRequest,
  orderController.cancelOrder
);

// ==================== RUTAS SOLO ADMIN ====================

// Obtener todas las solicitudes
router.get('/admin/all',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isString(),
  query('user').optional().isMongoId(),
  query('search').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  validateRequest,
  orderController.getAllOrders
);

// Cotizar manualmente (SIN cálculos automáticos)
router.post('/:id/quote',
  authRequired,
  roleRequired(['admin', 'manager']),
  orderValidations.submitQuote,
  validateRequest,
  orderController.submitQuote
);

// Actualizar estado del pedido
router.patch('/:id/status',
  authRequired,
  roleRequired(['admin', 'manager']),
  validateMongoId('id'),
  body('status')
    .notEmpty()
    .isIn([
      'pending_approval', 'quoted', 'approved', 'rejected',
      'in_production', 'ready_for_delivery', 'delivered', 
      'completed', 'cancelled'
    ]),
  body('notes').optional().isLength({ max: 500 }),
  validateRequest,
  orderController.updateOrderStatus
);

// Actualizar etapas de producción
router.patch('/:id/production',
  authRequired,
  roleRequired(['admin', 'manager']),
  orderValidations.updateProduction,
  validateRequest,
  orderController.updateProductionStage
);

// Subir foto de control de calidad
router.post('/:id/production-photo',
  authRequired,
  roleRequired(['admin', 'manager']),
  validateMongoId('id'),
  body('stage')
    .notEmpty()
    .isIn(['printing', 'sublimating', 'quality_check', 'final']),
  body('photoUrl').notEmpty().isURL(),
  body('notes').optional().isLength({ max: 500 }),
  validateRequest,
  orderController.uploadProductionPhoto
);

// Registrar pago en efectivo
router.post('/:id/cash-payment',
  authRequired,
  roleRequired(['admin', 'manager']),
  orderValidations.cashPayment,
  validateRequest,
  orderController.registerCashPayment
);

// Finalizar pedido presencial
router.post('/:id/finalize',
  authRequired,
  roleRequired(['admin', 'manager']),
  validateMongoId('id'),
  body('deliveryNotes').optional().isLength({ max: 500 }),
  body('customerSatisfaction').optional().isInt({ min: 1, max: 5 }),
  validateRequest,
  orderController.finalizeOrder
);

// ==================== RUTAS DE PAGOS ====================

// Procesar pago con Wompi
router.post('/:id/payment/wompi',
  authRequired,
  validateMongoId('id'),
  body('paymentMethodId').optional().isMongoId(),
  body('customerData').optional().isObject(),
  validateRequest,
  paymentController.processWompiPayment
);

// Simular pago (desarrollo/testing)
router.post('/:id/payment/simulate',
  authRequired,
  validateMongoId('id'),
  body('status').optional().isIn(['approved', 'declined', 'error']),
  validateRequest,
  paymentController.simulatePayment
);

// Confirmar pago manual (admin)
router.post('/:id/payment/confirm',
  authRequired,
  roleRequired(['admin', 'manager']),
  validateMongoId('id'),
  body('method').notEmpty().isIn(['cash', 'card', 'transfer']),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('receiptNumber').optional().isString(),
  body('notes').optional().isLength({ max: 500 }),
  validateRequest,
  paymentController.confirmManualPayment
);

// ==================== RUTAS DE REPORTES ====================

// Dashboard con métricas generales
router.get('/reports/dashboard',
  authRequired,
  roleRequired(['admin', 'manager']),
  reportController.getDashboardStats
);

// Reporte de ventas por período
router.get('/reports/sales',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('groupBy').optional().isIn(['day', 'week', 'month']),
  query('includeDetails').optional().isBoolean(),
  validateRequest,
  reportController.getSalesReport
);

// Reporte de productos más vendidos
router.get('/reports/top-products',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validateRequest,
  reportController.getTopProductsReport
);

// Reporte de clientes frecuentes
router.get('/reports/top-customers',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('sortBy').optional().isIn(['totalSpent', 'totalOrders', 'averageOrderValue', 'lastOrderDate']),
  validateRequest,
  reportController.getTopCustomersReport
);

// Reporte de tiempos de producción
router.get('/reports/production',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  validateRequest,
  reportController.getProductionReport
);

// ==================== RUTAS DE MÉTODOS DE PAGO ====================

// Obtener métodos de pago del usuario
router.get('/payment-methods',
  authRequired,
  paymentController.getPaymentMethods
);

// Crear método de pago
router.post('/payment-methods',
  authRequired,
  body('number').isLength({ min: 13, max: 19 }).matches(/^\d+$/),
  body('name').isLength({ min: 2, max: 100 }),
  body('expiry').matches(/^(0[1-9]|1[0-2])\/\d{2}$/),
  body('cvc').isLength({ min: 3, max: 4 }).matches(/^\d+$/),
  body('issuer').optional().isIn(['visa', 'mastercard', 'amex', 'discover', 'unknown']),
  validateRequest,
  paymentController.createPaymentMethod
);

// Actualizar método de pago
router.put('/payment-methods/:methodId',
  authRequired,
  validateMongoId('methodId'),
  body('number').optional().isLength({ min: 13, max: 19 }).matches(/^\d+$/),
  body('name').optional().isLength({ min: 2, max: 100 }),
  body('expiry').optional().matches(/^(0[1-9]|1[0-2])\/\d{2}$/),
  body('cvc').optional().isLength({ min: 3, max: 4 }).matches(/^\d+$/),
  validateRequest,
  paymentController.updatePaymentMethod
);

// Eliminar método de pago
router.delete('/payment-methods/:methodId',
  authRequired,
  validateMongoId('methodId'),
  paymentController.deletePaymentMethod
);

// Activar/desactivar método de pago
router.patch('/payment-methods/:methodId/toggle',
  authRequired,
  validateMongoId('methodId'),
  body('active').isBoolean(),
  validateRequest,
  paymentController.togglePaymentMethod
);

// ==================== RUTAS DE HISTORIAL DE PAGOS ====================

// Historial de pagos en efectivo (admin)
router.get('/payments/cash/history',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('adminId').optional().isMongoId(),
  validateRequest,
  paymentController.getCashPaymentHistory
);

// Estadísticas de pagos
router.get('/payments/stats',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('method').optional().isIn(['cash', 'card', 'transfer', 'wompi']),
  validateRequest,
  paymentController.getPaymentStats
);

// ==================== RUTAS LEGACY (REDIRECCIONES) ====================

// Mantener compatibilidad con rutas existentes
router.get('/', 
  authRequired,
  (req, res, next) => {
    // Si es admin, redirigir a la nueva ruta
    if (req.user.roles?.some(role => ['admin', 'manager'].includes(role))) {
      req.url = '/admin/all';
      return next();
    }
    // Si es usuario normal, redirigir a mis pedidos
    req.url = '/my/orders';
    next();
  },
  orderController.getAllOrders
);

export default router;