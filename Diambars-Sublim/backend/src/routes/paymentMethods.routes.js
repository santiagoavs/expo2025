// routes/paymentMethods.routes.js - Rutas para métodos de pago de usuarios
import express from 'express';
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  togglePaymentMethod,
  getActivePaymentMethod
} from '../controllers/paymentMethods.controller.js';
import { authRequired, ownershipRequired } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Aplicar autenticación a todas las rutas
router.use(authRequired);

// Rutas principales (solo para usuarios autenticados)
router.get('/', getPaymentMethods);
router.post('/', createPaymentMethod);
router.get('/active', getActivePaymentMethod);
router.put('/:id', updatePaymentMethod);
router.delete('/:id', deletePaymentMethod);
router.patch('/:id/toggle', togglePaymentMethod);

export default router;