// routes/production.routes.js - Rutas para fotos de producción
import { Router } from 'express';
import productionController from '../controllers/production.controller.js';
import { authRequired, roleRequired } from '../middlewares/auth.middleware.js';
import { validateRequest, validateMongoId } from '../middlewares/validation.middleware.js';
import { body, param } from 'express-validator';
import multer from 'multer';
import path from 'path';

const router = Router();

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/temp/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `production-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// ==================== VALIDACIONES ====================

const productionValidations = {
  uploadPhoto: [
    param('orderId').isMongoId().withMessage('ID de orden inválido'),
    body('stage')
      .notEmpty().withMessage('Etapa es requerida')
      .isIn(['cutting', 'printing', 'pressing', 'quality_check', 'packaging'])
      .withMessage('Etapa inválida'),
    body('notes').optional().isString().withMessage('Notas deben ser texto'),
    body('isQualityPhoto').optional().isBoolean().withMessage('isQualityPhoto debe ser booleano')
  ],
  
  getPhotos: [
    param('orderId').isMongoId().withMessage('ID de orden inválido')
  ],
  
  deletePhoto: [
    param('orderId').isMongoId().withMessage('ID de orden inválido'),
    param('photoId').isMongoId().withMessage('ID de foto inválido')
  ]
};

// ==================== RUTAS ====================

/**
 * @route   POST /api/production/orders/:orderId/photos
 * @desc    Subir foto de producción
 * @access  Private (Admin/Manager only)
 */
router.post('/orders/:orderId/photos',
  authRequired,
  roleRequired(['admin', 'manager']),
  upload.single('photo'),
  productionValidations.uploadPhoto,
  validateRequest,
  productionController.uploadProductionPhoto
);

/**
 * @route   GET /api/production/orders/:orderId/photos
 * @desc    Obtener fotos de producción de una orden
 * @access  Private (Admin/Manager/Employee/Delivery)
 */
router.get('/orders/:orderId/photos',
  authRequired,
  roleRequired(['admin', 'manager', 'employee', 'delivery']), // Agregado delivery
  productionValidations.getPhotos,
  validateRequest,
  productionController.getProductionPhotos
);

/**
 * @route   DELETE /api/production/orders/:orderId/photos/:photoId
 * @desc    Eliminar foto de producción
 * @access  Private (Admin/Manager only)
 */
router.delete('/orders/:orderId/photos/:photoId',
  authRequired,
  roleRequired(['admin', 'manager']),
  productionValidations.deletePhoto,
  validateRequest,
  productionController.deleteProductionPhoto
);

export default router;
