// src/routes/users.routes.js
import express from "express";
import usersController from "../controllers/users.controller.js";
import { verifyToken, checkRole, checkUserType } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Rutas generales (requieren autenticación)
router.get("/", verifyToken, checkRole("Admin"), usersController.getUsers);
router.get("/:id", verifyToken, usersController.getUserById);
router.put("/:id", verifyToken, usersController.updateUser);
router.patch("/:id/password", verifyToken, usersController.changeUserPassword);
router.delete("/:id", verifyToken, checkRole("Admin"), usersController.inactivateUser);

// Rutas de wishlist
router.get("/:id/wishlist", verifyToken, usersController.getUserWishlist);
router.patch("/:id/wishlist/add", verifyToken, usersController.addToWishlist);
router.patch("/:id/wishlist/remove", verifyToken, usersController.removeFromWishlist);

// Rutas de direcciones
router.get("/:id/addresses", verifyToken, usersController.getUserAddresses);
router.patch("/:id/defaultAddress", verifyToken, usersController.setDefaultAddress);

export default router;