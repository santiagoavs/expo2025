import React from 'react';
import ReviewForm from '../../components/reviews/reviewForm';
import ReviewList from '../../components/reviews/reviewList';
import './reviews.css';
import tituloReseñas from '/images/reviews/reviewsTitle.png';
import Footer from '../../components/UI/footer/footer';
import ContactButton from '../../components/UI/contactButton/contactButton';

const ReviewPage = () => {
  return (
    <main className="reviews-page">
      <div className="reviews-content">
        <img src="/images/reviews/reviewsTitle.png" alt="Título reseñas" className="reviews-title" />
        <ReviewForm />
        <ReviewList />
      </div>
      <ContactButton />
      <Footer />
    </main>
    
    
  );
};

export default ReviewPage;
