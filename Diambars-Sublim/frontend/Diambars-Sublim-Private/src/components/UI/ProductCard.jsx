import React, { useState } from 'react';
import { createClassName, COMPONENT_IDENTIFIERS } from '../../utils/ClassNames';
import { HiDotsVertical } from 'react-icons/hi';
import './ProductCard.css';

const PRODUCT_CARD_ID = COMPONENT_IDENTIFIERS.PRODUCT_CARD;

const ProductCard = ({ 
  product,
  onClick = null,
  onOptionsClick = null
}) => {
  const [imageError, setImageError] = useState(false);

  const classes = {
    card: createClassName(PRODUCT_CARD_ID, 'card'),
    imageContainer: createClassName(PRODUCT_CARD_ID, 'image-container'),
    image: createClassName(PRODUCT_CARD_ID, 'image'),
    imagePlaceholder: createClassName(PRODUCT_CARD_ID, 'image-placeholder'),
    content: createClassName(PRODUCT_CARD_ID, 'content'),
    title: createClassName(PRODUCT_CARD_ID, 'title'),
    description: createClassName(PRODUCT_CARD_ID, 'description'),
    price: createClassName(PRODUCT_CARD_ID, 'price'),
    optionsBtn: createClassName(PRODUCT_CARD_ID, 'options-btn')
  };

  const handleCardClick = () => {
    if (onClick) {
      onClick(product.id || product._id);
    }
  };

  const handleOptionsClick = (e) => {
    e.stopPropagation();
    if (onOptionsClick) {
      onOptionsClick(product.id || product._id);
    }
  };

  return (
    <div className={classes.card} onClick={handleCardClick}>
      <div className={classes.imageContainer}>
        {!imageError ? (
          <img
            src={product.image || '/placeholder-product.jpg'}
            alt={product.name || product.title}
            className={classes.image}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={classes.imagePlaceholder}>
            <span>📦</span>
          </div>
        )}
        
        <button 
          className={classes.optionsBtn}
          onClick={handleOptionsClick}
        >
          <HiDotsVertical />
        </button>
      </div>
      
      <div className={classes.content}>
        <h3 className={classes.title}>
          {product.name || product.title || 'Producto'}
        </h3>
        
        {product.description && (
          <p className={classes.description}>
            {product.description}
          </p>
        )}
        
        {product.price && (
          <div className={classes.price}>
            ${product.price}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;