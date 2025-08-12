import Review from "../models/reviews.js";
 
// Crear una nueva reseña
export const createReview = async (req, res) => {
  try {
    const { userId, rating, comment } = req.body;
 
    const review = new Review({ userId, rating, comment });
    await review.save();
 
    res.status(201).json({ message: "Reseña creada correctamente", review });
  } catch (error) {
    res.status(500).json({ message: "Error al crear la reseña", error });
  }
};
 
// Obtener todas las reseñas
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find().populate("userId", "name email");
    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reseñas", error });
  }
};
 
// Obtener una reseña por ID
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id).populate("userId", "name email");
 
    if (!review) return res.status(404).json({ message: "Reseña no encontrada" });
 
    res.status(200).json(review);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la reseña", error });
  }
};
 
// Actualizar una reseña
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
 
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { rating, comment },
      { new: true, runValidators: true }
    );
 
    if (!updatedReview) return res.status(404).json({ message: "Reseña no encontrada" });
 
    res.status(200).json({ message: "Reseña actualizada", review: updatedReview });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la reseña", error });
  }
};
 
// Eliminar una reseña
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedReview = await Review.findByIdAndDelete(id);
 
    if (!deletedReview) return res.status(404).json({ message: "Reseña no encontrada" });
 
    res.status(200).json({ message: "Reseña eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la reseña", error });
  }
};
 