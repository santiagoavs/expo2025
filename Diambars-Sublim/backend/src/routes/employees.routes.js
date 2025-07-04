// src/routes/employees.routes.js
import express from "express";
import employeesController from "../controllers/employees.controller.js";

const router = express.Router();

// Obtener empleados activos
router.get("/", employeesController.getEmployees);

// Actualizar información general de empleado
router.put("/:id", employeesController.putEmployees);

// Inactivar (soft delete) un empleado
router.delete("/:id", employeesController.inactivateEmployee);

// Cambiar contraseña de un empleado
router.patch("/:id/password", employeesController.changeEmployeePassword);

export default router;
