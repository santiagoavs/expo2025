import Review from "../models/reviews.js";
 
// Crear una nueva reseña (siempre pendiente al inicio)
export const createReview = async (req, res) => {
  try {
    const { userId, rating, comment } = req.body;

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

    // IMPORTANTE: Las nuevas reseñas siempre empiezan como "pending"
    const review = new Review({ 
      userId, 
      rating: Number(rating), 
      comment: comment.trim(),
      status: 'pending', // Estado inicial
      isActive: true 
    });
    
    const savedReview = await review.save();
    
    // CRÍTICO: Popular el userId antes de enviar la respuesta
    await savedReview.populate('userId', 'name email');

    res.status(201).json({ 
      success: true,
      message: "Reseña creada correctamente y está pendiente de aprobación", 
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
 
// Obtener reseñas para CLIENTES (solo aprobadas y activas)
export const getPublicReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ 
      status: 'approved',  // Solo reseñas aprobadas
      isActive: true       // Y activas
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error al obtener reseñas públicas:', error);
    res.status(500).json({ 
      success: false,
      message: "Error al obtener reseñas", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obtener TODAS las reseñas para ADMINISTRADORES
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isActive: true })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error al obtener todas las reseñas:', error);
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

// NUEVA FUNCIÓN: Aprobar una reseña
export const approveReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const approvedReview = await Review.findByIdAndUpdate(
      id,
      { status: 'approved' },
      { new: true, runValidators: true }
    ).populate("userId", "name email");
 
    if (!approvedReview) {
      return res.status(404).json({ 
        success: false,
        message: "Reseña no encontrada" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: "Reseña aprobada exitosamente", 
      review: approvedReview 
    });
  } catch (error) {
    console.error('Error al aprobar reseña:', error);
    res.status(500).json({ 
      success: false,
      message: "Error al aprobar la reseña", 
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// NUEVA FUNCIÓN: Rechazar una reseña
export const rejectReview = async (req, res) => {
  try {
    const { id } = req.params;
    
    const rejectedReview = await Review.findByIdAndUpdate(
      id,
      { status: 'rejected' },
      { new: true, runValidators: true }
    ).populate("userId", "name email");
 
    if (!rejectedReview) {
      return res.status(404).json({ 
        success: false,
        message: "Reseña no encontrada" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: "Reseña rechazada", 
      review: rejectedReview 
    });
  } catch (error) {
    console.error('Error al rechazar reseña:', error);
    res.status(500).json({ 
      success: false,
      message: "Error al rechazar la reseña", 
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

// Obtener estadísticas de reseñas
export const getReviewStats = async (req, res) => {
  try {
    console.log('📊 [Reviews] Obteniendo estadísticas de reseñas');

    // Obtener estadísticas básicas de forma simple
    const totalReviews = await Review.countDocuments();
    const pendingReviews = await Review.countDocuments({ status: 'pending' });
    const approvedReviews = await Review.countDocuments({ status: 'approved' });
    const rejectedReviews = await Review.countDocuments({ status: 'rejected' });

    // Obtener rating promedio de forma simple
    const approvedReviewsData = await Review.find({ status: 'approved' }, 'rating');
    const totalRatings = approvedReviewsData.length;
    const averageRating = totalRatings > 0 
      ? Math.round((approvedReviewsData.reduce((sum, review) => sum + review.rating, 0) / totalRatings) * 10) / 10
      : 0;

    // Obtener distribución de ratings de forma simple
    const ratingDistribution = [];
    for (let i = 1; i <= 5; i++) {
      const count = await Review.countDocuments({ status: 'approved', rating: i });
      ratingDistribution.push({ _id: i, count });
    }

    const stats = {
      overview: {
        total: totalReviews,
        pending: pendingReviews,
        approved: approvedReviews,
        rejected: rejectedReviews
      },
      rating: {
        average: averageRating,
        total: totalRatings,
        distribution: ratingDistribution
      },
      trends: {
        monthly: [] // Simplificado por ahora
      }
    };

    console.log(`✅ [Reviews] Estadísticas obtenidas: ${totalReviews} total`);

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ [Reviews] Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
};