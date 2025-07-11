import express from "express";
import verifyEmailController from "../controllers/verifyEmail.controller.js";

const router = express.Router();

// Verificar token de correo electrónico
router.get("/:token", verifyEmailController.verifyEmail);

// Reenviar correo de verificación
router.post("/resend", verifyEmailController.resendVerification);

export default router;