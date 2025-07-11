import express from "express";
import passwordRecoveryController from "../controllers/passwordRecovey.controller.js";

const router = express.Router();

// Ruta para solicitar código de recuperación
router.post("/request-code", passwordRecoveryController.requestRecoveryCode);

// Ruta para verificar código
router.post("/verify-code", passwordRecoveryController.verifyRecoveryCode);

// Ruta para establecer nueva contraseña
router.post("/reset-password", passwordRecoveryController.resetPassword);

export default router;