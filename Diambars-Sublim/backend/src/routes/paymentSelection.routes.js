// routes/paymentSelection.routes.js - Rutas para selección de métodos de pago
import express from 'express';
import {
  getAvailableMethods,
  validateMethod,
  processOrderPayment,
  getPaymentStatus
} from '../controllers/paymentSelection.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authRequired);

// Obtener métodos disponibles para el usuario
router.get('/available', getAvailableMethods);

// Validar método de pago seleccionado
router.post('/validate', validateMethod);

// Procesar pago para una orden específica
router.post('/orders/:orderId/process', processOrderPayment);

// Obtener estado de pago de una orden
router.get('/orders/:orderId/status', getPaymentStatus);

export default router;
