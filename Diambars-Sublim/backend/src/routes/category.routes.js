import express from "express";
import multer from "multer";
import path from "path";
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";
import categoryController from "../controllers/category.controller.js";

const router = express.Router();

/**
 * Configuración de Multer para la subida de archivos
 * 
 * Almacena temporalmente los archivos en "public/uploads" y genera
 * nombres de archivo únicos basados en timestamp para evitar colisiones.
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // Almacenar en public/uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = path.extname(file.originalname);
    cb(null, `category-${uniqueSuffix}${fileExtension}`);
  },
});

// Configuración adicional de multer para validar tipo de archivo y tamaño
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de archivo no permitido. Solo se aceptan JPG, PNG, GIF y WEBP."), false);
    }
  } 
});

/**
 * Rutas públicas - Accesibles sin autenticación
 */
router.get("/", categoryController.getAllCategories);
router.get("/homepage", categoryController.getHomepageCategories);
router.get("/search", categoryController.searchCategories);
router.get("/:id", categoryController.getCategoryById);

/**
 * Rutas protegidas - Requieren autenticación y roles específicos
 * 
 * - Admin y Manager pueden crear y actualizar categorías
 * - Solo Admin puede eliminar categorías
 */
router.post(
  "/", 
  verifyToken, 
  checkRole("admin", "manager"), 
  upload.single("image"), 
  categoryController.createCategory
);

router.put(
  "/:id", 
  verifyToken, 
  checkRole("admin", "manager"), 
  upload.single("image"), 
  categoryController.updateCategory
);

router.delete(
  "/:id", 
  verifyToken, 
  checkRole("admin"), 
  categoryController.deleteCategory
);

export default router;