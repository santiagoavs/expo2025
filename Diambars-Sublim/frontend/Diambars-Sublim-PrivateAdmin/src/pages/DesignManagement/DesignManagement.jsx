// src/pages/DesignManagement/DesignManagement.jsx
import React, { useState, useEffect } from 'react';
import './DesignManagement.css';
import Navbar from '../../components/NavBar/NavBar';
import DesignCard from '../../components/DesignCard/DesignCard';
import QuoteDesignModal from '../../components/QuoteDesignModal/QuoteDesignModal';
import useDesigns from '../../hooks/useDesigns';
import Swal from 'sweetalert2';

// Iconos simples
const DesignIcon = () => <span style={{ fontSize: 'inherit' }}>🎨</span>;
const PendingIcon = () => <span style={{ fontSize: 'inherit' }}>⏳</span>;
const QuotedIcon = () => <span style={{ fontSize: 'inherit' }}>💰</span>;
const ApprovedIcon = () => <span style={{ fontSize: 'inherit' }}>✅</span>;
const SearchIcon = () => <span style={{ fontSize: 'inherit' }}>🔍</span>;
const FilterIcon = () => <span style={{ fontSize: 'inherit' }}>🔽</span>;
const TrendingIcon = () => <span style={{ fontSize: 'inherit' }}>📈</span>;
const ComplexityIcon = () => <span style={{ fontSize: 'inherit' }}>📊</span>;
const ClockIcon = () => <span style={{ fontSize: 'inherit' }}>⏰</span>;
const MoneyIcon = () => <span style={{ fontSize: 'inherit' }}>💵</span>;

