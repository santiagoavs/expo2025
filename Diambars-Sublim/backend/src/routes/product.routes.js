import express from "express";
import multer from "multer";
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";
import productController from "../controllers/product.controller.js";

const router = express.Router();
const upload = multer({ dest: "public/uploads/products" }); // Configuración simple de Multer

// --- Rutas Públicas ---
router.get("/", productController.getAllProducts);
router.get("/featured", productController.getFeaturedProducts);
router.get("/:id", productController.getProductById);

// --- Rutas Protegidas ---
router.post(
  "/",
  verifyToken,
  checkRole("admin", "manager"),
  upload.array("images", 5), // Hasta 5 imágenes
  productController.createProduct
);

router.put(
  "/:id",
  verifyToken,
  checkRole("admin", "manager"),
  upload.array("images", 5),
  productController.updateProduct
);

router.delete(
  "/:id",
  verifyToken,
  checkRole("admin"),
  productController.deleteProduct
);

export default router;