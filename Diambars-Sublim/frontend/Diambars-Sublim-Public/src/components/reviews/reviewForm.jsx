import React, { useState, useEffect } from 'react';
import StarRating from './starRating';
import { motion } from 'framer-motion';
import btnEnviar from '/images/reviews/btnEnviarReviews.png'
import './reviewForm.css';


const ReviewForm = ({    rating,
    setRating,
    comment,
    setComment,
    isActive,
    setIsActive,
    handleSubmit,
    success,
    setSuccess,}) => {
  /*
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [reviews, setReviews] = useState([]);
  const [success, setSuccess] = useState(false);
  */

/*
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('reviews')) || [];
    setReviews(stored);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0 || text.trim() === '') return;

    const newReview = {
      rating,
      text,
      id: Date.now(),
    };

    const updated = [...reviews, newReview];
    localStorage.setItem('reviews', JSON.stringify(updated));
    setReviews(updated);
    setText('');
    setRating(0);
    setSuccess(true);

    setTimeout(() => setSuccess(false), 2000);
  };
*/

  return (
    <div className="review-form">
      <form >
        <motion.textarea
          className="review-textarea"
          placeholder="¡Dejanos tu reseña!"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows="4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        />
      <StarRating rating={rating} onRatingChange={setRating} />

        <img src="/images/reviews/btnEnviarReviews.png" alt="Enviar" className="review-button" onClick={handleSubmit}></img>
      </form>


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

      {process.env.NODE_ENV === 'development' && (
        <button
            type="button"
            onClick={() => {
            if (confirm('¿Estás seguro de eliminar todas las reseñas?')) {
                localStorage.removeItem('reviews');
                setReviews([]);
            }
            }}
            style={{
            marginTop: '1rem',
            fontSize: '0.9rem',
            padding: '0.5rem 1rem',
            border: 'hidden',
            backgroundColor: 'rgb(252 241 217)',
            color: '#6a6a6a2e',
            cursor: 'pointer',
            }}
        >
            🗑 Borrar todas las reseñas
        </button>
        )}
    </div>
  );
};

export default ReviewForm;
