// routes/order.routes.js - REORGANIZADO Y SIMPLIFICADO
import { Router } from "express";
import orderController from "../controllers/order.controller.js";
import paymentController from "../controllers/payment.controller.js";
import reportController from "../controllers/report.controller.js";
import { authRequired, roleRequired } from "../middlewares/auth.middleware.js";
import { validateRequest, validateMongoId } from "../middlewares/validation.middleware.js";
import { body, param, query } from "express-validator";

const router = Router();

// ==================== WEBHOOKS (SIN AUTENTICACIÓN) ====================
router.post('/webhook/wompi', paymentController.wompiWebhook);

// ==================== RUTAS DE PEDIDOS ====================

// ✅ NUEVO: Obtener todas las órdenes (con filtros y paginación)
router.get('/',
  authRequired,
  roleRequired(['admin', 'manager']), // Solo admins pueden ver todas las órdenes
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isString(),
  query('deliveryType').optional().isIn(['delivery', 'meetup']),
  query('paymentStatus').optional().isIn(['pending', 'paid', 'failed']),
  query('search').optional().isString(),
  query('userId').optional().isMongoId(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('sort').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']),
  validateRequest,
  orderController.getAllOrders
);

// Obtener orden específica por ID
router.get('/:id',
  authRequired,
  validateMongoId('id'),
  orderController.getOrderById
);

// Crear nuevo pedido
router.post('/',
  authRequired,
  body('designId').notEmpty().isMongoId(),
  body('quantity').optional().isInt({ min: 1, max: 100 }),
  body('deliveryType').optional().isIn(['delivery', 'meetup']),
  validateRequest,
  orderController.createOrder
);

// Responder a cotización (aceptar/rechazar)
router.post('/:id/respond-quote',
  authRequired,
  validateMongoId('id'),
  body('accept').isBoolean(),
  body('clientNotes').optional().isLength({ max: 500 }),
  validateRequest,
  orderController.respondToQuote
);

// ==================== RUTAS SOLO ADMIN ====================

// Cotizar manualmente (SIN cálculos automáticos)
router.post('/:id/quote',
  authRequired,
  roleRequired(['admin', 'manager']),
  validateMongoId('id'),
  body('totalPrice').isFloat({ min: 0.01 }),
  body('deliveryFee').optional().isFloat({ min: 0 }),
  body('tax').optional().isFloat({ min: 0 }),
  body('notes').optional().isLength({ max: 500 }),
  validateRequest,
  orderController.submitQuote
);

// Actualizar estado de orden
router.patch('/:id/status',
  authRequired,
  roleRequired(['admin', 'manager']),
  validateMongoId('id'),
  body('status').isIn([
    'pending_approval',
    'quoted', 
    'approved',
    'rejected',
    'in_production',
    'ready_for_delivery',
    'delivered',
    'completed',
    'cancelled'
  ]),
  body('notes').optional().isLength({ max: 500 }),
  validateRequest,
  orderController.updateOrderStatus
);

// Registrar pago en efectivo
router.post('/:id/cash-payment',
  authRequired,
  roleRequired(['admin', 'manager']),
  validateMongoId('id'),
  body('totalAmount').isFloat({ min: 0.01 }),
  body('cashReceived').isFloat({ min: 0.01 }),
  body('paymentLocation').isLength({ min: 5, max: 200 }),
  validateRequest,
  orderController.registerCashPayment
);

// ==================== RUTAS DE PAGOS ====================

// Procesar pago digital (Wompi)
router.post('/:id/payment/digital',
  authRequired,
  validateMongoId('id'),
  body('customerData').optional().isObject(),
  validateRequest,
  paymentController.processDigitalPayment
);

// Registrar pago en efectivo (alias)
router.post('/:id/payment/cash',
  authRequired,
  roleRequired(['admin', 'manager']),
  validateMongoId('id'),
  paymentController.registerCashPayment
);

// Confirmar pago manual (admin)
router.post('/:id/payment/confirm',
  authRequired,
  roleRequired(['admin', 'manager']),
  validateMongoId('id'),
  body('method').isIn(['cash', 'card', 'transfer']),
  body('amount').optional().isFloat({ min: 0.01 }),
  validateRequest,
  paymentController.confirmManualPayment
);

// Simular pago (desarrollo/testing)
router.post('/:id/payment/simulate',
  authRequired,
  validateMongoId('id'),
  body('status').optional().isIn(['approved', 'declined']),
  validateRequest,
  paymentController.simulatePayment
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
  validateRequest,
  reportController.getSalesReport
);

// Reporte de productos más vendidos
router.get('/reports/top-products',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validateRequest,
  reportController.getTopProductsReport
);

// Reporte de clientes frecuentes
router.get('/reports/top-customers',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('sortBy').optional().isIn(['totalSpent', 'totalOrders', 'averageOrderValue']),
  validateRequest,
  reportController.getTopCustomersReport
);

// Reporte de tiempos de producción
router.get('/reports/production',
  authRequired,
  roleRequired(['admin', 'manager']),
  reportController.getProductionReport
);

// ==================== CONFIGURACIÓN DE PAGOS ====================

// Obtener configuración pública de pagos
router.get('/payment/config',
  paymentController.getPaymentConfig
);

// Verificar estado de pagos
router.get('/payment/status',
  authRequired,
  roleRequired(['admin', 'manager']),
  paymentController.getPaymentStatus
);

// Estadísticas básicas de pagos
router.get('/payment/stats',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  validateRequest,
  paymentController.getBasicStats
);

export default router;