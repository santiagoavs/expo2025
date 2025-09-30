import React, { useState, useEffect } from 'react';
import { FaTimes, FaBox, FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaTruck, FaCreditCard, FaTag, FaUser, FaMapMarkerAlt, FaPhone, FaEnvelope, FaExternalLinkAlt } from 'react-icons/fa';
import './orderModals.css';

const OrderDetailModal = ({ isOpen, onClose, order, onQuoteResponse, onQualityApprove }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  if (!isOpen || !order) return null;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'No disponible';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
  };

  // Get status icon and color
  const getStatusInfo = (status) => {
    const iconStyle = { fontSize: '20px' };
    switch (status) {
      case 'completed':
        return { icon: <FaCheckCircle style={iconStyle} />, color: '#10B981' };
      case 'cancelled':
        return { icon: <FaTimesCircle style={iconStyle} />, color: '#EF4444' };
      case 'in_production':
        return { icon: <FaBox style={iconStyle} />, color: '#3B82F6' };
      case 'quality_check':
        return { icon: <FaCheckCircle style={iconStyle} />, color: '#F59E0B' };
      case 'pending_approval':
      case 'quoted':
        return { icon: <FaClock style={iconStyle} />, color: '#F59E0B' };
      default:
        return { icon: <FaInfoCircle style={iconStyle} />, color: '#6B7280' };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <FaBox style={{ fontSize: '24px' }} />
            <h2>Orden #{order.orderNumber}</h2>
          </div>
          <button className="close-button" onClick={onClose}>
            <FaTimes style={{ fontSize: '24px' }} />
          </button>
        </div>

        <div className="modal-content">
          {/* Order Status */}
          <div className="status-section">
            <div className="status-badge" style={{ backgroundColor: `${statusInfo.color}15`, borderColor: statusInfo.color }}>
              {statusInfo.icon}
              <span style={{ color: statusInfo.color }}>{getStatusLabel(order.status)}</span>
            </div>
            
            <div className="status-timeline">
              <div className={`timeline-step ${order.status === 'pending_approval' ? 'active' : ''} ${['quoted', 'in_production', 'quality_check', 'completed'].includes(order.status) ? 'completed' : ''}`}>
                <div className="timeline-icon">1</div>
                <span>Pendiente</span>
              </div>
              <div className={`timeline-step ${order.status === 'quoted' ? 'active' : ''} ${['in_production', 'quality_check', 'completed'].includes(order.status) ? 'completed' : ''}`}>
                <div className="timeline-icon">2</div>
                <span>Cotizado</span>
              </div>
              <div className={`timeline-step ${order.status === 'in_production' ? 'active' : ''} ${['quality_check', 'completed'].includes(order.status) ? 'completed' : ''}`}>
                <div className="timeline-icon">3</div>
                <span>En Producción</span>
              </div>
              <div className={`timeline-step ${order.status === 'quality_check' ? 'active' : ''} ${['completed'].includes(order.status) ? 'completed' : ''}`}>
                <div className="timeline-icon">4</div>
                <span>Control de Calidad</span>
              </div>
              <div className={`timeline-step ${order.status === 'completed' ? 'active' : ''}`}>
                <div className="timeline-icon">5</div>
                <span>Completado</span>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h3>Resumen del Pedido</h3>
            <div className="summary-grid">
              <div className="summary-item">
                <FaCalendarAlt style={{ fontSize: '20px' }} />
                <div>
                  <span className="label">Fecha del Pedido</span>
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>
              <div className="summary-item">
                <FaClock style={{ fontSize: '20px' }} />
                <div>
                  <span className="label">Última Actualización</span>
                  <span>{formatDate(order.updatedAt)}</span>
                </div>
              </div>
              <div className="summary-item">
                <FaCreditCard style={{ fontSize: '20px' }} />
                <div>
                  <span className="label">Método de Pago</span>
                  <span>{order.paymentMethod || 'No especificado'}</span>
                </div>
              </div>
              <div className="summary-item">
                <FaTag style={{ fontSize: '20px' }} />
                <div>
                  <span className="label">Total</span>
                  <span>${order.total?.toLocaleString('es-ES') || '0'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div className="shipping-section">
            <h3>Información de Envío</h3>
            <div className="shipping-info">
              <div className="shipping-address">
                <FaMapMarkerAlt style={{ fontSize: '20px' }} />
                <div>
                  <span className="label">Dirección de Envío</span>
                  <span>{order.shippingAddress?.street || 'No especificada'}</span>
                  <span>{order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.postalCode}</span>
                  <span>{order.shippingAddress?.country}</span>
                </div>
              </div>
              <div className="shipping-contact">
                <FaUser style={{ fontSize: '20px' }} />
                <div>
                  <span className="label">Contacto</span>
                  <span>{order.shippingAddress?.name || 'No especificado'}</span>
                  <span><FaPhone style={{ fontSize: '16px' }} /> {order.shippingAddress?.phone || 'No especificado'}</span>
                  <span><FaEnvelope style={{ fontSize: '16px' }} /> {order.shippingAddress?.email || 'No especificado'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="order-items">
            <h3>Productos ({order.items?.length || 0})</h3>
            {order.items?.map((item, index) => (
              <div key={index} className="order-item">
                <div className="item-image">
                  {item.product?.images?.[0] ? (
                    <img src={item.product.images[0]} alt={item.product.name} />
                  ) : (
                    <div className="image-placeholder">
                      <FaBox style={{ fontSize: '24px' }} />
                    </div>
                  )}
                </div>
                <div className="item-details">
                  <h4>{item.product?.name || 'Producto sin nombre'}</h4>
                  <div className="item-attributes">
                    <span>Tamaño: {item.size || 'Único'}</span>
                    <span>Cantidad: {item.quantity || 1}</span>
                    {item.color && <span>Color: {item.color}</span>}
                  </div>
                  {item.designId && (
                    <button 
                      className="view-design-button"
                      onClick={() => window.open(`/designs/${item.designId}`, '_blank')}
                    >
                      <FaExternalLinkAlt style={{ fontSize: '16px' }} /> Ver diseño
                    </button>
                  )}
                </div>
                <div className="item-price">
                  ${(item.price * item.quantity).toLocaleString('es-ES')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary-button" onClick={onClose}>
            Cerrar
          </button>
          
          {order.status === 'quoted' && (
            <button 
              className="primary-button"
              onClick={() => onQuoteResponse(order)}
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Responder Cotización'}
            </button>
          )}
          
          {order.status === 'quality_check' && order.productionPhotos?.some(p => !p.clientResponse) && (
            <button 
              className="primary-button"
              onClick={() => onQualityApprove(order)}
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Revisar Calidad'}
            </button>
          )}
          
          {order.status === 'in_production' && (
            <a 
              href={`/tracking/${order.trackingNumber}`} 
              className="primary-button"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaTruck style={{ fontSize: '18px' }} /> Seguimiento
            </a>
          )}
        </div>
        
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
};

// Helper function to get status label
const getStatusLabel = (status) => {
  const statusMap = {
    'pending_approval': 'Pendiente de Aprobación',
    'quoted': 'Cotizado',
    'in_production': 'En Producción',
    'quality_check': 'En Revisión de Calidad',
    'completed': 'Completado',
    'cancelled': 'Cancelado'
  };
  return statusMap[status] || status;
};

export default OrderDetailModal;
