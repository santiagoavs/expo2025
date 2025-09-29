// routes/payment.routes.js - Rutas para pagos con Wompi
import { Router } from "express";
import { authRequired } from "../middlewares/auth.middleware.js";
import { validateRequest, validateMongoId } from "../middlewares/validation.middleware.js";
import { body, param } from "express-validator";
import paymentController from "../controllers/payment.controller.js";

const router = Router();

// Crear pago
router.post('/create',
  authRequired,
  body('orderId')
    .isMongoId()
    .withMessage('ID de orden inválido'),
  body('paymentMethod')
    .notEmpty()
    .withMessage('Método de pago requerido'),
  validateRequest,
  paymentController.createPayment
);

// Obtener métodos de pago disponibles
router.get('/methods',
  authRequired,
  paymentController.getPaymentMethods
);

// Verificar estado de pago
router.get('/status/:orderId',
  authRequired,
  validateMongoId('orderId'),
  paymentController.getPaymentStatus
);

// Listar pagos con paginación
router.get('/',
  authRequired,
  paymentController.listPayments
);

// Obtener transferencias pendientes
router.get('/transfers/pending',
  authRequired,
  paymentController.getPendingTransfers
);

// Webhook de Wompi (sin autenticación)
router.post('/wompi/webhook',
  paymentController.handleWompiWebhook
);

export default router;