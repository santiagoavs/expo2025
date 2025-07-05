// src/routes/employees.routes.js
import express from "express";
import employeesController from "../controllers/employees.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { checkRole } from "../middlewares/checkRole.js";

const router = express.Router();

// Obtener empleados activos (solo Admin y Gerente pueden ver a todos)
router.get("/", verifyToken, employeesController.getEmployees);  //, checkRole("Admin", "Gerente")-->agregar filtro despues

// Obtener empleado por ID (Admin o Gerente pueden consultar cualquier ID)
router.get("/:id", verifyToken, checkRole("Admin", "Gerente"), employeesController.getEmployeeById);

// Actualizar información de un empleado (solo Admin o Gerente)
router.put("/:id", verifyToken, checkRole("Admin", "Gerente"), employeesController.updateEmployee);

// Cambiar contraseña (puede hacerlo cualquier empleado autenticado)
router.patch("/:id/password", verifyToken, employeesController.changeEmployeePassword);

// Inactivar empleado (solo Admin o Gerente)
router.delete("/:id", verifyToken, checkRole("Admin", "Gerente"), employeesController.inactivateEmployee);

export default router;
