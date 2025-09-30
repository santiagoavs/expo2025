// routes/order.routes.js - REORGANIZADO Y SIMPLIFICADO
import { Router } from "express";
import multer from 'multer';
import path from 'path';
import orderController from "../controllers/order.controller.js";
import paymentController from "../controllers/payment.controller.js";
import reportController from "../controllers/report.controller.js";
import { authRequired, roleRequired } from "../middlewares/auth.middleware.js";
import { validateRequest, validateMongoId } from "../middlewares/validation.middleware.js";
import { body, param, query } from "express-validator";

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'production-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

const router = Router();

// ==================== WEBHOOKS (SIN AUTENTICACIÓN) ====================
router.post('/webhook/wompi', paymentController.handleWompiWebhook);

// ==================== RUTAS DE PEDIDOS ====================

// ✅ Obtener las órdenes del usuario actual
router.get('/user/me',
  authRequired,
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isString(),
  query('sort').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']),
  validateRequest,
  orderController.getMyOrders
);

// ✅ NUEVO: Obtener todas las órdenes (con filtros y paginación) - Solo admin
router.get('/',
  authRequired,
  roleRequired(['admin', 'manager']), // Solo admins pueden ver todas las órdenes
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isString(),
  query('deliveryType').optional().custom((value) => {
    if (value === '' || value === undefined || value === null) return true;
    return ['delivery', 'meetup'].includes(value);
  }),
  query('paymentStatus').optional().custom((value) => {
    if (value === '' || value === undefined || value === null) return true;
    return ['pending', 'paid', 'failed'].includes(value);
  }),
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

// ==================== NUEVOS ENDPOINTS ====================

// Obtener detalles de pago de una orden
router.get('/:id/payment-details',
  authRequired,
  validateMongoId('id'),
  orderController.getOrderPaymentDetails
);

// Obtener línea de tiempo de una orden (para usuarios)
router.get('/:id/timeline',
  authRequired,
  validateMongoId('id'),
  orderController.getOrderTimeline
);

// ==================== RUTAS DE PAGOS ====================

// NOTA: Las rutas de pago han sido movidas a /api/payments/
// Ver src/routes/payment.routes.js para las nuevas rutas de pago

// Subir foto de producción
router.post('/:id/upload-photo',
  authRequired,
  validateMongoId('id'),
  upload.single('photo'),
  orderController.uploadProductionPhoto
);

// Obtener datos de control de calidad
router.get('/:id/quality-control',
  authRequired,
  validateMongoId('id'),
  orderController.getQualityControlData
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

// NOTA: Las rutas de configuración y estadísticas de pagos han sido movidas a /api/payments/
// Ver src/routes/payment.routes.js para las nuevas rutas de pago

// ==================== GESTIÓN DE ESTADOS Y PAGOS ====================

// Cambiar estado de orden
router.put('/:id/status',
  authRequired,
  validateMongoId('id'),
  body('newStatus')
    .notEmpty()
    .withMessage('Nuevo estado requerido'),
  validateRequest,
  orderController.changeOrderStatus
);

// Registrar pago en efectivo
router.post('/:id/cash-payment',
  authRequired,
  validateMongoId('id'),
  body('amountReceived')
    .isNumeric()
    .withMessage('Monto recibido debe ser numérico'),
  body('changeGiven')
    .optional()
    .isNumeric()
    .withMessage('Cambio debe ser numérico'),
  validateRequest,
  orderController.registerCashPayment
);

// Registrar devolución
router.post('/:id/return',
  authRequired,
  validateMongoId('id'),
  body('returnReason')
    .notEmpty()
    .withMessage('Razón de devolución requerida'),
  body('returnDescription')
    .notEmpty()
    .withMessage('Descripción de devolución requerida'),
  body('refundAmount')
    .optional()
    .isNumeric()
    .withMessage('Monto de reembolso debe ser numérico'),
  validateRequest,
  orderController.registerReturn
);

export default router;