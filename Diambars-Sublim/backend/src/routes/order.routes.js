import express from "express";
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";
import orderController from "../controllers/order.controller.js";

const router = express.Router();

// --- Rutas protegidas por autenticación ---
// Crear pedido
router.post("/", verifyToken, orderController.createOrder);

// Obtener pedido específico
router.get("/:id", verifyToken, orderController.getOrderById);

// Listar todos los pedidos (filtrados según roles)
router.get("/", verifyToken, orderController.getAllOrders);

// --- Rutas protegidas para administradores ---
// Actualizar estado del pedido
router.patch(
  "/:id/status",
  verifyToken,
  checkRole("admin", "manager"),
  orderController.updateOrderStatus
);

// Confirmar pago
router.post(
  "/:id/confirm-payment",
  verifyToken,
  checkRole("admin", "manager"),
  orderController.confirmPayment
);

export default router;