import React from 'react';
import './StatCard.css';

const StatCard = ({ number, title, iconBackgroundColor }) => {
  return (
    <div className="stat-card">
      <div className="stat-content">
        <div className="stat-info">
          <h2 className="stat-number">{number}</h2>
          <p className="stat-title">{title}</p>
        </div>
        <div className={`stat-icon-container ${iconBackgroundColor}`}>
          <svg 
            className="stat-icon"
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M3 3h18v18H3zM8 8h8v8H8z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StatCard;