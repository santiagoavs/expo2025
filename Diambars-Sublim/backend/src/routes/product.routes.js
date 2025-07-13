import express from "express";
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";
import productController from "../controllers/product.controller.js";
import cloudinary from "../utils/cloudinary.js";

const router = express.Router();

/**
 * Rutas para productos
 */
// Obtener un producto específico por ID o slug (público)
router.get("/:id", productController.getProductById);

// Rutas protegidas
router.post(
  "/",
  verifyToken,
  checkRole("admin", "manager"),
  cloudinary.upload.single("mainImage"),
  productController.createProduct
);

router.get(
  "/",
  verifyToken,
  checkRole("admin", "manager", "employee", "warehouse"),
  productController.getAllProducts
);

router.put(
  "/:id",
  verifyToken,
  checkRole("admin", "manager"),
  cloudinary.upload.single("mainImage"),
  productController.updateProduct
);

router.put(
  "/variant/:id",
  verifyToken,
  checkRole("admin", "manager", "warehouse"),
  cloudinary.upload.single("image"),
  productController.updateVariant
);

router.delete(
  "/:id",
  verifyToken,
  checkRole("admin"),
  productController.deleteProduct
);

export default router;