// src/routes/auth.routes.js
import express from "express";
import authController from "../controllers/auth.controller.js";

const router = express.Router();

// Ruta para login 
router.post("/login", authController.login);

// Ruta para logout
router.post("/logout", authController.logout);

export default router;