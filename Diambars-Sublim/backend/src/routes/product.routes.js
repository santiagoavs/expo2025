import express from "express";
import multer from "multer";
import path from "path";
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";
import productController from "../controllers/product.controller.js";

const router = express.Router();

// Configuración de Multer para productos (imágenes múltiples)
const storage = multer.diskStorage({
  destination: "public/uploads/products",
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp"];
    allowedMimes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Solo se permiten imágenes JPG, PNG o WEBP."), false);
  },
});

// --- Rutas Públicas ---
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.get("/:id/konva-config", productController.getKonvaConfig);

// --- Rutas Protegidas ---
router.post(
  "/",
  verifyToken,
  checkRole("admin", "manager"),
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
  ]),
  productController.createProduct
);

router.put(
  "/:id",
  verifyToken,
  checkRole("admin", "manager"),
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "additionalImages", maxCount: 5 },
  ]),
  productController.updateProduct
);

router.delete(
  "/:id",
  verifyToken,
  checkRole("admin"),
  productController.deleteProduct
);

export default router;