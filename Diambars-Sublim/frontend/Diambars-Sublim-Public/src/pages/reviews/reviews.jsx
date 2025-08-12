import React from 'react';
import ReviewForm from '../../components/reviews/reviewForm';
import ReviewList from '../../components/reviews/reviewList';
import './reviews.css';
import tituloReseñas from '/images/reviews/reviewsTitle.png';
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
} = useDataReviews();

  return (
    <main className="reviews-page">
      <div className="reviews-content">
        <img src="/images/reviews/reviewsTitle.png" alt="Título reseñas" className="reviews-title" />
        <ReviewForm 
        rating ={rating}
        setRating = {setRating}
        comment={comment}
        setComment={setComment}
        isActive={isActive}
        setIsActive={setIsActive}
        handleSubmit={handleSubmit}
        success= {success}
        setSuccess ={setSuccess}
        />
        <ReviewList
        reviews = {reviews}
        />
      </div>
      <ContactButton />
      <Footer />
    </main>
    
    
  );
};

export default ReviewPage;
