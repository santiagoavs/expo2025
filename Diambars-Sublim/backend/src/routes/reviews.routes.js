 import express from "express";
import {
  createReview,
  getAllReviews,
  getReviewById,
  updateReview,
  deleteReview,
} from "../controllers/reviews.controller.js";
 
const router = express.Router();
 
// Crear una nueva reseña
router.post("/", createReview);
 
// Obtener todas las reseñas
router.get("/", getAllReviews);
 
// Obtener una reseña por ID
router.get("/:id", getReviewById);
 
// Actualizar una reseña
router.put("/:id", updateReview);
 
// Eliminar una reseña
router.delete("/:id", deleteReview);
 
export default router;
 