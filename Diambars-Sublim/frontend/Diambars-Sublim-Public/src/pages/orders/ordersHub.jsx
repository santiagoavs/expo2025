// pages/orders/ordersHub.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/authContext';
import { useOrders } from '../../hooks/useOrders';
import Footer from '../../components/UI/footer/footer';
import OrderDetailModal from '../../components/orders/orderDetailModal';
import QuoteResponseModal from '../../components/designs/quoteResponseModal';
import QualityApprovalModal from '../../components/orders/qualityApprovalModal';
import './ordersHub.css';

const OrdersHub = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    orders = [], 
    loading, 
    error, 
    refreshOrders 
  } = useOrders();
  
  // Add a retry function
  const handleRetry = () => {
    console.log('🔄 [OrdersHub] Retrying to fetch orders...');
    refreshOrders();
  };

  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [showQualityModal, setShowQualityModal] = useState(false);

  // Estadísticas
  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.isPending).length,
      inProduction: orders.filter(o => ['in_production', 'quality_check'].includes(o.status)).length,
      completed: orders.filter(o => o.status === 'completed').length,
      totalSpent: orders.reduce((sum, o) => sum + (o.total || 0), 0)
    };
  }, [orders]);

  // Filtrar órdenes
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Filtrar por tab
    switch (activeTab) {
      case 'pending':
        filtered = filtered.filter(o => o.isPending);
        break;
      case 'production':
        filtered = filtered.filter(o => ['in_production', 'quality_check'].includes(o.status));
        break;
      case 'completed':
        filtered = filtered.filter(o => o.status === 'completed');
        break;
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderNumber.toLowerCase().includes(term) ||
        order.items?.some(item => 
          item.product?.name.toLowerCase().includes(term)
        )
      );
    }

    return filtered;
  }, [orders, activeTab, searchTerm]);

  // Handlers
  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleRespondQuote = (order) => {
    setSelectedOrder(order);
    setShowQuoteModal(true);
  };

  const handleApproveQuality = (order) => {
    setSelectedOrder(order);
    setShowQualityModal(true);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="orders-hub">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando tus pedidos...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="orders-hub">
        <div className="error-container">
          <h2>Error al cargar los pedidos</h2>
          <p>{error}</p>
          <button 
            onClick={handleRetry}
            className="retry-button"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="orders-hub">
        <div className="auth-required">
          <div className="auth-required-content">
            <h2>Inicia sesión para ver tus pedidos</h2>
            <p>Gestiona y sigue el estado de todos tus pedidos personalizados</p>
            <button 
              onClick={() => window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`}
              className="create-order-btn"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="orders-hub">
      <div className="orders-hub-container">
        {/* Header */}
        <div className="orders-hub-header">
          <div className="hub-title">
            <h1>Mis Pedidos</h1>
            <p>Gestiona y sigue el estado de todos tus pedidos</p>
          </div>
          
          <div className="hub-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar pedidos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="stats-grid">
          <StatsCard
            title="Total de Pedidos"
            value={stats.total}
            color="#1F64BF"
            onClick={() => setActiveTab('all')}
          />
          <StatsCard
            title="Pendientes"
            value={stats.pending}
            subtitle="Esperando aprobación"
            color="#F59E0B"
            onClick={() => setActiveTab('pending')}
          />
          <StatsCard
            title="En producción"
            value={stats.inProduction}
            subtitle="Elaborándose"
            color="#3B82F6"
            onClick={() => setActiveTab('production')}
          />
          <StatsCard
            title="Completados"
            value={stats.completed}
            color="#10B981"
            onClick={() => setActiveTab('completed')}
          />
        </div>

        {/* Tabs */}
        <div className="orders-tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Todos ({stats.total})
          </button>
          <button 
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pendientes ({stats.pending})
          </button>
          <button 
            className={`tab ${activeTab === 'production' ? 'active' : ''}`}
            onClick={() => setActiveTab('production')}
          >
            En producción ({stats.inProduction})
          </button>
          <button 
            className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completados ({stats.completed})
          </button>
        </div>

        {/* Grid de órdenes */}
        <div className="orders-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Cargando pedidos...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📦</div>
              <h3>No hay pedidos</h3>
              <p>Aún no tienes pedidos registrados</p>
            </div>
          ) : (
            <div className="orders-grid">
              {filteredOrders.map(order => (
                <OrderCard 
                  key={order._id} 
                  order={order}
                  onView={handleViewOrder}
                  onRespondQuote={handleRespondQuote}
                  onApproveQuality={handleApproveQuality}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <OrderDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        order={selectedOrder}
      />

      <QuoteResponseModal
        isOpen={showQuoteModal}
        onClose={() => setShowQuoteModal(false)}
        order={selectedOrder}
        onResponse={refreshOrders}
      />

      <QualityApprovalModal
        isOpen={showQualityModal}
        onClose={() => setShowQualityModal(false)}
        order={selectedOrder}
        onApproval={refreshOrders}
      />

      <Footer />
    </div>
  );
};

// Componente auxiliar para tarjetas de estadísticas
const StatsCard = ({ title, value, subtitle, color, onClick }) => (
  <div 
    className={`stats-card ${onClick ? 'clickable' : ''}`}
    onClick={onClick}
    style={{ '--accent-color': color }}
  >
    <div className="stats-value">{value}</div>
    <div className="stats-title">{title}</div>
    {subtitle && <div className="stats-subtitle">{subtitle}</div>}
  </div>
);

// Componente de tarjeta de orden
const OrderCard = ({ order, onView, onRespondQuote, onApproveQuality }) => (
  <div className="order-card">
    <div className="order-card-header">
      <div className="order-info">
        <h3 className="order-number">#{order.orderNumber}</h3>
        <p className="order-date">
          {new Date(order.createdAt).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </p>
        <div className="order-meta">
          <span 
            className="order-status"
            style={{ color: getStatusColor(order.status) }}
          >
            {getStatusLabel(order.status)}
          </span>
        </div>
      </div>
    </div>

    <div className="order-card-content">
      <div className="order-price">
        <strong>${order.total?.toFixed(2)}</strong>
      </div>

      {order.needsResponse && (
        <div className="needs-response-alert">
          <span>⚠️ Requiere tu respuesta</span>
        </div>
      )}
    </div>

    <div className="order-card-actions">
      <button 
        onClick={() => onView(order)}
        className="btn btn-view"
      >
        Ver Detalles
      </button>

      {order.needsResponse && (
        <button 
          onClick={() => onRespondQuote(order)}
          className="btn btn-respond"
        >
          Responder
        </button>
      )}

      {order.hasQualityPending && (
        <button 
          onClick={() => onApproveQuality(order)}
          className="btn btn-quality"
        >
          Aprobar Calidad
        </button>
      )}
    </div>
  </div>
);

// Utilidades
const getStatusColor = (status) => {
  const colors = {
    pending_approval: '#F59E0B',
    quoted: '#3B82F6',
    in_production: '#6366F1',
    quality_check: '#F97316',
    completed: '#10B981',
    delivered: '#059669'
  };
  return colors[status] || '#6B7280';
};

const getStatusLabel = (status) => {
  const labels = {
    pending_approval: 'Pendiente',
    quoted: 'Cotizado',
    approved: 'Aprobado',
    in_production: 'En producción',
    quality_check: 'Control de calidad',
    ready_for_delivery: 'Listo',
    delivered: 'Entregado',
    completed: 'Completado'
  };
  return labels[status] || status;
};

export default OrdersHub;