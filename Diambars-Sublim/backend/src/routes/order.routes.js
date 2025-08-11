// routes/order.routes.js
import { Router } from "express";
import orderController from "../controllers/order.controller.js";
import { authRequired, roleRequired } from "../middlewares/auth.middleware.js";
import { validateRequest, validateMongoId, validatePagination } from "../middlewares/validation.middleware.js";
import cloudinary from "../utils/cloudinary.js";
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
    body('paymentTiming')
      .optional()
      .isIn(['on_delivery', 'advance']).withMessage('Timing de pago inválido'),
    body('advancePercentage')
      .optional()
      .isFloat({ min: 0, max: 100 }).withMessage('Porcentaje de adelanto inválido'),
    body('clientNotes')
      .optional()
      .isString().withMessage('Las notas deben ser texto')
      .isLength({ max: 1000 }).withMessage('Las notas no pueden exceder 1000 caracteres')
  ],
  
  updateStatus: [
    param('id').isMongoId().withMessage('ID de pedido inválido'),
    body('status')
      .notEmpty().withMessage('El estado es requerido')
      .isIn([
        'pending_approval', 'quoted', 'approved', 'rejected',
        'in_production', 'ready_for_delivery', 'delivered', 
        'completed', 'cancelled'
      ]).withMessage('Estado inválido'),
    body('notes')
      .optional()
      .isString().withMessage('Las notas deben ser texto')
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
      .isString().withMessage('Las notas deben ser texto'),
    body('photoUrl')
      .optional()
      .isURL().withMessage('URL de foto inválida'),
    body('estimatedCompletion')
      .optional()
      .isISO8601().withMessage('Fecha de completación inválida')
  ],
  
  confirmPayment: [
    param('id').isMongoId().withMessage('ID de pedido inválido'),
    body('amount')
      .notEmpty().withMessage('El monto es requerido')
      .isFloat({ min: 0.01 }).withMessage('Monto inválido'),
    body('receiptNumber')
      .optional()
      .isString().withMessage('Número de recibo debe ser texto'),
    body('notes')
      .optional()
      .isString().withMessage('Las notas deben ser texto')
  ],
  
  approvePhoto: [
    param('id').isMongoId().withMessage('ID de pedido inválido'),
    body('photoId').notEmpty().withMessage('ID de foto requerido'),
    body('approved').isBoolean().withMessage('Aprobación debe ser true o false'),
    body('changeRequested')
      .optional()
      .isString().withMessage('Los cambios solicitados deben ser texto'),
    body('clientNotes')
      .optional()
      .isString().withMessage('Las notas deben ser texto')
  ],
  
  cancel: [
    param('id').isMongoId().withMessage('ID de pedido inválido'),
    body('reason')
      .optional()
      .isString().withMessage('La razón debe ser texto')
      .isLength({ max: 500 }).withMessage('La razón no puede exceder 500 caracteres')
  ],
  
  refund: [
    param('id').isMongoId().withMessage('ID de pedido inválido'),
    body('amount')
      .optional()
      .isFloat({ min: 0.01 }).withMessage('Monto de reembolso inválido'),
    body('reason')
      .notEmpty().withMessage('La razón del reembolso es requerida')
      .isString().withMessage('La razón debe ser texto')
  ],
  
  notifyCustomer: [
    param('id').isMongoId().withMessage('ID de pedido inválido'),
    body('message')
      .notEmpty().withMessage('El mensaje es requerido')
      .isString().withMessage('El mensaje debe ser texto')
      .isLength({ min: 1, max: 500 }).withMessage('El mensaje debe tener entre 1 y 500 caracteres')
  ]
};

// ==================== RUTAS PÚBLICAS (WEBHOOKS) ====================

// Webhook de Wompi (sin autenticación) - Se maneja en app.js con raw body
router.post('/webhook/wompi', orderController.wompiWebhook);

// ==================== RUTAS DE CLIENTE ====================

// Crear nuevo pedido
router.post('/',
  authRequired,
  orderValidations.create,
  validateRequest,
  orderController.createOrder
);

// Obtener pedidos del usuario actual
router.get('/my-orders',
  authRequired,
  validatePagination,
  orderController.getAllOrders
);

// Obtener detalle de un pedido específico
router.get('/:id',
  authRequired,
  validateMongoId('id'),
  orderController.getOrderById
);

// Obtener tracking detallado de un pedido
router.get('/:id/tracking',
  authRequired,
  validateMongoId('id'),
  orderController.getOrderTracking
);

// Cliente aprueba o rechaza foto del producto
router.post('/:id/approve-photo',
  authRequired,
  orderValidations.approvePhoto,
  validateRequest,
  orderController.approveProductPhoto
);

