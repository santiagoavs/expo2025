import express from "express";
import {
  createReview,
  getAllReviews,
  getPublicReviews,
  getReviewById,
  updateReview,
  deleteReview,
  approveReview,
  rejectReview,
  getReviewStats,
} from "../controllers/reviews.controller.js";
 
const router = express.Router();

// RUTAS PÚBLICAS (para la app de clientes)
// Obtener solo reseñas aprobadas
router.get("/public", getPublicReviews);

// RUTAS ADMINISTRATIVAS (para el panel de admin)
// Obtener todas las reseñas (incluyendo pendientes)
router.get("/", getAllReviews);

// Obtener estadísticas de reseñas
router.get("/stats", getReviewStats);

// Aprobar una reseña
router.patch("/:id/approve", approveReview);

// Rechazar una reseña
router.patch("/:id/reject", rejectReview);

// RUTAS GENERALES
// Crear una nueva reseña
router.post("/", createReview);
 
// Obtener una reseña por ID
router.get("/:id", getReviewById);
 
// Actualizar una reseña
router.put("/:id", updateReview);
 
// Eliminar una reseña (soft delete)
router.delete("/:id", deleteReview);
 
export default router;