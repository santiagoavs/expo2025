// routes/product.routes.js - RUTAS CORREGIDAS CON LOGGING
import { Router } from 'express';
import productController from '../controllers/product.controller.js';
import { authRequired, roleRequired } from '../middlewares/auth.middleware.js';
import { validateRequest, validateMongoId, validatePagination } from '../middlewares/validation.middleware.js';
import { 
  productLoggingMiddleware, 
  fileOperationLogger, 
  cloudinaryOperationLogger,
  requestSummaryLogger 
} from '../middlewares/loggin.middleware.js';
import cloudinary from '../utils/cloudinary.js';
import { body, param, query } from 'express-validator';

// ✅ IMPORTACIONES CORREGIDAS PARA ES6 MODULES
import fs from 'fs';
import path from 'path';

const router = Router();

// ==================== MIDDLEWARE GLOBAL PARA PRODUCTOS ====================
// Aplicar logging a todas las rutas de productos
router.use(productLoggingMiddleware);
router.use(requestSummaryLogger);

// ==================== VALIDACIONES SIMPLIFICADAS ====================
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
      .isString().withMessage('ID de categoría debe ser string')
      .isLength({ min: 1 }).withMessage('ID de categoría no puede estar vacío'),
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
      .isString().withMessage('ID de categoría debe ser string')
      .isLength({ min: 1 }).withMessage('ID de categoría no puede estar vacío'),
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
  query('category').optional().isString(),
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

// Crear producto - CON LOGGING MEJORADO
router.post('/',
  authRequired,
  roleRequired(['admin', 'manager']),
  // Middleware de logging específico para archivos
  fileOperationLogger,
  cloudinaryOperationLogger,
  // Multer para manejar archivos
  cloudinary.uploadProduct.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
  ]),
  // Logging adicional después de multer
  (req, res, next) => {
    const requestId = req.requestId || 'unknown';
    console.log(`📋 [${requestId}] Archivos procesados por Multer:`, {
      mainImage: req.files?.mainImage ? `${req.files.mainImage.length} archivo(s)` : 'No presente',
      additionalImages: req.files?.additionalImages ? `${req.files.additionalImages.length} archivo(s)` : 'No presente',
      totalArchivos: req.files ? Object.keys(req.files).reduce((total, key) => total + req.files[key].length, 0) : 0
    });
    next();
  },
  productValidations.create,
  validateRequest,
  productController.createProduct
);

// Actualizar producto
router.put('/:id',
  authRequired,
  roleRequired(['admin', 'manager']),
  fileOperationLogger,
  cloudinaryOperationLogger,
  cloudinary.uploadProduct.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
  ]),
  (req, res, next) => {
    const requestId = req.requestId || 'unknown';
    console.log(`📋 [${requestId}] Actualización de producto - Archivos:`, {
      mainImage: req.files?.mainImage ? 'Nueva imagen principal' : 'Sin cambios en imagen principal',
      additionalImages: req.files?.additionalImages ? `${req.files.additionalImages.length} nuevas imágenes adicionales` : 'Sin cambios en imágenes adicionales'
    });
    next();
  },
  productValidations.update,
  validateRequest,
  productController.updateProduct
);

// Eliminar producto
router.delete('/:id',
  authRequired,
  roleRequired(['admin']),
  validateMongoId('id'),
  cloudinaryOperationLogger, // Para logging de eliminación de imágenes
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
  (req, res, next) => {
    const requestId = req.requestId || 'unknown';
    console.log(`🎨 [${requestId}] Solicitando configuración del editor para producto: ${req.params.id}`);
    next();
  },
  productController.getEditorConfig || ((req, res) => {
    res.status(501).json({
      success: false,
      message: "Función de editor config no implementada aún",
      error: 'NOT_IMPLEMENTED'
    });
  })
);

// Vista previa de áreas (Admin)
router.post('/preview-areas',
  authRequired,
  roleRequired(['admin', 'manager']),
  body('areas').isArray().withMessage('Las áreas deben ser un array'),
  body('imageUrl').optional().isURL().withMessage('URL de imagen inválida'),
  validateRequest,
  (req, res, next) => {
    const requestId = req.requestId || 'unknown';
    console.log(`👁️ [${requestId}] Generando vista previa de áreas:`, {
      cantidadAreas: req.body.areas?.length || 0,
      tieneImagenUrl: !!req.body.imageUrl
    });
    next();
  },
  productController.previewAreas || ((req, res) => {
    res.status(501).json({
      success: false,
      message: "Función de preview areas no implementada aún",
      error: 'NOT_IMPLEMENTED'
    });
  })
);

