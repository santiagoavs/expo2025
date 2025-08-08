import React, { useState } from 'react';
import { FaEdit, FaTrash, FaEye, FaStar, FaHeart, FaShare } from 'react-icons/fa';
import { MdInventory, MdTrendingUp, MdDateRange } from 'react-icons/md';
import { BiDollar } from 'react-icons/bi';
import './ProductCard.css';

const ProductCard = ({ 
  id,
  name, 
  image, 
  price, 
  status, 
  category, 
  sales = 0,
  createdAt,
  rank,
  isTopProduct = false,
  onEdit,
  onDelete,
  onView
}) => {
  const [imageError, setImageError] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const getStatusConfig = (status) => {
    const statusMap = {
      active: { label: 'Activo', class: 'status-active' },
      pending: { label: 'Pendiente', class: 'status-pending' },
      inactive: { label: 'Inactivo', class: 'status-inactive' },
      draft: { label: 'Borrador', class: 'status-draft' }
    };
    return statusMap[status] || statusMap.active;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleLikeToggle = (e) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
  };

  const handleAction = (action, e) => {
    e.stopPropagation();
    
    switch (action) {
      case 'edit':
        onEdit && onEdit(id);
        break;
      case 'delete':
        onDelete && onDelete(id);
        break;
      case 'view':
        onView && onView(id);
        break;
      default:
        break;
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div 
      className={`product-card ${isTopProduct ? 'top-product' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Ranking badge para productos top */}
      {isTopProduct && rank && (
        <div className="rank-badge">
          <FaStar className="rank-icon" />
          <span>#{rank}</span>
        </div>
      )}

      {/* Imagen del producto */}
      <div className="product-image-container">
        {!imageError ? (
          <img
            src={image}
            alt={name}
            className="product-image"
            onError={handleImageError}
          />
        ) : (
          <div className="product-image-placeholder">
            <MdInventory className="placeholder-icon" />
            <span>Sin imagen</span>
          </div>
        )}

        {/* Overlay con acciones */}
        <div className={`product-overlay ${showActions ? 'visible' : ''}`}>
          <div className="product-actions">
            <button 
              className="action-btn view-btn"
              onClick={(e) => handleAction('view', e)}
              title="Ver producto"
            >
              <FaEye />
            </button>
            <button 
              className="action-btn edit-btn"
              onClick={(e) => handleAction('edit', e)}
              title="Editar producto"
            >
              <FaEdit />
            </button>
            <button 
              className="action-btn delete-btn"
              onClick={(e) => handleAction('delete', e)}
              title="Eliminar producto"
            >
              <FaTrash />
            </button>
          </div>

          {/* Acciones secundarias */}
          <div className="secondary-actions">
            <button 
              className={`like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleLikeToggle}
              title="Me gusta"
            >
              <FaHeart />
            </button>
            <button 
              className="share-btn"
              onClick={(e) => e.stopPropagation()}
              title="Compartir"
            >
              <FaShare />
            </button>
          </div>
        </div>

        {/* Badge de estado */}
        <div className={`status-badge ${statusConfig.class}`}>
          {statusConfig.label}
        </div>
      </div>

      {/* Información del producto */}
      <div className="product-info">
        <div className="product-header">
          <h3 className="product-name" title={name}>
            {name}
          </h3>
          <span className="product-category">
            {category}
          </span>
        </div>

        <div className="product-details">
          <div className="product-price">
            <BiDollar className="price-icon" />
            <span className="price-value">
              {formatPrice(price)}
            </span>
          </div>

          {sales > 0 && (
            <div className="product-sales">
              <MdTrendingUp className="sales-icon" />
              <span className="sales-value">
                {sales} vendidos
              </span>
            </div>
          )}
        </div>

        <div className="product-meta">
          <div className="meta-item">
            <MdDateRange className="meta-icon" />
            <span className="meta-text">
              {formatDate(createdAt)}
            </span>
          </div>
          
          <div className="product-id">
            ID: {id}
          </div>
        </div>
      </div>

      {/* Indicador de rendimiento para productos top */}
      {isTopProduct && sales && (
        <div className="performance-indicator">
          <div className="performance-bar">
            <div 
              className="performance-fill"
              style={{ width: `${Math.min((sales / 200) * 100, 100)}%` }}
            ></div>
          </div>
          <span className="performance-text">
            Performance: {Math.round((sales / 200) * 100)}%
          </span>
        </div>
      )}

      {/* Efectos decorativos */}
      <div className="card-glow"></div>
    </div>
  );
};

export default ProductCard;