import React from 'react';
import './DiambarsButton.css';

const DiambarsButton = ({ text, onClick, isLoading, disabled }) => {
  return (
    <button 
      type="submit" 
      className="diambars-button"
      onClick={onClick}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <div className="spinner"></div>
      ) : text}
    </button>
  );
};

export default DiambarsButton;