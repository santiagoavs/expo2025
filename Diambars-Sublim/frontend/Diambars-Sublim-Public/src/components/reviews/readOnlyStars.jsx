import React from 'react';
import './readOnlyStars.css';

const ReadOnlyStars = ({ rating }) => {
  return (
    <div className="readonly-star-container">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`readonly-star ${i <= rating ? 'active' : ''}`}>
          ★
        </span>
      ))}
    </div>
  );
};

export default ReadOnlyStars;
