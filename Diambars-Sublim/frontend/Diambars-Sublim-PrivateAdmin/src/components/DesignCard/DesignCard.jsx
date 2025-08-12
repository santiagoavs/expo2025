// src/components/DesignCard/DesignCard.jsx
import React, { useState } from 'react';
import './DesignCard.css';

// Iconos simples como reemplazo
const EditIcon = () => <span style={{ fontSize: 'inherit' }}>✏️</span>;
const DeleteIcon = () => <span style={{ fontSize: 'inherit' }}>🗑️</span>;
const CloneIcon = () => <span style={{ fontSize: 'inherit' }}>📋</span>;
const QuoteIcon = () => <span style={{ fontSize: 'inherit' }}>💰</span>;
const ViewIcon = () => <span style={{ fontSize: 'inherit' }}>👁️</span>;
const UserIcon = () => <span style={{ fontSize: 'inherit' }}>👤</span>;
const ClockIcon = () => <span style={{ fontSize: 'inherit' }}>⏰</span>;
const LayersIcon = () => <span style={{ fontSize: 'inherit' }}>📚</span>;
const CheckIcon = () => <span style={{ fontSize: 'inherit' }}>✅</span>;
const XIcon = () => <span style={{ fontSize: 'inherit' }}>❌</span>;

const DesignCard = ({
  id,
  name,
  previewImage,
  productName,
  productImage,
  userName,
  userEmail,
  status,
  statusColor,
  statusText,
  price,
  formattedPrice,
  complexity,
  totalElements,
  estimatedDays,
  createdDate,
  quotedDate,
  approvedDate,
  canEdit,
  canQuote,
  canRespond,
  onEdit,
  onDelete,
  onClone,
  onQuote,
  onView,
  onApprove,
  onReject,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleAction = async (action, actionName) => {
    if (!action || isLoading) return;
    
    try {
      setIsLoading(true);
      await action(id);
    } catch (error) {
      console.error(`Error en ${actionName}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const getComplexityInfo = (complexity) => {
    const complexityMap = {
      low: { text: 'Básico', color: '#32CD32', icon: '🟢' },
      medium: { text: 'Intermedio', color: '#FFA500', icon: '🟡' },
      high: { text: 'Complejo', color: '#FF6B6B', icon: '🔴' }
    };
    return complexityMap[complexity] || complexityMap.medium;
  };

  const complexityInfo = getComplexityInfo(complexity);

  return (
    <div className={`design-card ${className} ${isLoading ? 'design-card--loading' : ''}`}>
      {/* Header de la tarjeta */}
      <div className="design-card__header">
        <div className="design-card__status">
          <span className={`design-card__status-badge design-card__status-badge--${statusColor}`}>
            {statusText}
          </span>
          {price && (
            <span className="design-card__price">
              {formattedPrice}
            </span>
          )}
        </div>
      </div>

      {/* Vista previa del diseño */}
      <div className="design-card__preview">
        {!imageError && (previewImage || productImage) ? (
          <img
            src={previewImage || productImage}
            alt={name}
            className="design-card__preview-image"
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="design-card__preview-placeholder">
            <LayersIcon />
            <span>Sin vista previa</span>
          </div>
        )}
        
        {/* Overlay con información rápida */}
        <div className="design-card__overlay">
          <div className="design-card__quick-info">
            <div className="design-card__info-item">
              <LayersIcon />
              <span>{totalElements} elementos</span>
            </div>
            <div className="design-card__info-item">
              <span style={{ color: complexityInfo.color }}>
                {complexityInfo.icon}
              </span>
              <span>{complexityInfo.text}</span>
            </div>
            {estimatedDays > 0 && (
              <div className="design-card__info-item">
                <ClockIcon />
                <span>{estimatedDays} días</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="design-card__content">
        <div className="design-card__main-info">
          <h3 className="design-card__title" title={name}>
            {name}
          </h3>
          <p className="design-card__product-name" title={productName}>
            {productName}
          </p>
          
          {/* Información del cliente */}
          <div className="design-card__client-info">
            <UserIcon />
            <span className="design-card__client-name" title={userEmail}>
              {userName}
            </span>
          </div>
        </div>

        {/* Fechas importantes */}
        <div className="design-card__dates">
          <div className="design-card__date-item">
            <span className="design-card__date-label">Creado:</span>
            <span className="design-card__date-value">{createdDate}</span>
          </div>
          {quotedDate && (
            <div className="design-card__date-item">
              <span className="design-card__date-label">Cotizado:</span>
              <span className="design-card__date-value">{quotedDate}</span>
            </div>
          )}
          {approvedDate && (
            <div className="design-card__date-item">
              <span className="design-card__date-label">Aprobado:</span>
              <span className="design-card__date-value">{approvedDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="design-card__actions">
        <div className="design-card__primary-actions">
          {/* Acción principal según el estado */}
          {canQuote && onQuote && (
            <button
              className="design-card__btn design-card__btn--primary"
              onClick={() => handleAction(onQuote, 'cotizar')}
              disabled={isLoading}
              title="Cotizar diseño"
            >
              <QuoteIcon />
              <span>Cotizar</span>
            </button>
          )}

          {canRespond && (
            <div className="design-card__response-actions">
              {onApprove && (
                <button
                  className="design-card__btn design-card__btn--success"
                  onClick={() => handleAction(onApprove, 'aprobar')}
                  disabled={isLoading}
                  title="Aprobar cotización"
                >
                  <CheckIcon />
                  <span>Aprobar</span>
                </button>
              )}
              {onReject && (
                <button
                  className="design-card__btn design-card__btn--danger"
                  onClick={() => handleAction(onReject, 'rechazar')}
                  disabled={isLoading}
                  title="Rechazar cotización"
                >
                  <XIcon />
                  <span>Rechazar</span>
                </button>
              )}
            </div>
          )}

          {onView && (
            <button
              className="design-card__btn design-card__btn--primary"
              onClick={() => handleAction(onView, 'ver')}
              disabled={isLoading}
              title="Ver diseño"
            >
              <ViewIcon />
              <span>Ver</span>
            </button>
          )}
        </div>

        {/* Acciones secundarias */}
        <div className="design-card__secondary-actions">
          {canEdit && onEdit && (
            <button
              className="design-card__btn design-card__btn--secondary"
              onClick={() => handleAction(onEdit, 'editar')}
              disabled={isLoading}
              title="Editar diseño"
            >
              <EditIcon />
            </button>
          )}

          {onClone && (
            <button
              className="design-card__btn design-card__btn--secondary"
              onClick={() => handleAction(onClone, 'clonar')}
              disabled={isLoading}
              title="Clonar diseño"
            >
              <CloneIcon />
            </button>
          )}

          {onDelete && (
            <button
              className="design-card__btn design-card__btn--danger-outline"
              onClick={() => handleAction(onDelete, 'eliminar')}
              disabled={isLoading}
              title="Eliminar diseño"
            >
              <DeleteIcon />
            </button>
          )}
        </div>
      </div>

      {/* Indicador de carga */}
      {isLoading && (
        <div className="design-card__loading-overlay">
          <div className="design-card__loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default DesignCard;