// ==================== RUTAS DE DESARROLLO ====================
if (process.env.NODE_ENV === 'development') {
  // Crear productos de ejemplo
  router.post('/dev/create-samples',
    authRequired,
    roleRequired(['admin']),
    (req, res, next) => {
      const requestId = req.requestId || 'unknown';
      console.log(`🧪 [${requestId}] Creando productos de ejemplo para desarrollo`);
      next();
    },
    productController.createSampleProducts
  );
  
  // Ruta de debug para ver el estado de archivos temporales
  router.get('/dev/debug-temp-files',
    authRequired,
    roleRequired(['admin']),
    (req, res) => {
      // ✅ CORREGIDO: Usando import en lugar de require
      const tempDir = path.join(process.cwd(), 'public', 'uploads');
      
      try {
        const files = fs.readdirSync(tempDir);
        const fileDetails = files.map(file => {
          const filePath = path.join(tempDir, file);
          const stats = fs.statSync(filePath);
          return {
            name: file,
            size: `${(stats.size / 1024).toFixed(2)}KB`,
            created: stats.birthtime,
            modified: stats.mtime,
            ageMinutes: Math.floor((Date.now() - stats.mtime.getTime()) / 1000 / 60)
          };
        });
        
        res.json({
          success: true,
          data: {
            tempDirectory: tempDir,
            totalFiles: files.length,
            files: fileDetails
          }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error accessing temp directory',
          error: error.message
        });
      }
    }
  );
  
  // Ruta para limpiar archivos temporales manualmente
  router.post('/dev/cleanup-temp-files',
    authRequired,
    roleRequired(['admin']),
    (req, res) => {
      // ✅ CORREGIDO: Usando import en lugar de require
      const tempDir = path.join(process.cwd(), 'public', 'uploads');
      
      try {
        const files = fs.readdirSync(tempDir);
        let cleaned = 0;
        
        files.forEach(file => {
          const filePath = path.join(tempDir, file);
          const stats = fs.statSync(filePath);
          const ageMinutes = Math.floor((Date.now() - stats.mtime.getTime()) / 1000 / 60);
          
          // Eliminar archivos más antiguos de 30 minutos
          if (ageMinutes > 30) {
            fs.unlinkSync(filePath);
            cleaned++;
          }
        });
        
        res.json({
          success: true,
          message: `${cleaned} archivos temporales eliminados`,
          data: { cleanedFiles: cleaned }
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          message: 'Error cleaning temp files',
          error: error.message
        });
      }
    }
  );
}

// ==================== MANEJO DE ERRORES ESPECÍFICO ====================

// Middleware de manejo de errores para rutas de productos
router.use((error, req, res, next) => {
  const requestId = req.requestId || 'unknown';
  
  console.error(`❌ [${requestId}] Error en ruta de productos:`, {
    message: error.message,
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    route: req.route?.path,
    method: req.method,
    params: req.params,
    query: req.query
  });
  
  // Limpiar archivos temporales en caso de error
  if (req.files) {
    // ✅ CORREGIDO: fs ya está importado arriba
    Object.values(req.files).flat().forEach(file => {
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          console.log(`🧹 [${requestId}] Archivo temporal limpiado después de error: ${file.path}`);
        }
      } catch (cleanupError) {
        console.error(`⚠️ [${requestId}] Error limpiando archivo temporal: ${cleanupError.message}`);
      }
    });
  }
  
  // Determinar tipo de error y respuesta apropiada
  let statusCode = 500;
  let message = 'Error interno del servidor';
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = 'El archivo es demasiado grande. Máximo 5MB permitido.';
  } else if (error.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
    message = 'Demasiados archivos.';
  } else if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = 'Campo de archivo inesperado.';
  } else if (error.code === 'INVALID_FILE_TYPE') {
    statusCode = 400;
    message = error.message;
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Error de validación';
  } else if (error.name === 'CastError') {
    statusCode = 400;
    message = 'ID inválido';
  } else if (error.message) {
    statusCode = 400;
    message = error.message;
  }
  
  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? {
      type: error.name || 'UnknownError',
      code: error.code,
      details: error.message,
      stack: error.stack
    } : undefined,
    requestId
  });
});

export default router;