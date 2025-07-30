import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import designController from "../controllers/design.controller.js";

const router = express.Router();

// --- Rutas Públicas ---
router.get("/", designController.getAllDesigns);
router.get("/user/:userId", designController.getUserDesigns);

// --- Rutas Protegidas (solo usuarios autenticados) ---
router.post("/", verifyToken, designController.createDesign);
router.put("/:id", verifyToken, designController.updateDesign);
router.delete("/:id", verifyToken, designController.deleteDesign);

export default router;