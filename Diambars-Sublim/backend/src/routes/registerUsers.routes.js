// src/routes/registerUsers.routes.js
import express from "express";
import registerUsersController from "../controllers/registerUsers.controller.js";

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post("/", registerUsersController.registerUser);

export default router;