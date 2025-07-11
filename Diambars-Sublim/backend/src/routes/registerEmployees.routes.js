import express from "express";
import registerEmployeesController from "../controllers/registerEmployees.controller.js";
import { verifyToken, checkRole, checkUserType, checkAdminUniqueness } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Añadir middleware temporal de depuración
router.use((req, res, next) => {
  console.log("Headers de autorización:", req.headers.authorization);
  console.log("Cookies:", req.cookies);
  console.log("Usuario en la solicitud:", req.user);
  next();
});

// Ruta para registrar un nuevo empleado (aceptar tanto "Admin" como "admin")
router.post("/", 
  verifyToken, 
  checkUserType("employee"),
  checkRole("Admin", "admin"), // Aceptar ambas formas para mayor compatibilidad
  checkAdminUniqueness,
  registerEmployeesController.registerEmployee
);

export default router;