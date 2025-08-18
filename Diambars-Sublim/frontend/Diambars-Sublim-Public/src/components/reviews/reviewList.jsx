import React from 'react';
import ReadOnlyStars from './readOnlyStars';
import './reviewList.css';
import profilePic from '/images/reviews/profileDefault.png';

const ReviewList = ({ reviews = [], loading = false, error = null }) => {
  // Validación de seguridad para props
  const validReviews = Array.isArray(reviews) ? reviews : [];

  // Estado de carga
  if (loading) {
    return (
      <div className="review-list">
        <p className="no-reviews">Cargando reseñas...</p>
      </div>
    );
  }

  // Estado de error
  if (error) {
    return (
      <div className="review-list">
        <p className="no-reviews" style={{ color: '#ff6b6b' }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="review-list">
      {validReviews.length === 0 ? (
        <p className="no-reviews">Aún no hay reseñas.</p>
      ) : (
        validReviews.map((review, index) => {
          // VALIDACIONES CRÍTICAS para evitar errores null/undefined
          if (!review) {
            console.warn('Review nulo encontrado en índice:', index);
            return null;
          }

          // ID único para la key (MongoDB usa _id)
          const reviewId = review._id || review.id || `review-${index}`;
          
          // Validar rating (debe ser número entre 1-5)
          const reviewRating = typeof review.rating === 'number' && 
                              review.rating >= 1 && 
                              review.rating <= 5 ? review.rating : 0;
          
          // Validar comentario
          const reviewComment = review.comment && typeof review.comment === 'string' 
                               ? review.comment.trim() 
                               : 'Sin comentario';
          
          // VALIDACIÓN CRÍTICA para userId poblado por Mongoose
          let userName = 'Usuario Anónimo';
          
          if (review.userId) {
            if (typeof review.userId === 'object' && review.userId !== null && review.userId.name) {
              // userId está poblado con el documento completo del usuario
              userName = review.userId.name;
            } else if (typeof review.userId === 'string') {
              // userId es solo el ObjectId, no está poblado
              userName = 'Usuario';
            }
          }

          // Fecha de creación (opcional)
          const createdAt = review.createdAt ? 
                           new Date(review.createdAt).toLocaleDateString('es-ES', {
                             year: 'numeric',
                             month: 'short',
                             day: 'numeric'
                           }) : '';

          return (
            <div key={reviewId} className="review-card">
              <div className="review-header">
                <img 
                  src={profilePic} 
                  alt="Perfil" 
                  className="review-profile-pic"
                  onError={(e) => {
                    e.target.src = '/images/reviews/profileDefault.png';
                  }}
                />
                <div className="review-user-info">
                  <div className="review-user-top">
                    <span className="review-username">
                      {userName}
                      {createdAt && (
                        <small style={{ 
                          marginLeft: '10px', 
                          color: '#666', 
                          fontWeight: 'normal',
                          fontSize: '0.8rem'
                        }}>
                          {createdAt}
                        </small>
                      )}
                    </span>
                    <div className='review-stars'>
                      <label>Rating: </label>
                      <ReadOnlyStars rating={reviewRating} />
                    </div>
                  </div>
                </div>
              </div>
              <p className="review-text">"{reviewComment}"</p>
            </div>
          );
        })
      )}
    </div>
  );
};

export default ReviewList;