import React from 'react';
import ReviewForm from '../../components/reviews/reviewForm';
import ReviewList from '../../components/reviews/reviewList';
import './reviews.css';
import Footer from '../../components/UI/footer/footer';
import ContactButton from '../../components/UI/contactButton/contactButton';
import useDataReviews from '../../hooks/useDataReviews';

const ReviewPage = () => {
  const {
    rating,
    setRating,
    comment,
    setComment,
    isActive,
    setIsActive,
    handleSubmit,
    success,
    setSuccess,
    reviews,
    loading,
    error,
    isAuthenticated
  } = useDataReviews();

  return (
    <main className="reviews-page">
      <div className="reviews-content">
        <h1 className="reviews-title"> Reseñas </h1>
        
        {/* Mostrar formulario solo si el usuario está autenticado */}
        {isAuthenticated ? (
          <ReviewForm 
            rating={rating}
            setRating={setRating}
            comment={comment}
            setComment={setComment}
            isActive={isActive}
            setIsActive={setIsActive}
            handleSubmit={handleSubmit}
            success={success}
            setSuccess={setSuccess}
            loading={loading}
            error={error}
          />
        ) : (
          <div className="review-form" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: '#666', fontSize: '1.1rem' }}>
              Inicia sesión para dejar tu reseña
            </p>
          </div>
        )}
        
        <ReviewList
          reviews={reviews}
          loading={loading}
          error={error}
        />
      </div>
      <ContactButton />
      <Footer />
    </main>
  );
};

export default ReviewPage;