const DesignManagement = () => {
  const {
    designs,
    loading,
    error,
    pagination,
    fetchDesigns,
    submitQuote,
    getDesignStats,
    cloneDesign
  } = useDesigns();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [complexityFilter, setComplexityFilter] = useState('all');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [quotingLoading, setQuotingLoading] = useState(false);

  // Filtrar diseños
  const filteredDesigns = designs.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         design.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || design.status === statusFilter;
    const matchesComplexity = complexityFilter === 'all' || design.complexity === complexityFilter;
    
    return matchesSearch && matchesStatus && matchesComplexity;
  });

  // Obtener estadísticas
  const stats = getDesignStats();

  // Estadísticas principales para mostrar
  const mainStats = [
    {
      id: 'pending-designs',
      title: "Diseños Pendientes",
      value: stats.pending,
      change: `${stats.pending} requieren cotización`,
      trend: "neutral",
      icon: PendingIcon,
      color: "blue",
      description: "Diseños esperando cotización"
    },
    {
      id: 'quoted-designs',
      title: "Cotizaciones Activas", 
      value: stats.quoted,
      change: `${stats.activeQuotes} esperando respuesta`,
      trend: "up",
      icon: QuotedIcon,
      color: "orange",
      description: "Cotizaciones enviadas al cliente"
    },
    {
      id: 'approved-designs',
      title: "Diseños Aprobados",
      value: stats.approved,
      change: `${((stats.approved / stats.total) * 100).toFixed(1)}% de conversión`,
      trend: "up",
      icon: ApprovedIcon,
      color: "green",
      description: "Diseños aprobados por clientes"
    },
    {
      id: 'revenue',
      title: "Ingresos por Diseños",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: `$${stats.avgPrice.toFixed(2)} precio promedio`,
      trend: "up",
      icon: MoneyIcon,
      color: "purple",
      description: "Ingresos totales generados"
    }
  ];

  // Manejar cotización
  const handleQuoteDesign = (designId) => {
    const design = designs.find(d => d.id === designId);
    if (design) {
      setSelectedDesign(design);
      setShowQuoteModal(true);
    }
  };

  const handleSubmitQuote = async (quoteData) => {
    if (!selectedDesign) return;

    try {
      setQuotingLoading(true);
      await submitQuote(selectedDesign.id, quoteData);
      
      setShowQuoteModal(false);
      setSelectedDesign(null);
      
      await Swal.fire({
        title: '¡Cotización enviada!',
        text: 'La cotización ha sido enviada al cliente exitosamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#1F64BF',
        timer: 3000,
        timerProgressBar: true
      });
      
    } catch (error) {
      console.error('Error enviando cotización:', error);
      await Swal.fire({
        title: 'Error',
        text: 'No se pudo enviar la cotización. Intenta de nuevo.',
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#dc3545'
      });
    } finally {
      setQuotingLoading(false);
    }
  };

  // Manejar visualización de diseño
  const handleViewDesign = (designId) => {
    console.log('Ver diseño:', designId);
    Swal.fire({
      title: 'Función en desarrollo',
      text: `Ver diseño: ${designId}`,
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#1F64BF'
    });
  };

  // Manejar clonación
  const handleCloneDesign = async (designId) => {
    const result = await Swal.fire({
      title: '¿Clonar diseño?',
      text: 'Se creará una copia del diseño en estado borrador',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#1F64BF',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, clonar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await cloneDesign(designId);
        
        await Swal.fire({
          title: '¡Diseño clonado!',
          text: 'El diseño se ha clonado exitosamente',
          icon: 'success',
          confirmButtonText: 'Continuar',
          confirmButtonColor: '#1F64BF',
          timer: 2000
        });
      } catch (error) {
        console.error('Error clonando diseño:', error);
      }
    }
  };

  // Manejar eliminación
  const handleDeleteDesign = async (designId) => {
    const result = await Swal.fire({
      title: '¿Eliminar diseño?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      // Aquí iría la lógica de eliminación
      console.log('Eliminar diseño:', designId);
      
      await Swal.fire({
        title: '¡Eliminado!',
        text: 'El diseño ha sido eliminado',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#1F64BF',
        timer: 2000
      });
    }
  };

  if (loading) {
    return (
      <div className="design-loading-container">
        <div className="design-loading-spinner"></div>
        <p className="design-loading-text">Cargando diseños...</p>
      </div>
    );
  }

  return (
    <div className="design-management-page">
      <Navbar />
      
      <div className="design-management-container">
        <div className="design-management-content">
          
          {/* Header Principal */}
          <div className="design-header">
            <div className="design-header-content">
              <div className="design-header-text">
                <h1 className="design-title">Gestión de Diseños</h1>
                <p className="design-description">
                  Administra solicitudes de diseño, cotizaciones y aprobaciones de clientes
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas Principales */}
          <div className="design-stats-section">
            <h2 className="design-section-title">Resumen de Diseños</h2>
            <div className="design-stats-grid">
              {mainStats.map((stat) => (
                <div key={stat.id} className={`design-stat-card design-stat-${stat.color}`}>
                  <div className="design-stat-content">
                    <div className="design-stat-info">
                      <div className="design-stat-header">
                        <h3 className="design-stat-title">{stat.title}</h3>
                        <div className="design-stat-icon">
                          <stat.icon />
                        </div>
                      </div>
                      <div className="design-stat-value">{stat.value}</div>
                      <div className="design-stat-change">
                        <span className={`design-stat-trend design-trend-${stat.trend}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="design-stat-description">
                    {stat.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Estadísticas Adicionales */}
          <div className="design-additional-stats">
            <div className="design-stats-row">
              <div className="design-quick-stat">
                <ComplexityIcon />
                <div>
                  <span className="design-quick-stat-value">{stats.avgProductionTime.toFixed(1)}</span>
                  <span className="design-quick-stat-label">Días promedio</span>
                </div>
              </div>
              <div className="design-quick-stat">
                <TrendingIcon />
                <div>
                  <span className="design-quick-stat-value">{stats.conversionRate.toFixed(1)}%</span>
                  <span className="design-quick-stat-label">Tasa conversión</span>
                </div>
              </div>
              <div className="design-quick-stat">
                <ClockIcon />
                <div>
                  <span className="design-quick-stat-value">{stats.complexityStats.high}</span>
                  <span className="design-quick-stat-label">Complejos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Controles de búsqueda y filtros */}
          <div className="design-controls">
            <div className="design-search-container">
              <div className="design-search-box">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Buscar por nombre, producto o cliente..."
                  className="design-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="design-filters">
              <div className="design-filter-group">
                <FilterIcon />
                <select 
                  className="design-filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Todos los estados</option>
                  <option value="pending">Pendientes</option>
                  <option value="quoted">Cotizados</option>
                  <option value="approved">Aprobados</option>
                  <option value="rejected">Rechazados</option>
                  <option value="completed">Completados</option>
                </select>
              </div>

              <div className="design-filter-group">
                <ComplexityIcon />
                <select 
                  className="design-filter-select"
                  value={complexityFilter}
                  onChange={(e) => setComplexityFilter(e.target.value)}
                >
                  <option value="all">Todas las complejidades</option>
                  <option value="low">Básico</option>
                  <option value="medium">Intermedio</option>
                  <option value="high">Complejo</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Diseños */}
          <div className="design-list-section">
            <div className="design-section-header">
              <div className="design-section-title-wrapper">
                <h2 className="design-section-title">Diseños</h2>
                <span className="design-section-count">({filteredDesigns.length})</span>
              </div>
            </div>

            {filteredDesigns.length > 0 ? (
              <div className="design-grid">
                {filteredDesigns.map((design) => (
                  <DesignCard
                    key={design.id}
                    id={design.id}
                    name={design.name}
                    previewImage={design.previewImage}
                    productName={design.productName}
                    productImage={design.productImage}
                    userName={design.userName}
                    userEmail={design.userEmail}
                    status={design.status}
                    statusColor={design.statusColor}
                    statusText={design.statusText}
                    price={design.price}
                    formattedPrice={design.formattedPrice}
                    complexity={design.complexity}
                    totalElements={design.totalElements}
                    estimatedDays={design.estimatedDays}
                    createdDate={design.createdDate}
                    quotedDate={design.quotedDate}
                    approvedDate={design.approvedDate}
                    canEdit={design.canEdit}
                    canQuote={design.canQuote}
                    canRespond={design.canRespond}
                    onQuote={design.canQuote ? handleQuoteDesign : null}
                    onView={handleViewDesign}
                    onClone={handleCloneDesign}
                    onDelete={handleDeleteDesign}
                  />
                ))}
              </div>
            ) : (
              <div className="design-empty-state">
                <div className="design-empty-icon">
                  <DesignIcon />
                </div>
                <h3 className="design-empty-title">No hay diseños</h3>
                <p className="design-empty-description">
                  {searchQuery || statusFilter !== 'all' || complexityFilter !== 'all'
                    ? 'No se encontraron diseños con los filtros aplicados'
                    : 'Aún no hay solicitudes de diseño. Los clientes pueden crear diseños desde la aplicación pública.'}
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal de cotización */}
      {showQuoteModal && selectedDesign && (
        <QuoteDesignModal
          isOpen={showQuoteModal}
          onClose={() => {
            setShowQuoteModal(false);
            setSelectedDesign(null);
          }}
          onSubmitQuote={handleSubmitQuote}
          design={selectedDesign}
          loading={quotingLoading}
        />
      )}
    </div>
  );
};

export default DesignManagement;