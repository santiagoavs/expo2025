// src/components/products/productCard.jsx
import './productCard.css';

export default function ProductCard({ 
  name, 
  image, 
  price,
  category,
  onCustomize
}) {
  return (
    <div className="product-card">
      <div className="image-container">
        <img 
          src={image} 
          alt={name} 
          className="product-image"
          onError={(e) => {
            e.target.src = '/placeholder-product.jpg';
          }}
        />
      </div>
      
      <h4 className="product-name">{name}</h4>
      {price && (
        <p className="product-price">{price}</p>
      )}
      
      {category && (
        <span className="product-category">{category}</span>
      )}
      
      <button className="customize-button" onClick={onCustomize}>
        Personalizar
      </button>
    </div>
  );
}