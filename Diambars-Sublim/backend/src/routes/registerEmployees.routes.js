// src/routes/registerEmployees.routes.js
import express from "express";
import registerEmployeesController from "../controllers/registerEmployees.controller.js";

const router = express.Router();

// Ruta para registrar un nuevo empleado
router.post("/", registerEmployeesController.registerEmployee);

export default router;
