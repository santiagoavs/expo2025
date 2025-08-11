import express from "express";
import usersController from "../controllers/users.controller.js";
import { 
  authRequired, 
  verifyToken, 
  checkRole, 
  checkUserType, 
  checkOwnershipOrAdmin,
  checkAdminUniqueness,
  checkActiveUser
} from "../middlewares/auth.middleware.js";

const router = express.Router();

// Rutas generales - usando tu middleware real
router.get("/", authRequired, checkRole("admin"), usersController.getUsers);
router.post("/", authRequired, checkRole("admin"), checkAdminUniqueness, usersController.createUser);
router.put("/profile", authRequired, checkActiveUser, usersController.updateOwnProfile);
router.get("/:id", authRequired, checkOwnershipOrAdmin, usersController.getUserById);
router.put("/:id", authRequired, checkRole("admin"), checkAdminUniqueness, usersController.updateUser);
router.patch("/:id/status", authRequired, checkRole("admin"), usersController.updateUserStatus);
router.patch("/:id/password", authRequired, checkOwnershipOrAdmin, usersController.changeUserPassword);
router.delete("/:id", authRequired, checkRole("admin"), usersController.inactivateUser);

// Rutas de wishlist 
router.get('/:id/wishlist', authRequired, checkOwnershipOrAdmin, usersController.getUserWishlist);
router.patch('/:id/wishlist/add', authRequired, checkOwnershipOrAdmin, usersController.addToWishlist);
router.patch('/:id/wishlist/remove', authRequired, checkOwnershipOrAdmin, usersController.removeFromWishlist);

// Rutas de direcciones
router.get('/:id/addresses', authRequired, checkOwnershipOrAdmin, usersController.getUserAddresses);
router.patch('/:id/defaultAddress', authRequired, checkOwnershipOrAdmin, usersController.setDefaultAddress);

export default router;