import Review from "../models/reviews.js";
 
// Crear una nueva reseña
export const createReview = async (req, res) => {
  try {
    const { userId, rating, comment, isActive = true } = req.body;

    // Validaciones del backend
    if (!userId || !rating || !comment) {
      return res.status(400).json({ 
        success: false,
        message: "Todos los campos son requeridos (userId, rating, comment)" 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        success: false,
        message: "La calificación debe estar entre 1 y 5" 
      });
    }

    const review = new Review({ 
      userId, 
      rating: Number(rating), 
      comment: comment.trim(),
      isActive 
    });
    
    const savedReview = await review.save();
    
    // CRÍTICO: Popular el userId antes de enviar la respuesta
    await savedReview.populate('userId', 'name email');

    res.status(201).json({ 
      success: true,
      message: "Reseña creada correctamente", 
      review: savedReview 
    });
  } catch (error) {
    console.error('Error al crear reseña:', error);
    res.status(500).json({ 
      success: false,
      message: "Error al crear la reseña", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
 
// Obtener todas las reseñas
export const getAllReviews = async (req, res) => {
  try {
    // CRÍTICO: Filtrar solo reviews activas y popular userId
    const reviews = await Review.find({ isActive: true })
      .populate("userId", "name email")
      .sort({ createdAt: -1 }); // Más recientes primero

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error al obtener reseñas:', error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener reseñas", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
 
// Obtener una reseña por ID
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;
    const review = await Review.findById(id).populate("userId", "name email");
 
    if (!review) {
      return res.status(404).json({ 
        success: false,
        message: "Reseña no encontrada" 
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('Error al obtener reseña:', error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener la reseña", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
 
// Actualizar una reseña
export const updateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
 
    const updatedReview = await Review.findByIdAndUpdate(
      id,
      { rating: Number(rating), comment: comment?.trim() },
      { new: true, runValidators: true }
    ).populate("userId", "name email");
 
    if (!updatedReview) {
      return res.status(404).json({ 
        success: false,
        message: "Reseña no encontrada" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: "Reseña actualizada", 
      review: updatedReview 
    });
  } catch (error) {
    console.error('Error al actualizar reseña:', error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar la reseña", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
 
// Eliminar una reseña (soft delete)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Soft delete: marcar como inactiva en lugar de eliminar
    const deletedReview = await Review.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
 
    if (!deletedReview) {
      return res.status(404).json({ 
        success: false,
        message: "Reseña no encontrada" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: "Reseña eliminada correctamente" 
    });
  } catch (error) {
    console.error('Error al eliminar reseña:', error);
    res.status(500).json({ 
      success: false,
      message: "Error al eliminar la reseña", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};