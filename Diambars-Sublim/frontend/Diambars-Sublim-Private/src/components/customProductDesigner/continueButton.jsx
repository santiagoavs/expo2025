import React from 'react';
import './ContinueButton.css';

const ContinueButton = ({ onClick }) => {
  return (
    <button className="cb-btn" onClick={onClick}>
      <span className="cb-text">Continue to Design</span>
      <span className="cb-arrow">→</span>
    </button>
  );
};

export default ContinueButton;
