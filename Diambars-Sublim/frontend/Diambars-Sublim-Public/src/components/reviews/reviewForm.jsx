import React from 'react';
import StarRating from './starRating';
import { motion } from 'framer-motion';
import './reviewForm.css';

const ReviewForm = ({ 
  rating,
  setRating,
  comment,
  setComment,
  isActive,
  setIsActive,
  handleSubmit,
  success,
  setSuccess,
  loading = false,
  error = null
}) => {

  const onFormSubmit = (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario
    handleSubmit(e); // Llamar a la función handleSubmit original
  };
  const onButtonClick = (e) => {
    e.preventDefault(); // Prevenir cualquier comportamiento por defecto
    handleSubmit(e); // Llamar a la función handleSubmit original
  };

  return (
    <div className="review-form">
      <form onSubmit={onFormSubmit}>
        <motion.textarea
          className="review-textarea"
          placeholder="¡Déjanos tu reseña!"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          disabled={loading}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        />
        
        <div className="star-rating-container">
          <StarRating 
            rating={rating} 
            onRatingChange={setRating}
            disabled={loading}
          />
          <button
            type="button" 
            className={`review-submit-button ${loading ? 'disabled' : ''}`}
            onClick={onButtonClick}
            disabled={loading || !rating || !comment.trim()}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Enviando...
              </>
            ) : (
              <>
                <span className="submit-icon"></span>
                Enviar Reseña
              </>
            )}
          </button>
        </div>
      </form>

      {/* Mensaje de error */}
      {error && (
        <motion.div
          className="error-message"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: '1rem',
            color: '#ff6b6b',
            textAlign: 'center',
            padding: '0.5rem',
            backgroundColor: '#ffe6e6',
            border: '1px solid #ff6b6b',
            borderRadius: '8px'
          }}
        >
          {error}
        </motion.div>
      )}

      {/* Mensaje de éxito */}
      {success && (
        <motion.div
          className="success-message"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          ¡Reseña publicada! 🎉
        </motion.div>
      )}

      {/* Indicador de carga */}
      {loading && (
        <motion.div
          className="loading-message"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            marginTop: '1rem',
            color: '#666',
            textAlign: 'center'
          }}
        >
          Enviando reseña...
        </motion.div>
      )}
    </div>
  );
};

export default ReviewForm;