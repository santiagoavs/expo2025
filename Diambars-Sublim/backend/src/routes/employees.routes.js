import express from "express";
import employeesController from "../controllers/employees.controller.js";
import { verifyToken, checkRole, checkUserType } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Obtener empleados activos (solo Admin y Manager pueden ver a todos)
router.get("/", 
  verifyToken, 
  checkUserType("employee", "admin"), // ← CORREGIDO: Permitir admin
  checkRole("Admin", "admin", "Manager", "manager"), 
  employeesController.getEmployees
);

// Obtener empleado por ID (Admin o Manager pueden consultar cualquier ID)
router.get("/:id", 
  verifyToken, 
  checkUserType("employee", "admin"), // ← CORREGIDO: Permitir admin
  checkRole("Admin", "admin", "Manager", "manager"), 
  employeesController.getEmployeeById
);

// Actualizar información de un empleado (solo Admin o Manager)
router.put("/:id", 
  verifyToken, 
  checkUserType("employee", "admin"), // ← CORREGIDO: Permitir admin
  checkRole("Admin", "admin", "Manager", "manager"), 
  employeesController.updateEmployee
);

// Cambiar contraseña (puede hacerlo cualquier empleado autenticado sobre su propia cuenta)
router.patch("/:id/password", 
  verifyToken, 
  checkUserType("employee", "admin"), // ← CORREGIDO: Permitir admin
  (req, res, next) => {
    // Permitir cambiar contraseña solo de su propia cuenta
    // a menos que sea Admin o Manager
    if (req.user.id === req.params.id || 
        ["admin", "Admin", "manager", "Manager"].some(role => 
            req.user.role.toLowerCase() === role.toLowerCase())) {
      next();
    } else {
      return res.status(403).json({ 
        message: "Solo puedes cambiar tu propia contraseña" 
      });
    }
  }, 
  employeesController.changeEmployeePassword
);

// Inactivar empleado (solo Admin o Manager)
router.delete("/:id", 
  verifyToken, 
  checkUserType("employee", "admin"), // ← CORREGIDO: Permitir admin
  checkRole("Admin", "admin", "Manager", "manager"), 
  employeesController.inactivateEmployee
);

// Eliminar empleado permanentemente (solo Admin)
router.delete("/:id/hard", 
  verifyToken, 
  checkUserType("employee", "admin"), 
  checkRole("Admin", "admin"), 
  employeesController.hardDeleteEmployee
);

export default router;