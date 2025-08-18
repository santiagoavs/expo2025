import './productCard.css';

export default function ProductCard({ name, image, onCustomize }) {
  return (
    <div className="product-card">
      <div className="image-container">
        <img src={image} alt={name} className="product-image" />
      </div>
      <h4 className="product-name">{name}</h4>
      <button className="customize-button" onClick={onCustomize}>
        Personalizar
      </button>
    </div>
  );
}