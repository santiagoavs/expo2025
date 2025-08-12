const express = require('express');
const router = express.Router();
const {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  togglePaymentMethod,
  getActivePaymentMethod
} = require('../controllers/paymentMethods.controller.js');

// Middleware de autenticación (asume que ya tienes uno)
const authMiddleware = require('../middleware/authMiddleware');

// Aplicar autenticación a todas las rutas
router.use(authMiddleware);

// Rutas principales
router.get('/', getPaymentMethods);
router.post('/', createPaymentMethod);
router.get('/active', getActivePaymentMethod);
router.put('/:id', updatePaymentMethod);
router.delete('/:id', deletePaymentMethod);
router.patch('/:id/toggle', togglePaymentMethod);

module.exports = router;