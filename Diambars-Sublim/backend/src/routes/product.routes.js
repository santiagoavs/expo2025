import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from 'url';
import fs from "fs";
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";
import productController from "../controllers/product.controller.js";

const router = express.Router();

// Configuración de directorios para subida de archivos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../public/uploads/products');

// Crear directorio si no existe
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de Multer para productos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP"), false);
  }
};

const upload = multer({
  storage,
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 6 // máximo 6 archivos (1 principal + 5 adicionales)
  },
  fileFilter
});

// Middleware específico para manejar errores de Multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'El archivo es demasiado grande. Máximo 5MB.'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Demasiados archivos. Máximo 6 archivos.'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          success: false,
          message: 'Campo de archivo inesperado.'
        });
      default:
        return res.status(400).json({
          success: false,
          message: `Error de carga: ${err.message}`
        });
    }
  }
  
  if (err.message && err.message.includes('Solo se permiten imágenes')) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next(err);
};

// Middleware para debug de multipart requests
const debugMultipart = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('🔧 DEBUG Multipart Request:', {
      method: req.method,
      url: req.url,
      contentType: req.headers['content-type'],
      contentLength: req.headers['content-length'],
      hasAuthHeader: !!req.headers.authorization,
      hasCookie: !!req.cookies.authToken,
      hasXAccessToken: !!req.headers['x-access-token']
    });
  }
  next();
};

// --- Rutas Públicas ---
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.get("/:id/konva-config", productController.getKonvaConfig);

// --- Rutas Protegidas (Admin) ---
router.post(
  "/",
  debugMultipart,     // Debug primero
  verifyToken,        // Autenticación (maneja cookies, headers y Authorization)
  checkRole("admin", "manager"), // Autorización
  upload.fields([     // Multer después de auth
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
  ]),
  handleMulterError,  // Manejo de errores de Multer
  productController.createProduct
);

router.put(
  "/:id",
  debugMultipart,     // Debug primero
  verifyToken,        // Autenticación
  checkRole("admin", "manager"), // Autorización
  upload.fields([     // Multer después de auth
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
  ]),
  handleMulterError,  // Manejo de errores de Multer
  productController.updateProduct
);

router.delete(
  "/:id",
  verifyToken,
  checkRole("admin"),
  productController.deleteProduct
);

export default router;