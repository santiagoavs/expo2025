import React from 'react';
import './ProductCard.css';

const ProductCard = ({ 
  image = '/src/img/default-product.png', // Ruta por defecto desde src
  title, 
  date, 
  price, 
  status = 'Active'
}) => {
  return (
    <div className="product-card">
      {/* Status Badge */}
      <div className={`status-badge ${status.toLowerCase()}`}>
        {status}
      </div>

      {/* Product Image */}
      <div className="product-image-container">
        <img 
          src={image} 
          alt={title} 
          className="product-image"
          onError={(e) => {
            e.target.src = '/src/img/default-product.png';
          }}
        />
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-title">{title}</h3>
        <p className="product-date">Añadido: {date}</p>
        <div className="product-footer">
          <span className="product-price">${price}</span>
          <button className="more-options-btn">
            <span>•••</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;