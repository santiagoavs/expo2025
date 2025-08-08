import React from 'react';
import './StatCard.css';

const StatCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon: Icon, 
  color = 'blue', 
  description 
}) => {
  const getColorClasses = (color) => {
    const colorMap = {
      blue: 'stat-blue',
      green: 'stat-green',
      orange: 'stat-orange',
      purple: 'stat-purple',
      red: 'stat-red'
    };
    return colorMap[color] || 'stat-blue';
  };

  const formatValue = (val) => {
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return (val / 1000000).toFixed(1) + 'M';
      } else if (val >= 1000) {
        return (val / 1000).toFixed(1) + 'K';
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div className={`stat-card ${getColorClasses(color)}`}>
      <div className="stat-card-header">
        <div className="stat-icon-wrapper">
          <Icon className="stat-icon" />
          <div className="stat-icon-glow"></div>
        </div>
        
        <div className="stat-trend">
          <span className={`trend-badge ${trend === 'up' ? 'trend-up' : 'trend-down'}`}>
            {trend === 'up' ? '↗' : '↘'} {change}
          </span>
        </div>
      </div>

      <div className="stat-content">
        <div className="stat-value">
          {formatValue(value)}
        </div>
        
        <div className="stat-title">
          {title}
        </div>
        
        {description && (
          <div className="stat-description">
            {description}
          </div>
        )}
      </div>

      <div className="stat-card-bg"></div>
    </div>
  );
};

export default StatCard;