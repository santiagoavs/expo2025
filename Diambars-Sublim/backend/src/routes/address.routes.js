import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import addressController from "../controllers/address.controller.js";

const router = express.Router();

// --- Todas las rutas requieren autenticación ---
router.use(verifyToken);

// Crear dirección
router.post("/", addressController.createAddress);

// Obtener direcciones del usuario
router.get("/", addressController.getUserAddresses);

// Actualizar dirección
router.put("/:id", addressController.updateAddress);

// Eliminar dirección
router.delete("/:id", addressController.deleteAddress);

// Establecer dirección como predeterminada
router.patch("/:id/set-default", addressController.setDefaultAddress);

export default router;