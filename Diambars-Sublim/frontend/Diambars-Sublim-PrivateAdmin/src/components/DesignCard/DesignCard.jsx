// src/components/DesignCard/DesignCard.jsx - TARJETA DE DISEÑO ADMIN
import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import './DesignCard.css';

import {
  Eye,
  PencilSimple,
  CurrencyDollar,
  Copy,
  Warning,
  Trash,
  Package,
  Clock,
  User,
  Crown
} from '@phosphor-icons/react';

const DesignCard = ({
  id,
  name,
  previewImage, 
  price, 
  status,
  clientName,
  clientEmail,
  clientRole = 'customer', // Nuevo prop para el rol del cliente
  productName,
  productImage,
  elements = [],
  elementsCount,
  complexity,
  createdDate,
  daysAgo,
  canEdit,
  canQuote,
  canApprove,
  onEdit,
  onDelete,
  onView,
  onClone,
  onQuote,
  onChangeStatus,
  loading = false
}) => {
  const [imageError, setImageError] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const [productImg, setProductImg] = useState(null);
  const stageRef = useRef(null);

  const getStatusConfig = (status) => {
    const configs = {
      draft: { text: 'BORRADOR', color: '#6B7280', bgColor: '#F3F4F6' },
      pending: { text: 'PENDIENTE', color: '#F59E0B', bgColor: '#FEF3C7' },
      quoted: { text: 'COTIZADO', color: '#1F64BF', bgColor: '#DBEAFE' },
      approved: { text: 'APROBADO', color: '#10B981', bgColor: '#D1FAE5' },
      rejected: { text: 'RECHAZADO', color: '#EF4444', bgColor: '#FEE2E2' },
      completed: { text: 'COMPLETADO', color: '#8B5CF6', bgColor: '#EDE9FE' },
      cancelled: { text: 'CANCELADO', color: '#6B7280', bgColor: '#F3F4F6' },
      archived: { text: 'ARCHIVADO', color: '#6B7280', bgColor: '#F3F4F6' }
    };
    return configs[status] || configs.draft;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Sin cotizar';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Cargar imagen del producto para el canvas
  useEffect(() => {
    if (productImage && !previewImage) {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        setProductImg(img);
      };
      img.src = productImage;
    }
  }, [productImage, previewImage]);


  const handleAction = (action, e) => {
    e.stopPropagation();
    if (loading) return;
    
    switch (action) {
      case 'view':
        onView?.(id);
        break;
      case 'edit':
        onEdit?.(id);
        break;
      case 'clone':
        onClone?.(id);
        break;
      case 'quote':
        onQuote?.(id);
        break;
      case 'status':
        onChangeStatus?.(id);
        break;
      case 'delete':
        onDelete?.(id);
        break;
    }
  };

  const statusConfig = getStatusConfig(status);

  return (
    <div 
      className={`design-card-container ${loading ? 'design-loading' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Imagen del diseño */}
      <div className="design-image-wrapper">
        {previewImage && !imageError ? (
          <img
            src={previewImage}
            alt={name}
            className="design-card-image"
            onError={handleImageError}
          />
        ) : (
          <div className="design-image-fallback">
            {elements && elements.length > 0 ? (
              <Stage
                ref={stageRef}
                width={327}
                height={220}
                style={{ 
                  background: '#f8f9fa',
                  width: '100%',
                  height: '100%'
                }}
              >
                <Layer>
                  {/* Solo imagen del producto */}
                  {productImg && (
                    <KonvaImage
                      image={productImg}
                      x={0}
                      y={0}
                      width={327}
                      height={220}
                      opacity={0.8}
                    />
                  )}
                </Layer>
              </Stage>
            ) : (
              <>
                <Package size={32} weight="duotone" />
                <span>Sin vista previa</span>
              </>
            )}
          </div>
        )}
        
        {/* Etiqueta de estado - posición original */}
        <div 
          className="design-status-badge"
          data-status={status}
          style={{
            color: statusConfig.color,
            backgroundColor: statusConfig.bgColor
          }}
        >
          {statusConfig.text}
        </div>
      </div>

      {/* Overlay de acciones */}
      <div className={`design-actions-overlay ${showActions ? 'design-overlay-visible' : ''}`}>
        <div className="design-action-buttons">
          {/* Acciones principales con texto */}
          <div className="design-primary-actions">
            <button
              className="design-action-btn design-view-btn"
              onClick={(e) => handleAction('view', e)}
              disabled={loading}
              title="Ver diseño"
            >
              <Eye size={16} weight="duotone" />
              <span className="design-action-text">Ver</span>
            </button>
            
            {canEdit && (
              <button
                className="design-action-btn design-edit-btn"
                onClick={(e) => handleAction('edit', e)}
                disabled={loading}
                title="Editar diseño"
              >
                <PencilSimple size={16} weight="duotone" />
                <span className="design-action-text">Editar</span>
              </button>
            )}
            
            {canQuote && (
              <button
                className="design-action-btn design-quote-btn"
                onClick={(e) => handleAction('quote', e)}
                disabled={loading}
                title="Cotizar diseño"
              >
                <CurrencyDollar size={16} weight="duotone" />
                <span className="design-action-text">Cotizar</span>
              </button>
            )}
          </div>

          {/* Acciones secundarias solo con iconos */}
          <div className="design-secondary-actions">
            <button
              className="design-action-btn design-clone-btn"
              onClick={(e) => handleAction('clone', e)}
              disabled={loading}
              title="Clonar diseño"
            >
              <Copy size={16} weight="duotone" />
            </button>
            
            <button
              className="design-action-btn design-status-btn"
              onClick={(e) => handleAction('status', e)}
              disabled={loading}
              title="Cambiar estado"
            >
              <Warning size={16} weight="duotone" />
            </button>
            
            <button
              className="design-action-btn design-delete-btn"
              onClick={(e) => handleAction('delete', e)}
              disabled={loading}
              title="Eliminar diseño"
            >
              <Trash size={16} weight="duotone" />
            </button>
          </div>
        </div>
      </div>

      {/* Información del diseño */}
      <div className="design-card-info">
        {/* Header con nombre */}
        <div className="design-card-header">
          <h3 className="design-card-name">{name}</h3>
        </div>

        {/* Producto asociado */}
        <div className="design-card-product">
          {productName}
        </div>

        {/* Sección de cliente destacada */}
        <div className="design-client-section">
          <div className="design-client-header">
            <div className="design-client-icon">
              {clientRole === 'admin' ? <Crown size={12} weight="fill" /> : <User size={12} weight="fill" />}
            </div>
            <span className="design-client-label">Cliente</span>
            <div className={`design-client-type ${clientRole}`}>
              {clientRole === 'admin' ? 'ADMIN' : 'CLIENTE'}
            </div>
          </div>
          <div className="design-client-name">{clientName}</div>
          <div className="design-client-email">{clientEmail}</div>
        </div>

        {/* Detalles del diseño */}
        <div className="design-card-details">
          <div className="design-card-price">
            <strong>{formatPrice(price)}</strong>
          </div>
        </div>

        {/* Metadatos */}
        <div className="design-card-meta">
          <div className="design-card-id">
            ID: {id}
          </div>
        </div>

        {/* Estadísticas */}
        <div className="design-card-stats">
          <div className="design-stat-item">
            <Package size={14} weight="duotone" />
            <span>{elementsCount || 0} elementos</span>
          </div>
          <div className="design-stat-item">
            <Clock size={14} weight="duotone" />
            <span>{daysAgo === 0 ? 'Hoy' : daysAgo === 1 ? 'Ayer' : `Hace ${daysAgo} días`}</span>
          </div>
        </div>
      </div>

      {/* Efecto de brillo */}
      <div className="design-card-glow"></div>
    </div>
  );
};

export default DesignCard;