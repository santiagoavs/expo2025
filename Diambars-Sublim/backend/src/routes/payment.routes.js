// routes/payment.routes.js - Rutas para la NUEVA arquitectura
import { Router } from 'express';
import { 
  processOrderPayment,
  confirmPayment,
  submitTransferProof,
  cancelPayment,
  getOrderPaymentStatus,
  getPaymentDetails,
  listPayments,
  getPendingTransfers,
  generateCashReport,
  handleWompiWebhook,
  resendTransferInstructions,
  rejectTransfer,
  getCustomerPaymentHistory
} from '../controllers/payment.controller.js';
import { authRequired, roleRequired } from '../middlewares/auth.middleware.js';
import multer from 'multer';
import { body, param, query } from 'express-validator';
import { validateRequest } from '../middlewares/validation.middleware.js';

const router = Router();

// Configurar multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/orders/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    // Permitir solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// ==================== WEBHOOKS (SIN AUTH) ====================

/**
 * @route   POST /api/payments/webhooks/wompi
 * @desc    Webhook de Wompi (DEBE IR PRIMERO)
 * @access  Public (pero con validación interna)
 */
router.post('/webhooks/wompi', handleWompiWebhook);

// ==================== PROCESAMIENTO DE PAGOS ====================

/**
 * @route   POST /api/payments/orders/:orderId/process
 * @desc    Procesar cualquier tipo de pago
 * @access  Private (Users + Admins)
 */
router.post('/orders/:orderId/process',
  authRequired,
  [
    param('orderId').isMongoId().withMessage('ID de orden inválido'),
    body('method')
      .notEmpty().withMessage('Método de pago requerido')
      .isIn(['wompi', 'cash', 'bank_transfer']).withMessage('Método inválido'),
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Monto inválido'),
    body('timing').optional().isIn(['advance', 'on_delivery']).withMessage('Timing inválido'),
    body('paymentType').optional().isIn(['full', 'partial', 'advance_deposit']).withMessage('Tipo inválido'),
    body('percentage').optional().isInt({ min: 1, max: 100 }).withMessage('Porcentaje inválido')
  ],
  validateRequest,
  processOrderPayment
);

/**
 * @route   POST /api/payments/:paymentId/confirm
 * @desc    Confirmar pago (efectivo/transferencia)
 * @access  Private (Admin only)
 */
router.post('/:paymentId/confirm',
  authRequired,
  roleRequired(['admin', 'manager', 'employee']),
  [
    param('paymentId').isMongoId().withMessage('ID de pago inválido'),
    body('receivedAmount').optional().isFloat({ min: 0.01 }).withMessage('Monto recibido inválido'),
    body('isApproved').optional().isBoolean().withMessage('Aprobación debe ser true/false'),
    body('verificationNotes').optional().isLength({ max: 500 }).withMessage('Notas muy largas')
  ],
  validateRequest,
  confirmPayment
);

/**
 * @route   POST /api/payments/:paymentId/transfer-proof
 * @desc    Subir comprobante de transferencia
 * @access  Private (Users only)
 */
router.post('/:paymentId/transfer-proof',
  authRequired,
  uploadMiddleware.single('proof'),
  [
    param('paymentId').isMongoId().withMessage('ID de pago inválido'),
    body('transferDate').optional().isISO8601().withMessage('Fecha inválida'),
    body('bankReference').optional().isLength({ min: 1, max: 100 }).withMessage('Referencia inválida'),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notas muy largas')
  ],
  validateRequest,
  submitTransferProof
);

/**
 * @route   POST /api/payments/:paymentId/cancel
 * @desc    Cancelar pago
 * @access  Private (Users + Admins)
 */
router.post('/:paymentId/cancel',
  authRequired,
  [
    param('paymentId').isMongoId().withMessage('ID de pago inválido'),
    body('reason').notEmpty().withMessage('Motivo de cancelación requerido')
  ],
  validateRequest,
  cancelPayment
);

// ==================== CONSULTAS ====================

/**
 * @route   GET /api/payments/orders/:orderId/status
 * @desc    Estado de pagos de una orden
 * @access  Private (Users + Admins)
 */
router.get('/orders/:orderId/status',
  authRequired,
  [param('orderId').isMongoId().withMessage('ID de orden inválido')],
  validateRequest,
  getOrderPaymentStatus
);

/**
 * @route   GET /api/payments/:paymentId
 * @desc    Detalles de un pago
 * @access  Private (Users + Admins)
 */
