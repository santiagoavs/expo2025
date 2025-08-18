// src/routes/auth.routes.js
import express from "express";
import authController from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { authRequired } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Ruta para verificar autenticación
router.get("/check", verifyToken, authController.checkAuth);
// Ruta para login
router.post("/login", authController.login);

// Ruta para logout
router.post("/logout", verifyToken, authController.logout);

router.get("/checkAuth", authRequired, authController.checkAuth);

export default router;