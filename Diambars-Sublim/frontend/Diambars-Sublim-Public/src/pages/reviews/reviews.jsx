import React from 'react';
import ReviewForm from '../../components/reviews/reviewForm';
import ReviewList from '../../components/reviews/reviewList';
import './reviews.css';
import tituloReseñas from '/images/reviews/reviewsTitle.png';

const ReviewPage = () => {
  return (
    <div className="reviews-page">
      <img src={tituloReseñas} alt="Reseñas" className="reviews-title" />
      <ReviewForm />
      <ReviewList />
    </div>
    
  );
};

export default ReviewPage;
