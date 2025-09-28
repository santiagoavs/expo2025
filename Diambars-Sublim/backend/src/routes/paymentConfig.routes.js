// routes/paymentConfig.routes.js - Rutas para configuración de métodos de pago
import express from 'express';
import {
  getPaymentConfigs,
  getAvailablePaymentMethods,
  getPaymentConfigByType,
  upsertPaymentConfig,
  updatePaymentConfig,
  deletePaymentConfig,
  getPaymentConfigStats
} from '../controllers/paymentConfig.controller.js';
import { authRequired } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Ruta pública para obtener métodos disponibles (SIN AUTENTICACIÓN)
router.get('/public/available', getAvailablePaymentMethods);

// Rutas protegidas (requieren autenticación)
router.use(authRequired);

// CRUD de configuraciones
router.get('/', getPaymentConfigs);
router.get('/stats', getPaymentConfigStats);
router.get('/:type', getPaymentConfigByType);
router.post('/', upsertPaymentConfig);
router.put('/:type', updatePaymentConfig);
router.delete('/:type', deletePaymentConfig);

export default router;
