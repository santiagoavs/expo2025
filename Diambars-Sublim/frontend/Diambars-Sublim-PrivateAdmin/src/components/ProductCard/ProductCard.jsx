import React, { useState } from 'react';
import './ProductCard.css';
import {
  MagnifyingGlass as ViewIcon,
  PencilSimple as EditIcon,
  X as DeleteIcon,
  Star as StarIcon,
  Package as InventoryIcon,
  Eye as EyeIcon,
  Trash as TrashIcon,
  CurrencyDollar as DollarIcon
} from '@phosphor-icons/react';

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
  const [showActions, setShowActions] = useState(false);

  const getStatusConfig = (status) => {
    const statusMap = {
      active: { label: 'Activo', class: 'product-status-active' },
      pending: { label: 'Pendiente', class: 'product-status-pending' },
      inactive: { label: 'Inactivo', class: 'product-status-inactive' },
      draft: { label: 'Borrador', class: 'product-status-draft' }
    };
    return statusMap[status] || statusMap.active;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
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
      className={`product-card-container ${isTopProduct ? 'product-top-ranked' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Ranking badge para productos top */}
      {isTopProduct && rank && (
        <div className="product-rank-badge">
          <StarIcon size={16} weight="duotone" />
          <span>#{rank}</span>
        </div>
      )}

      {/* Imagen del producto */}
      <div className="product-image-wrapper">
        {!imageError ? (
          <img
            src={image}
            alt={name}
            className="product-card-image"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="product-image-fallback">
            <InventoryIcon size={24} weight="duotone" />
            <span>Sin imagen</span>
          </div>
        )}

        {/* Overlay con acciones */}
        <div className={`product-actions-overlay ${showActions ? 'product-overlay-visible' : ''}`}>
          <div className="product-action-buttons">
            <button 
              className="product-action-btn product-view-btn"
              onClick={(e) => handleAction('view', e)}
              title="Ver producto"
            >
              <EyeIcon size={24} weight="duotone" />
            </button>
            <button 
              className="product-action-btn product-edit-btn"
              onClick={(e) => handleAction('edit', e)}
              title="Editar producto"
            >
              <EditIcon size={24} weight="duotone" />
            </button>
            <button 
              className="product-action-btn product-delete-btn"
              onClick={(e) => handleAction('delete', e)}
              title="Eliminar producto"
            >
              <TrashIcon size={24} weight="duotone" />
            </button>
          </div>
        </div>

        {/* Badge de estado */}
        <div className={`product-status-badge ${statusConfig.class}`}>
          {statusConfig.label}
        </div>
      </div>

      {/* Información del producto */}
      <div className="product-card-info">
        <div className="product-card-header">
          <h3 className="product-card-name" title={name}>
            {name}
          </h3>
          <span className="product-card-category">
            {category}
          </span>
        </div>

        <div className="product-card-details">
          <div className="product-card-price">
            <DollarIcon size={16} weight="duotone" />
            <span className="product-price-value">
              {formatPrice(price)}
            </span>
          </div>
        </div>

        <div className="product-card-meta">
          <div className="product-meta-item">
            <span className="product-meta-text">
              Creado: {formatDate(createdAt)}
            </span>
          </div>
          
          <div className="product-card-id">
            ID: {id.slice(-8)}
          </div>
        </div>
      </div>

      {/* Efectos decorativos */}
      <div className="product-card-glow"></div>
    </div>
  );
};

export default ProductCard;