// Cancelar pedido (cliente o admin)
router.post('/:id/cancel',
  authRequired,
  orderValidations.cancel,
  validateRequest,
  orderController.cancelOrder
);

// ==================== RUTAS DE ADMINISTRADOR ====================

// Obtener todos los pedidos (admin/manager)
router.get('/',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('status').optional().isString(),
  query('user').optional().isMongoId(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  validateRequest,
  orderController.getAllOrders
);

// Actualizar estado del pedido (admin/manager)
router.patch('/:id/status',
  authRequired,
  roleRequired(['admin', 'manager']),
  orderValidations.updateStatus,
  validateRequest,
  orderController.updateOrderStatus
);

// Actualizar estado de producción (admin/manager)
router.patch('/:id/production',
  authRequired,
  roleRequired(['admin', 'manager']),
  orderValidations.updateProduction,
  validateRequest,
  orderController.updateProductionStatus
);

// Subir foto de producción con progreso
router.post('/:id/production-photo',
  authRequired,
  roleRequired(['admin', 'manager']),
  validateMongoId('id'),
  cloudinary.uploadProduct.single('photo'),
  orderController.uploadProductionPhoto
);

// Confirmar pago manual (admin/manager)
router.post('/:id/confirm-payment',
  authRequired,
  roleRequired(['admin', 'manager']),
  orderValidations.confirmPayment,
  validateRequest,
  orderController.confirmPayment
);

// Procesar pago (generar link Wompi)
router.post('/:id/process-payment',
  authRequired,
  roleRequired(['admin', 'manager']),
  validateMongoId('id'),
  orderController.processPayment
);

// Procesar reembolso
router.post('/:id/refund',
  authRequired,
  roleRequired(['admin', 'manager']),
  orderValidations.refund,
  validateRequest,
  orderController.processRefund
);

// Obtener estadísticas de pedidos
router.get('/admin/stats',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  validateRequest,
  orderController.getOrderStats
);

// Obtener pedidos del día (para app móvil/dashboard)
router.get('/admin/today',
  authRequired,
  roleRequired(['admin', 'manager']),
  orderController.getTodayOrders
);

// Obtener pedidos pendientes de producción
router.get('/admin/pending-production',
  authRequired,
  roleRequired(['admin', 'manager']),
  orderController.getPendingProduction
);

// Enviar recordatorio de pago
router.post('/:id/payment-reminder',
  authRequired,
  roleRequired(['admin', 'manager']),
  validateMongoId('id'),
  orderController.sendPaymentReminder
);

// Notificar al cliente con mensaje personalizado
router.post('/:id/notify-customer',
  authRequired,
  roleRequired(['admin', 'manager']),
  orderValidations.notifyCustomer,
  validateRequest,
  orderController.notifyCustomer
);

// Marcar pedido como entregado
router.patch('/:id/mark-delivered',
  authRequired,
  roleRequired(['admin', 'manager']),
  validateMongoId('id'),
  body('deliveryNotes').optional().isString(),
  body('deliveredAt').optional().isISO8601(),
  validateRequest,
  orderController.markAsDelivered
);

// Completar pedido
router.patch('/:id/complete',
  authRequired,
  roleRequired(['admin', 'manager']),
  validateMongoId('id'),
  body('completionNotes').optional().isString(),
  validateRequest,
  orderController.completeOrder
);

// ==================== RUTAS DE REPORTES ====================

// Reporte de ventas por período
router.get('/reports/sales',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('startDate').isISO8601().withMessage('Fecha de inicio requerida'),
  query('endDate').isISO8601().withMessage('Fecha de fin requerida'),
  query('groupBy').optional().isIn(['day', 'week', 'month']),
  validateRequest,
  orderController.getSalesReport
);

// Reporte de productos más vendidos
router.get('/reports/top-products',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validateRequest,
  orderController.getTopProductsReport
);

// Reporte de clientes frecuentes
router.get('/reports/top-customers',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validateRequest,
  orderController.getTopCustomersReport
);

// ==================== RUTAS DE BÚSQUEDA Y FILTROS ====================

// Buscar pedidos por múltiples criterios
router.get('/search',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('q').optional().isString(),
  query('orderNumber').optional().isString(),
  query('customerEmail').optional().isEmail(),
  query('productName').optional().isString(),
  query('minTotal').optional().isFloat({ min: 0 }),
  query('maxTotal').optional().isFloat({ min: 0 }),
  validatePagination,
  validateRequest,
  orderController.searchOrders
);

// Exportar pedidos a CSV/Excel
router.get('/export',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('format').isIn(['csv', 'excel']).withMessage('Formato debe ser csv o excel'),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('status').optional().isString(),
  validateRequest,
  orderController.exportOrders
);

export default router;