import React, { useState } from 'react';
import './starRating.css';

const StarRating = ({ rating, onRatingChange }) => {
  const [hoveredStar, setHoveredStar] = useState(null);

  return (
    <div className="star-container">
    {[1, 2, 3, 4, 5].map((star) => (
        <span
        key={star}
        className={`star ${(hoveredStar || rating) >= star ? 'active' : ''}`}
        onClick={() => onRatingChange(star)}
        onMouseEnter={() => setHoveredStar(star)}
        onMouseLeave={() => setHoveredStar(null)}
        >
        ★
        </span>
    ))}
</div>

  );
};

export default StarRating;
