import React, { useEffect, useState } from 'react';
import StarRating from './starRating';
import ReadOnlyStars from './readOnlyStars';
import './reviewList.css';
import profilePic from '/images/reviews/profileDefault.png';

const ReviewList = () => {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('reviews')) || [];
    setReviews(stored.reverse());
  }, []);

  return (
    <div className="review-list">
      {reviews.length === 0 ? (
        <p className="no-reviews">Aún no hay reseñas.</p>
      ) : (
        reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <img src={profilePic} alt="Perfil" className="review-profile-pic" />
              <div className="review-user-info">
                <div className="review-user-top">
                  <span className="review-username">Santiago Ávila</span>
                  <ReadOnlyStars rating={review.rating} />
                </div>
              </div>
            </div>
            <p className="review-text">“{review.text}”</p>
          </div>
        ))
      )}
    </div>
  );
};

export default ReviewList;
