// src/components/designs/DesignViewerModal.jsx - MODAL PARA VER DISEÑOS
import React, { useState, useCallback } from 'react';
import './DesignViewerModal.css';

const DesignViewerModal = ({
  isOpen,
  onClose,
  designData,
  onEdit,
  onQuoteResponse
}) => {
  const [imageError, setImageError] = useState(false);

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleEdit = useCallback(() => {
    if (designData?.design && onEdit) {
      onEdit(designData.design.id);
    }
  }, [designData, onEdit]);

  const handleQuoteResponse = useCallback(() => {
    if (designData?.design && onQuoteResponse) {
      onQuoteResponse(designData.design);
    }
  }, [designData, onQuoteResponse]);

  if (!isOpen || !designData?.design) return null;

  const design = designData.design;
  const order = designData.order;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="design-viewer-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon">👁️</span>
            <div>
              <h2>{design.name}</h2>
              <p>Vista completa del diseño</p>
            </div>
          </div>
          <button onClick={handleClose} className="close-btn">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Información general del diseño */}
          <div className="design-overview">
            <div className="design-main-info">
              <div className="design-visual">
                {design.previewImage && !imageError ? (
                  <img 
                    src={design.previewImage} 
                    alt={design.name}
                    onError={() => setImageError(true)}
                    className="design-preview-large"
                  />
                ) : (
                  <div className="design-preview-placeholder">
                    <span className="placeholder-icon">🎨</span>
                    <p>Vista previa no disponible</p>
                  </div>
                )}
              </div>

              <div className="design-details">
                <div className="detail-section">
                  <h3>Información del Diseño</h3>
                  <div className="detail-grid">
                    <div className="detail-item">
                      <label>Estado:</label>
                      <span 
                        className={`status-badge status-${design.status}`}
                        style={{ color: design.status === 'quoted' ? '#3B82F6' : 
                                      design.status === 'approved' ? '#10B981' : 
                                      design.status === 'completed' ? '#059669' :
                                      design.status === 'rejected' ? '#EF4444' : '#F59E0B' }}
                      >
                        {design.status === 'draft' ? 'Borrador' :
                         design.status === 'pending' ? 'Pendiente de cotización' :
                         design.status === 'quoted' ? 'Cotizado' :
                         design.status === 'approved' ? 'Aprobado' :
                         design.status === 'completed' ? 'Completado' :
                         design.status === 'rejected' ? 'Rechazado' : 'Estado desconocido'}
                      </span>
                    </div>

                    <div className="detail-item">
                      <label>Creado:</label>
                      <span>{design.createdAt?.toLocaleDateString()}</span>
                    </div>

                    {design.quotedAt && (
                      <div className="detail-item">
                        <label>Cotizado:</label>
                        <span>{design.quotedAt.toLocaleDateString()}</span>
                      </div>
                    )}

                    {design.price > 0 && (
                      <div className="detail-item">
                        <label>Precio:</label>
                        <span className="price-value">{design.formattedPrice}</span>
                      </div>
                    )}

                    {design.productionDays > 0 && (
                      <div className="detail-item">
                        <label>Tiempo de producción:</label>
                        <span>{design.productionDays} día{design.productionDays !== 1 ? 's' : ''}</span>
                      </div>
                    )}

                    <div className="detail-item">
                      <label>Elementos:</label>
                      <span>{design.elements?.length || 0} elemento{design.elements?.length !== 1 ? 's' : ''}</span>
                    </div>

                    {design.complexity && (
                      <div className="detail-item">
                        <label>Complejidad:</label>
                        <span className={`complexity-${design.complexity}`}>
                          {design.complexity === 'low' ? 'Baja' :
                           design.complexity === 'medium' ? 'Media' :
                           design.complexity === 'high' ? 'Alta' : design.complexity}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Información del producto */}
                {design.product && (
                  <div className="detail-section">
                    <h3>Producto Base</h3>
                    <div className="product-info">
                      {design.product.image && (
                        <img 
                          src={design.product.image} 
                          alt={design.product.name}
                          className="product-thumbnail"
                        />
                      )}
                      <div>
                        <h4>{design.product.name}</h4>
                        {design.product.customizationAreas?.length > 0 && (
                          <p>{design.product.customizationAreas.length} área{design.product.customizationAreas.length !== 1 ? 's' : ''} de personalización</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Opciones del producto */}
          {design.productOptions && design.productOptions.length > 0 && (
            <div className="design-section">
              <h3>Opciones del Producto</h3>
              <div className="product-options">
                {design.productOptions.map((option, index) => (
                  <div key={index} className="option-item">
                    <span className="option-name">{option.name}:</span>
                    <span className="option-value">{option.value}</span>
                    {option.additionalPrice > 0 && (
                      <span className="option-price">+${option.additionalPrice}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Color del producto */}
          {design.productColorFilter && design.productColorFilter !== '#ffffff' && (
            <div className="design-section">
              <h3>Color del Producto</h3>
              <div className="color-display">
                <div 
                  className="color-swatch"
                  style={{ backgroundColor: design.productColorFilter }}
                ></div>
                <span>{design.productColorFilter}</span>
              </div>
            </div>
          )}

          {/* Notas */}
          {(design.clientNotes || design.adminNotes || design.rejectionReason) && (
            <div className="design-section">
              <h3>Notas y Comentarios</h3>
              
              {design.clientNotes && (
                <div className="note-item client-notes">
                  <h4>Notas del Cliente:</h4>
                  <p>"{design.clientNotes}"</p>
                </div>
              )}
              
              {design.adminNotes && (
                <div className="note-item admin-notes">
                  <h4>Notas del Administrador:</h4>
                  <p>"{design.adminNotes}"</p>
                </div>
              )}
              
              {design.rejectionReason && (
                <div className="note-item rejection-reason">
                  <h4>Motivo del Rechazo:</h4>
                  <p>"{design.rejectionReason}"</p>
                </div>
              )}
            </div>
          )}

          {/* Información del pedido */}
          {order && (
            <div className="design-section">
              <h3>Información del Pedido</h3>
              <div className="order-info">
                <div className="detail-item">
                  <label>Número de Pedido:</label>
                  <span className="order-number">{order.orderNumber}</span>
                </div>
                <div className="detail-item">
                  <label>Estado del Pedido:</label>
                  <span className={`status-badge status-${order.status}`}>
                    {order.status}
                  </span>
                </div>
                {order.estimatedReadyDate && (
                  <div className="detail-item">
                    <label>Fecha Estimada:</label>
                    <span>{new Date(order.estimatedReadyDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Elementos del diseño */}
          {design.elements && design.elements.length > 0 && (
            <div className="design-section">
              <h3>Elementos del Diseño</h3>
              <div className="elements-list">
                {design.elements.map((element, index) => (
                  <div key={index} className="element-item">
                    <div className="element-icon">
                      {element.type === 'text' ? '📝' : 
                       element.type === 'image' ? '🖼️' : '🎨'}
                    </div>
                    <div className="element-info">
                      <strong>
                        {element.type === 'text' ? 'Texto' : 
                         element.type === 'image' ? 'Imagen' : 'Elemento'}
                      </strong>
                      {element.type === 'text' && element.konvaAttrs?.text && (
                        <p>"{element.konvaAttrs.text.substring(0, 50)}{element.konvaAttrs.text.length > 50 ? '...' : ''}"</p>
                      )}
                      <small>
                        Posición: ({Math.round(element.konvaAttrs?.x || 0)}, {Math.round(element.konvaAttrs?.y || 0)})
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer con acciones */}
        <div className="modal-footer">
          <button 
            onClick={handleClose}
            className="btn btn-secondary"
          >
            Cerrar
          </button>

          <div className="footer-actions">
            {design.canEdit && (
              <button 
                onClick={handleEdit}
                className="btn btn-edit"
              >
                ✏️ Editar Diseño
              </button>
            )}

            {design.needsResponse && (
              <button 
                onClick={handleQuoteResponse}
                className="btn btn-respond"
              >
                💰 Responder Cotización
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignViewerModal;