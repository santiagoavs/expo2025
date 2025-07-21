import React from 'react';
import './ColorSelector.css';

const colors = [
  { name: 'White', value: '#ffffff' },
  { name: 'Black', value: '#1a1a1a' },
  { name: 'Gray', value: '#a0aec0' },
  { name: 'Navy', value: '#2c5282' },
  { name: 'Red', value: '#e53e3e' },
  { name: 'Green', value: '#38a169' },
];

const ColorSelector = ({ selectedColor, onSelectColor }) => {
  return (
    <div className="color-selector">
      <div className="color-header">
        <span className="label">Choose Color</span>
        <span className="required">Required</span>
      </div>

      <div className="color-options">
        {colors.map((color) => (
          <button
            key={color.name}
            className={`color-option ${selectedColor === color.name ? 'selected' : ''}`}
            onClick={() => onSelectColor(color.name)}
          >
            <div className="color-circle" style={{ backgroundColor: color.value }} />
            <span className="color-name">{color.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorSelector;