router.get('/:paymentId',
  authRequired,
  [param('paymentId').isMongoId().withMessage('ID de pago inválido')],
  validateRequest,
  getPaymentDetails
);

/**
 * @route   GET /api/payments
 * @desc    Listar pagos (admin)
 * @access  Private (Admin only)
 */
router.get('/',
  authRequired,
  roleRequired(['admin', 'manager', 'employee']),
  [
    query('status').optional().isIn(['pending', 'processing', 'completed', 'failed', 'cancelled']).withMessage('Estado inválido'),
    query('method').optional().isIn(['wompi', 'cash', 'bank_transfer']).withMessage('Método inválido'),
    query('page').optional().isInt({ min: 1 }).withMessage('Página inválida'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Límite inválido')
  ],
  validateRequest,
  listPayments
);

// ==================== MÉTODOS ESPECÍFICOS ====================

/**
 * @route   GET /api/payments/transfers/pending
 * @desc    Transferencias pendientes
 * @access  Private (Admin only)
 */
router.get('/transfers/pending',
  authRequired,
  roleRequired(['admin', 'manager', 'employee']),
  getPendingTransfers
);

/**
 * @route   GET /api/payments/reports/cash
 * @desc    Reporte de efectivo
 * @access  Private (Admin only)
 */
router.get('/reports/cash',
  authRequired,
  roleRequired(['admin', 'manager']),
  [
    query('date').optional().isISO8601().withMessage('Fecha inválida'),
    query('startDate').optional().isISO8601().withMessage('Fecha inicio inválida'),
    query('endDate').optional().isISO8601().withMessage('Fecha fin inválida')
  ],
  validateRequest,
  generateCashReport
);

/**
 * @route   POST /api/payments/:paymentId/resend-instructions
 * @desc    Reenviar instrucciones de transferencia
 * @access  Private (Users only)
 */
router.post('/:paymentId/resend-instructions',
  authRequired,
  [param('paymentId').isMongoId().withMessage('ID de pago inválido')],
  validateRequest,
  resendTransferInstructions
);

/**
 * @route   POST /api/payments/:paymentId/reject
 * @desc    Rechazar transferencia
 * @access  Private (Admin only)
 */
router.post('/:paymentId/reject',
  authRequired,
  roleRequired(['admin', 'manager', 'employee']),
  [
    param('paymentId').isMongoId().withMessage('ID de pago inválido'),
    body('reason').notEmpty().withMessage('Motivo requerido')
  ],
  validateRequest,
  rejectTransfer
);

/**
 * @route   GET /api/payments/customers/:userId/history
 * @desc    Historial de cliente
 * @access  Private (Admin only)
 */
router.get('/customers/:userId/history',
  authRequired,
  roleRequired(['admin', 'manager', 'employee']),
  [param('userId').isMongoId().withMessage('ID de usuario inválido')],
  validateRequest,
  getCustomerPaymentHistory
);

// ==================== CONFIGURACIÓN PÚBLICA ====================

/**
 * @route   GET /api/payments/config/methods
 * @desc    Métodos disponibles
 * @access  Private
 */
router.get('/config/methods',
  authRequired,
  async (req, res) => {
    try {
      const { paymentProcessor } = await import('../services/payment/PaymentProcessor.js');
      const methods = paymentProcessor.getAvailableMethods();
      
      const methodsConfig = {};
      for (const method of methods) {
        const provider = paymentProcessor.getProvider(method);
        if (provider.getPublicConfig) {
          methodsConfig[method] = provider.getPublicConfig();
        } else {
          methodsConfig[method] = { available: true };
        }
      }
      
      res.json({
        success: true,
        data: {
          availableMethods: methods,
          config: methodsConfig
        }
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo configuración'
      });
    }
  }
);

/**
 * @route   GET /api/payments/config/bank-accounts
 * @desc    Cuentas bancarias
 * @access  Private
 */
router.get('/config/bank-accounts',
  authRequired,
  async (req, res) => {
    try {
      const { paymentProcessor } = await import('../services/payment/PaymentProcessor.js');
      const bankProvider = paymentProcessor.getProvider('bank_transfer');
      const bankConfig = await bankProvider.getBankAccountsConfig();
      
      const publicAccounts = bankConfig.accounts.map(account => ({
        bankName: account.bankName,
        accountType: account.accountType,
        accountNumber: account.accountNumber,
        accountHolder: account.accountHolder,
        swift: account.swift,
        instructions: account.instructions
      }));
      
      res.json({
        success: true,
        data: { accounts: publicAccounts }
      });
      
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo cuentas bancarias'
      });
    }
  }
);

export default router;