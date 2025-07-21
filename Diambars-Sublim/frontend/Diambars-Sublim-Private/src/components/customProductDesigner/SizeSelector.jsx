import React from 'react';
import './SizeSelector.css';

const sizes = [
  { short: 'S', label: 'Small' },
  { short: 'M', label: 'Medium' },
  { short: 'L', label: 'Large' },
  { short: 'XL', label: 'X-Large' },
];

const SizeSelector = ({ selectedSize, onSelectSize }) => {
  return (
    <div className="ss-wrapper">
      <div className="ss-header">
        <span className="ss-label">Choose Size</span>
        <span className="ss-required">Required</span>
      </div>

      <div className="ss-options">
        {sizes.map(({ short, label }) => (
          <button
            key={short}
            className={`ss-option ${selectedSize === short ? 'ss-selected' : ''}`}
            onClick={() => onSelectSize(short)}
          >
            <span className="ss-size">{short}</span>
            <span className="ss-label-text">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SizeSelector;
