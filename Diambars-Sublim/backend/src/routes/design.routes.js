import express from "express";
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";
import designController from "../controllers/design.controller.js";

const router = express.Router();

// --- Rutas Públicas (solo para diseños aprobados) ---
router.get("/:id", designController.getDesignById);

// --- Rutas Protegidas ---
router.post("/", verifyToken, designController.createDesign);

// Cotización (admin)
router.post(
  "/:id/quote",
  verifyToken,
  checkRole("admin", "manager"),
  designController.submitQuote
);

// Respuesta del cliente
router.post(
  "/:id/respond-quote",
  verifyToken,
  designController.respondToQuote
);

export default router;