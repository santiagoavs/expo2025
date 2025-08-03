import express from "express";
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";
import designController from "../controllers/design.controller.js";

const router = express.Router();

// --- Rutas protegidas por autenticación ---
// Crear diseño (cualquier usuario autenticado)
router.post("/", verifyToken, designController.createDesign);

// Obtener diseño específico (propietario o admin)
router.get("/:id", verifyToken, designController.getDesignById);

// Listar todos los diseños (filtrados según roles)
router.get("/", verifyToken, designController.getAllDesigns);

// Actualizar diseño (solo en estado draft)
router.put("/:id", verifyToken, designController.updateDesign);

// --- Rutas protegidas para administradores ---
// Cotizar diseño
router.post(
  "/:id/quote",
  verifyToken,
  checkRole("admin", "manager"),
  designController.submitQuote
);

// --- Rutas para responder a cotizaciones (cliente) ---
router.post(
  "/:id/respond",
  verifyToken,
  designController.respondToQuote
);

export default router;