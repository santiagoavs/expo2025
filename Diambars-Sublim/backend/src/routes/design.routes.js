// routes/design.routes.js
import { Router } from "express";
import designController from "../controllers/design.controller.js";
import { authRequired, roleRequired } from "../middlewares/auth.middleware.js";
import { validateRequest, validateMongoId, validatePagination } from "../middlewares/validation.middleware.js";
import { body, param, query } from "express-validator";

const router = Router();

// ==================== VALIDACIONES ====================
const designValidations = {
  create: [
    body('productId')
      .notEmpty().withMessage('El ID del producto es requerido')
      .isMongoId().withMessage('ID de producto inválido'),
    body('elements')
      .isArray({ min: 1 }).withMessage('Debe proporcionar al menos un elemento'),
    body('productOptions')
      .optional()
      .isArray().withMessage('Las opciones del producto deben ser un array'),
    body('clientNotes')
      .optional()
      .isString().withMessage('Las notas deben ser texto')
      .isLength({ max: 1000 }).withMessage('Las notas no pueden exceder 1000 caracteres'),
    body('mode')
      .optional()
      .isIn(['simple', 'advanced']).withMessage('Modo inválido')
  ],
  
  submitQuote: [
    param('id').isMongoId().withMessage('ID de diseño inválido'),
    body('price')
      .notEmpty().withMessage('El precio es requerido')
      .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor que 0'),
    body('productionDays')
      .notEmpty().withMessage('Los días de producción son requeridos')
      .isInt({ min: 1, max: 30 }).withMessage('Los días de producción deben estar entre 1 y 30'),
    body('adminNotes')
      .optional()
      .isString().withMessage('Las notas deben ser texto')
      .isLength({ max: 1000 }).withMessage('Las notas no pueden exceder 1000 caracteres')
  ],
  
  respondToQuote: [
    param('id').isMongoId().withMessage('ID de diseño inválido'),
    body('accept')
      .notEmpty().withMessage('Debe especificar si acepta la cotización')
      .isBoolean().withMessage('accept debe ser true o false'),
    body('clientNotes')
      .optional()
      .isString().withMessage('Las notas deben ser texto')
      .isLength({ max: 500 }).withMessage('Las notas no pueden exceder 500 caracteres')
  ],
  
  update: [
    param('id').isMongoId().withMessage('ID de diseño inválido'),
    body('elements')
      .optional()
      .isArray().withMessage('Los elementos deben ser un array'),
    body('productOptions')
      .optional()
      .isArray().withMessage('Las opciones del producto deben ser un array'),
    body('name')
      .optional()
      .isString().withMessage('El nombre debe ser texto')
      .isLength({ min: 1, max: 100 }).withMessage('El nombre debe tener entre 1 y 100 caracteres'),
    body('clientNotes')
      .optional()
      .isString().withMessage('Las notas deben ser texto')
      .isLength({ max: 1000 }).withMessage('Las notas no pueden exceder 1000 caracteres')
  ],
  
  saveDraft: [
    body('productId')
      .notEmpty().withMessage('El ID del producto es requerido')
      .isMongoId().withMessage('ID de producto inválido'),
    body('elements')
      .optional()
      .isArray().withMessage('Los elementos deben ser un array'),
    body('name')
      .optional()
      .isString().withMessage('El nombre debe ser texto')
      .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres')
  ],
  
  clone: [
    param('id').isMongoId().withMessage('ID de diseño inválido'),
    body('name')
      .optional()
      .isString().withMessage('El nombre debe ser texto')
      .isLength({ min: 1, max: 100 }).withMessage('El nombre debe tener entre 1 y 100 caracteres')
  ]
};

// ==================== RUTAS DE CLIENTE ====================

// Crear nuevo diseño
router.post('/',
  authRequired,
  designValidations.create,
  validateRequest,
  designController.createDesign
);

// Guardar diseño como borrador
router.post('/draft',
  authRequired,
  designValidations.saveDraft,
  validateRequest,
  designController.saveDraft
);

// Obtener historial de diseños del usuario
router.get('/my-designs',
  authRequired,
  query('includeDetails').optional().isBoolean(),
  validateRequest,
  designController.getUserDesignHistory
);

// Obtener diseño específico
router.get('/:id',
  authRequired,
  validateMongoId('id'),
  designController.getDesignById
);

// Actualizar diseño (solo en estado draft)
router.put('/:id',
  authRequired,
  designValidations.update,
  validateRequest,
  designController.updateDesign
);

// Clonar/duplicar diseño
router.post('/:id/clone',
  authRequired,
  designValidations.clone,
  validateRequest,
  designController.cloneDesign
);

// Responder a cotización (cliente)
router.post('/:id/respond',
  authRequired,
  designValidations.respondToQuote,
  validateRequest,
  designController.respondToQuote
);

// ==================== RUTAS DE ADMINISTRADOR ====================

// Listar todos los diseños (con filtros avanzados para admin)
router.get('/',
  authRequired,
  roleRequired(['admin', 'manager']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('status').optional().isString(),
  query('product').optional().isMongoId(),
  query('user').optional().isMongoId(),
  query('search').optional().isString(),
  query('sort').optional().isString(),
  query('order').optional().isIn(['asc', 'desc']),
  validateRequest,
  designController.getAllDesigns
);

// Cotizar diseño (admin/manager)
router.post('/:id/quote',
  authRequired,
  roleRequired(['admin', 'manager']),
  designValidations.submitQuote,
  validateRequest,
  designController.submitQuote
);

export default router;