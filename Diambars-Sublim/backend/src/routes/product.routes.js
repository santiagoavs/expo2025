// routes/product.routes.js
import { Router } from 'express';
import productController from '../controllers/product.controller.js';
import { authRequired, roleRequired } from '../middlewares/auth.middleware.js';
import { validateRequest, validateMongoId, validatePagination } from '../middlewares/validation.middleware.js';
import cloudinary from '../utils/cloudinary.js';
import { body, param, query } from 'express-validator';

const router = Router();

// ==================== VALIDACIONES ====================
const productValidations = {
  create: [
    body('name')
      .notEmpty().withMessage('El nombre del producto es requerido')
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('description')
      .optional()
      .isLength({ max: 1000 }).withMessage('La descripción no puede exceder 1000 caracteres'),
    body('categoryId')
      .notEmpty().withMessage('La categoría es requerida')
      .isMongoId().withMessage('ID de categoría inválido'),
    body('basePrice')
      .notEmpty().withMessage('El precio base es requerido')
      .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor que 0'),
    body('productionTime')
      .optional()
      .isInt({ min: 1, max: 30 }).withMessage('El tiempo de producción debe estar entre 1 y 30 días'),
    body('isActive')
      .optional()
      .isBoolean().withMessage('isActive debe ser true o false'),
    body('featured')
      .optional()
      .isBoolean().withMessage('featured debe ser true o false')
  ],
  
  update: [
    param('id').isMongoId().withMessage('ID de producto inválido'),
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
    body('description')
      .optional()
      .isLength({ max: 1000 }).withMessage('La descripción no puede exceder 1000 caracteres'),
    body('categoryId')
      .optional()
      .isMongoId().withMessage('ID de categoría inválido'),
    body('basePrice')
      .optional()
      .isFloat({ min: 0.01 }).withMessage('El precio debe ser mayor que 0'),
    body('productionTime')
      .optional()
      .isInt({ min: 1, max: 30 }).withMessage('El tiempo de producción debe estar entre 1 y 30 días'),
    body('isActive')
      .optional()
      .isBoolean().withMessage('isActive debe ser true o false')
  ],
  
  updateStats: [
    param('id').isMongoId().withMessage('ID de producto inválido'),
    body('action')
      .notEmpty().withMessage('La acción es requerida')
      .isIn(['view', 'design', 'order']).withMessage('Acción inválida')
  ]
};

// ==================== RUTAS PÚBLICAS ====================

// Obtener todos los productos con filtros
router.get('/', 
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('category').optional().isMongoId(),
  query('isActive').optional().isBoolean(),
  query('featured').optional().isBoolean(),
  query('search').optional().isString(),
  query('sort').optional().isIn(['newest', 'oldest', 'price_asc', 'price_desc', 'name_asc', 'name_desc']),
  validateRequest,
  productController.getAllProducts
);

// Buscar productos
router.get('/search',
  query('q').notEmpty().withMessage('El término de búsqueda es requerido'),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validateRequest,
  productController.searchProducts
);

// Obtener producto específico
router.get('/:id',
  validateMongoId('id'),
  productController.getProductById
);

// Obtener configuración Konva para un producto
router.get('/:id/konva-config',
  validateMongoId('id'),
  query('mode').optional().isString(),
  query('guides').optional().isBoolean(),
  query('grid').optional().isBoolean(),
  productController.getKonvaConfig
);

// Obtener productos relacionados
router.get('/:id/related',
  validateMongoId('id'),
  query('limit').optional().isInt({ min: 1, max: 20 }),
  validateRequest,
  productController.getRelatedProducts
);

// ==================== RUTAS DE ADMINISTRADOR ====================

// Crear producto
router.post('/',
  authRequired,
  roleRequired(['admin', 'manager']),
  cloudinary.uploadProduct.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
  ]),
  productValidations.create,
  validateRequest,
  productController.createProduct
);

// Actualizar producto
router.put('/:id',
  authRequired,
  roleRequired(['admin', 'manager']),
  cloudinary.uploadProduct.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
  ]),
  productValidations.update,
  validateRequest,
  productController.updateProduct
);

// Eliminar producto
router.delete('/:id',
  authRequired,
  roleRequired(['admin']),
  validateMongoId('id'),
  productController.deleteProduct
);

// Actualizar estadísticas de producto
router.patch('/:id/stats',
  authRequired,
  roleRequired(['admin', 'manager', 'employee']),
  productValidations.updateStats,
  validateRequest,
  productController.updateProductStats
);

// Obtener configuración para editor de áreas (Admin)
router.get('/:id/editor-config',
  authRequired,
  roleRequired(['admin', 'manager']),
  validateMongoId('id'),
  productController.getEditorConfig
);

// Vista previa de áreas (Admin)
router.post('/preview-areas',
  authRequired,
  roleRequired(['admin', 'manager']),
  body('areas').isArray().withMessage('Las áreas deben ser un array'),
  body('imageUrl').optional().isURL().withMessage('URL de imagen inválida'),
  validateRequest,
  productController.previewAreas
);

// ==================== RUTAS DE DESARROLLO ====================
if (process.env.NODE_ENV === 'development') {
  // Crear productos de ejemplo
  router.post('/dev/create-samples',
    authRequired,
    roleRequired(['admin']),
    productController.createSampleProducts
  );
}

export default router;