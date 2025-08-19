// src/components/products/productCard.jsx - INTEGRADO CON SISTEMA DE DISEÑOS
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import './productCard.css';

export default function ProductCard({ 
  name, 
  image, 
  price,
  category,
  product, // Objeto completo del producto
  onCustomize
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleCustomize = () => {
    if (!isAuthenticated) {
      // Redirigir al perfil con información del producto en el state
      navigate('/profile', { 
        state: { 
          from: `/design-hub?product=${product?._id || product?.id}`,
          message: "Inicia sesión para personalizar este producto",
          productId: product?._id || product?.id,
          productName: name
        } 
      });
      return;
    }

    if (onCustomize) {
      onCustomize(product);
    } else {
      // Redirigir al hub de diseños con el producto seleccionado
      navigate(`/design-hub?product=${product?._id || product?.id}`);
    }
  };

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
      
      <button className="customize-button" onClick={handleCustomize}>
        Personalizar
      </button>
    </div>
  );
}