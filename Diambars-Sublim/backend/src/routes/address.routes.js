// routes/address.routes.js
import { Router } from "express";
import addressController from "../controllers/address.controller.js";
import { authRequired } from "../middlewares/auth.middleware.js";
import { validateRequest, validateMongoId } from "../middlewares/validation.middleware.js";
import { body, param } from "express-validator";

const router = Router();

// ==================== VALIDACIONES ====================
const addressValidations = {
  create: [
    body('recipient')
      .notEmpty().withMessage('El nombre del destinatario es requerido')
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('phoneNumber')
      .notEmpty().withMessage('El teléfono es requerido')
      .matches(/^[267]\d{7}$/).withMessage('Formato de teléfono inválido (debe ser de El Salvador)'),
    body('department')
      .notEmpty().withMessage('El departamento es requerido')
      .isString().withMessage('El departamento debe ser texto'),
    body('municipality')
      .notEmpty().withMessage('El municipio es requerido')
      .isString().withMessage('El municipio debe ser texto'),
    body('address')
      .notEmpty().withMessage('La dirección es requerida')
      .isLength({ min: 10, max: 200 }).withMessage('La dirección debe tener entre 10 y 200 caracteres'),
    body('label')
      .optional()
      .isLength({ max: 50 }).withMessage('La etiqueta no puede exceder 50 caracteres'),
    body('additionalDetails')
      .optional()
      .isLength({ max: 200 }).withMessage('Los detalles adicionales no pueden exceder 200 caracteres'),
    body('isDefault')
      .optional()
      .isBoolean().withMessage('isDefault debe ser true o false'),
    body('location.coordinates')
      .optional()
      .isArray({ min: 2, max: 2 }).withMessage('Las coordenadas deben ser un array de 2 números')
  ],
  
  update: [
    param('id').isMongoId().withMessage('ID de dirección inválido'),
    body('recipient')
      .optional()
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('phoneNumber')
      .optional()
      .matches(/^[267]\d{7}$/).withMessage('Formato de teléfono inválido (debe ser de El Salvador)'),
    body('department')
      .optional()
      .isString().withMessage('El departamento debe ser texto'),
    body('municipality')
      .optional()
      .isString().withMessage('El municipio debe ser texto'),
    body('address')
      .optional()
      .isLength({ min: 10, max: 200 }).withMessage('La dirección debe tener entre 10 y 200 caracteres'),
    body('label')
      .optional()
      .isLength({ max: 50 }).withMessage('La etiqueta no puede exceder 50 caracteres'),
    body('additionalDetails')
      .optional()
      .isLength({ max: 200 }).withMessage('Los detalles adicionales no pueden exceder 200 caracteres'),
    body('isDefault')
      .optional()
      .isBoolean().withMessage('isDefault debe ser true o false')
  ],
  
  validate: [
    body('department')
      .notEmpty().withMessage('El departamento es requerido')
      .isString().withMessage('El departamento debe ser texto'),
    body('municipality')
      .notEmpty().withMessage('El municipio es requerido')
      .isString().withMessage('El municipio debe ser texto'),
    body('address')
      .notEmpty().withMessage('La dirección es requerida')
      .isString().withMessage('La dirección debe ser texto')
  ]
};

// ==================== TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN ====================
router.use(authRequired);

// ==================== RUTAS PRINCIPALES ====================

// Crear nueva dirección
router.post('/',
  addressValidations.create,
  validateRequest,
  addressController.createAddress
);

// Obtener todas las direcciones del usuario
router.get('/',
  addressController.getUserAddresses
);

// Obtener dirección específica
router.get('/:id',
  validateMongoId('id'),
  addressController.getAddressById
);

// Actualizar dirección
router.put('/:id',
  addressValidations.update,
  validateRequest,
  addressController.updateAddress
);

// Eliminar dirección
router.delete('/:id',
  validateMongoId('id'),
  addressController.deleteAddress
);

// Establecer dirección como predeterminada
router.patch('/:id/set-default',
  validateMongoId('id'),
  addressController.setDefaultAddress
);

// ==================== RUTAS AUXILIARES ====================

// Validar dirección
router.post('/validate',
  addressValidations.validate,
  validateRequest,
  addressController.validateAddress
);

// Obtener tarifas de envío
router.get('/delivery/fees',
  addressController.getDeliveryFees
);

export default router;