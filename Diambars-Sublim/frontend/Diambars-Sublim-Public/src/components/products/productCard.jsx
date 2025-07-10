import './productCard.css';

export default function ProductCard({ name, image, onCustomize }) {
  return (
    <div className="product-card">
      <img src={image} alt={name} className="product-image" />
      <h4 className="product-name">{name}</h4>
      <button className="customize-button" onClick={onCustomize}>
        Personalizar
      </button>
    </div>
  );
}
