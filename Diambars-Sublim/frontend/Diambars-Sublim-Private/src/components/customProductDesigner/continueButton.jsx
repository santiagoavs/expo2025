import React from 'react';
import './ContinueButton.css';

const ContinueButton = ({ onClick, children, className = '', style }) => {
  return (
    <button className={`cb-btn ${className}`} style={style} onClick={onClick}>
      <span className="cb-text">{children || 'Continue to Design'}</span>
      <span className="cb-arrow">→</span>
    </button>
  );
};

export default ContinueButton;
