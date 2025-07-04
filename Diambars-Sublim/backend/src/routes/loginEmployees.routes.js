// src/routes/loginEmployees.routes.js
import express from "express";
import loginEmployeesController from "../controllers/loginEmployees.controller.js";
import logoutEmployeesController from "../controllers/logoutEmployees.controller.js";

const router = express.Router();

// Login de empleados (y superadmin)
router.post("/login", loginEmployeesController.login);

// Logout de empleados
router.post("/logout", logoutEmployeesController.logout);

export default router;
