import React from 'react';
import './DiambarsCard.css';

const DiambarsCard = ({ children }) => {
  return (
    <div className="diambars-login-container">
      <div className="diambars-login-card">
        {children}
      </div>
    </div>
  );
};

export default DiambarsCard;