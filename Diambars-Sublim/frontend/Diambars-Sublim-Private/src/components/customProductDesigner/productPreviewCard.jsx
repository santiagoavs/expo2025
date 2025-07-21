import React from 'react';
import './ProductPreviewCard.css';

const ProductPreviewCard = ({ productName, description, color, size }) => {
  return (
    <div className="ppc-wrapper">
      <div className="ppc-card">
        <div className="ppc-logo-container">
          <img
            src="/src/img/camisaBlanca.png"
            alt="Logo DIAMBARS"
            className="ppc-logo"
          />
        </div>

        <div className="ppc-text-info">
          <h3 className="ppc-title">{productName}</h3>
          <p className="ppc-description">{description}</p>
          <p className="ppc-status">
            <strong>Selected:</strong>{' '}
            {color || 'No color selected'} • {size || 'No size selected'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProductPreviewCard;
