// routes/paymentConfig.routes.js - Rutas para configuración de métodos de pago
import express from 'express';
import {
  getPaymentConfigs,
  getPublicPaymentConfig,
  upsertPaymentConfig,
  deletePaymentConfig,
  getPaymentStats
} from '../controllers/paymentConfig.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Rutas públicas
router.get('/public', getPublicPaymentConfig);

// Rutas protegidas (requieren autenticación)
router.use(authRequired);

// CRUD de configuraciones
router.get('/', getPaymentConfigs);
router.post('/', upsertPaymentConfig);
router.put('/:type', upsertPaymentConfig);
router.delete('/:type', deletePaymentConfig);

// Estadísticas
router.get('/stats', getPaymentStats);

export default router;
