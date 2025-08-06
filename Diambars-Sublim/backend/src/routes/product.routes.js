import express from 'express';
import productController from '../controllers/product.controller.js';
import { verifyToken, checkUserType } from '../middlewares/auth.middleware.js';
import cloudinary from '../utils/cloudinary.js'; // ✅ Usar tu configuración

const router = express.Router();

// ===== RUTAS PÚBLICAS =====
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts);
router.get('/:id', productController.getProductById);
router.get('/:id/konva-config', productController.getKonvaConfig);
router.get('/:id/related', productController.getRelatedProducts);

// ===== RUTAS PROTEGIDAS =====
router.post('/', 
  verifyToken,
  checkUserType('admin', 'manager'),
  cloudinary.uploadProduct.fields([ // ✅ Usar tu configuración específica
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
  ]),
  productController.createProduct
);

router.put('/:id',
  verifyToken,
  checkUserType('admin', 'manager'),
  cloudinary.uploadProduct.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 5 }
  ]),
  productController.updateProduct
);

router.delete('/:id',
  verifyToken,
  checkUserType('admin'),
  productController.deleteProduct
);

router.patch('/:id/stats',
  verifyToken,
  checkUserType('admin', 'manager', 'employee'),
  productController.updateProductStats
);

// Ruta de desarrollo
if (process.env.NODE_ENV === 'development') {
  router.post('/dev/create-samples',
    verifyToken,
    checkUserType('admin'),
    productController.createSampleProducts
  );
}

export default router;