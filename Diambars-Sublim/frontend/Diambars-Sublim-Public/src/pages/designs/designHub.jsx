// src/pages/designs/DesignHub.jsx - CENTRO DE DISEÑOS CON MODALES
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/authContext';
import useDesigns from '../../hooks/useDesign';
import useProducts from '../../hooks/useProducts';
import Footer from '../../components/UI/footer/footer';
import CreateDesignModal from '../../components/designs/createDesignModal';
// import DesignEditorModal from '../../components/designs/designEditorModal'; // Replaced with enhanced version
import EnhancedDesignEditorModal from '../../components/designs/EnhancedDesignEditorModal';
import DesignViewerModal from '../../components/designs/designViewerModal';
import './designHub.css';

const DesignHub = ({ initialProductId = null }) => {
  const { user, isAuthenticated } = useAuth();
  const { 
    designs, 
    loading, 
    error, 
    createDesign, 
    updateDesign, 
    cloneDesign, 
    cancelDesign, 
    getDesignById,
    getDesignStats,
    needsResponseDesigns,
    hasDesigns
  } = useDesigns();
  
  const { 
    getProductById,
    searchProducts 
  } = useProducts();

  // ==================== ESTADOS DE MODALES ====================
  const [modals, setModals] = useState({
    create: false,
    viewer: false
  });

  // Enhanced editor modal state
  const [editorModal, setEditorModal] = useState({
    isOpen: false,
    design: null
  });

  // ==================== ESTADOS DE DATOS ====================
  const [activeTab, setActiveTab] = useState('all'); // all, drafts, pending, quoted, approved, completed
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDesigns, setFilteredDesigns] = useState([]);

  // ==================== EFECTOS ====================

  // Abrir modal de creación si viene con producto inicial
  useEffect(() => {
    if (initialProductId && isAuthenticated) {
      handleCreateDesign(initialProductId);
    }
  }, [initialProductId, isAuthenticated]);

  // Filtrar diseños según tab activo y búsqueda
  useEffect(() => {
    let filtered = [...designs];

    // Filtrar por tab
    switch (activeTab) {
      case 'drafts':
        filtered = designs.filter(d => d.status === 'draft');
        break;
      case 'pending':
        filtered = designs.filter(d => d.status === 'pending');
        break;
      case 'quoted':
        filtered = designs.filter(d => d.status === 'quoted');
        break;
      case 'approved':
        filtered = designs.filter(d => d.status === 'approved');
        break;
      case 'completed':
        filtered = designs.filter(d => d.status === 'completed');
        break;
      case 'all':
      default:
        // Mostrar todos menos cancelados y archivados
        filtered = designs.filter(d => !['cancelled', 'archived'].includes(d.status));
        break;
    }

    // Filtrar por búsqueda
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(design => 
        design.name.toLowerCase().includes(term) ||
        design.product?.name.toLowerCase().includes(term) ||
        design.clientNotes.toLowerCase().includes(term)
      );
    }

    setFilteredDesigns(filtered);
  }, [designs, activeTab, searchTerm]);

  // ==================== MANEJADORES DE MODALES ====================

  const openModal = useCallback((modalName, data = null) => {
    setModals(prev => ({ ...prev, [modalName]: true }));
    if (data) {
      if (modalName === 'create') setSelectedProduct(data);
      else setSelectedDesign(data);
    }
  }, []);

  const closeModal = useCallback((modalName) => {
    setModals(prev => ({ ...prev, [modalName]: false }));
    setSelectedDesign(null);
    setSelectedProduct(null);
  }, []);

  // ==================== MANEJADORES DE ACCIONES ====================

  const handleCreateDesign = useCallback(async (productId) => {
    try {
      const product = await getProductById(productId);
      if (product && product.canCustomize) {
        setSelectedProduct(product);
        openModal('create');
      } else {
        alert('Este producto no se puede personalizar');
      }
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      alert('Error al cargar el producto');
    }
  }, [getProductById, openModal]);

  const handleViewDesign = useCallback(async (designId) => {
    try {
      const designData = await getDesignById(designId);
      if (designData) {
        setSelectedDesign(designData);
        openModal('viewer');
      }
    } catch (error) {
      console.error('Error obteniendo diseño:', error);
      alert('Error al cargar el diseño');
    }
  }, [getDesignById, openModal]);

  const handleEditDesign = useCallback(async (designId) => {
    try {
      const designData = await getDesignById(designId);
      if (designData && designData.design.canEdit) {
        setEditorModal({ isOpen: true, design: designData });
      } else {
        alert('Este diseño no se puede editar');
      }
    } catch (error) {
      console.error('Error obteniendo diseño:', error);
      alert('Error al cargar el diseño');
    }
  }, [getDesignById]);

  const handleQuoteResponse = useCallback((design) => {
    // For now, show a simple alert - can be enhanced later
    alert('Funcionalidad de respuesta a cotización será implementada próximamente');
  }, []);

  const handleCloneDesign = useCallback(async (designId, designName) => {
    try {
      const confirmClone = window.confirm(`¿Deseas clonar el diseño "${designName}"?`);
      if (confirmClone) {
        await cloneDesign(designId, { name: `Copia de ${designName}` });
        alert('Diseño clonado exitosamente');
      }
    } catch (error) {
      console.error('Error clonando diseño:', error);
      alert('Error al clonar el diseño');
    }
  }, [cloneDesign]);

  const handleCancelDesign = useCallback(async (designId, designName) => {
    try {
      const reason = window.prompt(`¿Por qué deseas cancelar "${designName}"?\n(Opcional)`);
      if (reason !== null) { // null significa que canceló el prompt
        await cancelDesign(designId, reason);
        alert('Diseño cancelado exitosamente');
      }
    } catch (error) {
      console.error('Error cancelando diseño:', error);
      alert('Error al cancelar el diseño');
    }
  }, [cancelDesign]);

  // ==================== MANEJADORES DE FORMULARIOS ====================

  const handleCreateSubmit = useCallback(async (designData) => {
    try {
      await createDesign(designData);
      closeModal('create');
      alert('Diseño creado y enviado para cotización');
    } catch (error) {
      console.error('Error creando diseño:', error);
      throw error; // Re-lanzar para que el modal maneje el error
    }
  }, [createDesign, closeModal]);

  // Removed deprecated handleUpdateSubmit - using handleSaveDesign instead

  // Enhanced save handler for the new editor
  const handleSaveDesign = useCallback(async (designData) => {
    try {
      if (editorModal.design?.design?._id) {
        // Update existing design
        await updateDesign(editorModal.design.design._id, designData);
        alert('Diseño actualizado exitosamente');
      } else {
        // Create new design
        await createDesign(designData);
        alert('Diseño creado exitosamente');
      }
      setEditorModal({ isOpen: false, design: null });
    } catch (error) {
      console.error('Error guardando diseño:', error);
      throw error;
    }
  }, [editorModal.design, updateDesign, createDesign]);

  // Handle design update callback
  const handleDesignUpdate = useCallback((updatedDesign) => {
    // Refresh designs list or update local state as needed
    console.log('Design updated:', updatedDesign);
  }, []);

  // Removed deprecated handleQuoteResponseSubmit

  // ==================== COMPONENTES DE UI ====================

  // Renderizar tarjeta de estadísticas
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

  // Renderizar tarjeta de diseño
  const DesignCard = ({ design }) => (
    <div className="design-card">
      <div className="design-card-header">
        <div className="design-info">
          <h3 className="design-name">{design.name}</h3>
          <p className="design-product">{design.product?.name}</p>
          <div className="design-meta">
            <span className="design-date">
              {design.createdAt.toLocaleDateString()}
            </span>
            <span 
              className="design-status"
              style={{ color: design.status === 'quoted' ? '#3B82F6' : 
                            design.status === 'approved' ? '#10B981' : 
                            design.status === 'completed' ? '#059669' :
                            design.status === 'rejected' ? '#EF4444' : '#F59E0B' }}
            >
              {design.status === 'draft' ? 'Borrador' :
               design.status === 'pending' ? 'Pendiente' :
               design.status === 'quoted' ? 'Cotizado' :
               design.status === 'approved' ? 'Aprobado' :
               design.status === 'completed' ? 'Completado' :
               design.status === 'rejected' ? 'Rechazado' : 'Desconocido'}
            </span>
          </div>
        </div>
        
        {design.previewImage && (
          <div className="design-preview">
            <img src={design.previewImage} alt={design.name} />
          </div>
        )}
      </div>

      <div className="design-card-content">
        {design.price > 0 && (
          <div className="design-price">
            <strong>{design.formattedPrice}</strong>
            {design.productionDays > 0 && (
              <span className="production-time">
                {design.productionDays} días
              </span>
            )}
          </div>
        )}

        {design.clientNotes && (
          <div className="design-notes">
            <p>"{design.clientNotes}"</p>
          </div>
        )}

        {design.needsResponse && (
          <div className="needs-response-alert">
            <span>⚠️ Requiere tu respuesta</span>
          </div>
        )}
      </div>

      <div className="design-card-actions">
        <button 
          onClick={() => handleViewDesign(design.id)}
          className="btn btn-view"
        >
          Ver
        </button>

        {design.canEdit && (
          <button 
            onClick={() => handleEditDesign(design.id)}
            className="btn btn-edit"
          >
            Editar
          </button>
        )}

        {design.needsResponse && (
          <button 
            onClick={() => handleQuoteResponse(design)}
            className="btn btn-respond"
          >
            Responder
          </button>
        )}

        <div className="design-menu">
          <button className="btn btn-menu">⋮</button>
          <div className="design-menu-dropdown">
            <button onClick={() => handleCloneDesign(design.id, design.name)}>
              Clonar
            </button>
            {design.canCancel && (
              <button onClick={() => handleCancelDesign(design.id, design.name)}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== RENDERIZADO PRINCIPAL ====================

  if (!isAuthenticated) {
    return (
      <div className="design-hub">
        <div className="auth-required">
          <div className="auth-required-content">
            <h2>Inicia sesión para acceder a tus diseños</h2>
            <p>Crea y gestiona diseños personalizados para tus productos favoritos</p>
            <button 
              onClick={() => window.location.href = '/login'}
              className="create-design-btn"
            >
              Iniciar Sesión
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const stats = getDesignStats();

  return (
    <div className="design-hub">
      <div className="design-hub-container">
        {/* Header */}
        <div className="design-hub-header">
          <div className="hub-title">
            <h1>Mis Diseños</h1>
            <p>Gestiona y personaliza todos tus diseños en un solo lugar</p>
          </div>
          
          <div className="hub-actions">
            <div className="search-box">
              <input
                type="text"
                placeholder="Buscar diseños..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            
            <button 
              onClick={() => openModal('create')}
              className="create-design-btn"
            >
              + Nuevo diseño
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="stats-grid">
          <StatsCard
            title="Total"
            value={stats.total}
            color="#1F64BF"
            onClick={() => setActiveTab('all')}
          />
          <StatsCard
            title="Pendientes"
            value={stats.pending}
            subtitle="Esperando cotización"
            color="#F59E0B"
            onClick={() => setActiveTab('pending')}
          />
          <StatsCard
            title="Cotizados"
            value={stats.quoted}
            subtitle="Requieren respuesta"
            color="#3B82F6"
            onClick={() => setActiveTab('quoted')}
          />
          <StatsCard
            title="Aprobados"
            value={stats.approved}
            subtitle="En producción"
            color="#10B981"
            onClick={() => setActiveTab('approved')}
          />
          <StatsCard
            title="Inversión Total"
            value={`$${stats.totalInvestment.toFixed(2)}`}
            color="#059669"
          />
        </div>

        {/* Alertas */}
        {needsResponseDesigns.length > 0 && (
          <div className="alert alert-info">
            <span className="alert-icon">📢</span>
            <div className="alert-content">
              <strong>Tienes {needsResponseDesigns.length} cotización(es) esperando tu respuesta</strong>
              <p>Revisa las cotizaciones y decide si deseas continuar con la producción.</p>
            </div>
            <button 
              onClick={() => setActiveTab('quoted')}
              className="alert-action"
            >
              Ver Cotizaciones
            </button>
          </div>
        )}

        {/* Tabs de navegación */}
        <div className="design-tabs">
          <button 
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Todos ({stats.total})
          </button>
          <button 
            className={`tab ${activeTab === 'drafts' ? 'active' : ''}`}
            onClick={() => setActiveTab('drafts')}
          >
            Borradores ({stats.drafts})
          </button>
          <button 
            className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            Pendientes ({stats.pending})
          </button>
          <button 
            className={`tab ${activeTab === 'quoted' ? 'active' : ''}`}
            onClick={() => setActiveTab('quoted')}
          >
            Cotizados ({stats.quoted})
          </button>
          <button 
            className={`tab ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            Aprobados ({stats.approved})
          </button>
          <button 
            className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
            onClick={() => setActiveTab('completed')}
          >
            Completados ({stats.completed})
          </button>
        </div>

        {/* Grid de diseños */}
        <div className="designs-content">
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Cargando diseños...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <div className="error-icon">⚠️</div>
              <h3>Error al cargar diseños</h3>
              <p>{error}</p>
              <button onClick={() => window.location.reload()} className="create-design-btn">
                Reintentar
              </button>
            </div>
          ) : filteredDesigns.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">🎨</div>
              <h3>
                {searchTerm ? 'No se encontraron diseños' : 
                 activeTab === 'all' ? 'No tienes diseños aún' :
                 activeTab === 'drafts' ? 'No tienes borradores' :
                 activeTab === 'pending' ? 'No hay diseños pendientes' :
                 activeTab === 'quoted' ? 'No hay cotizaciones' :
                 activeTab === 'approved' ? 'No hay diseños aprobados' :
                 'No hay diseños en esta categoría'}
              </h3>
              <p>
                {searchTerm ? 'Intenta con otro término de búsqueda' :
                 activeTab === 'all' ? 'Crea tu primer diseño personalizado' :
                 'Los diseños aparecerán aquí cuando cambien de estado'}
              </p>
              {(!searchTerm && activeTab === 'all') && (
                <button 
                  onClick={() => openModal('create')}
                  className="create-design-btn"
                >
                  Crear Primer Diseño
                </button>
              )}
            </div>
          ) : (
            <div className="designs-grid">
              {filteredDesigns.map(design => (
                <DesignCard key={design.id} design={design} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      <CreateDesignModal
        isOpen={modals.create}
        onClose={() => closeModal('create')}
        onSubmit={handleCreateSubmit}
        initialProduct={selectedProduct}
        searchProducts={searchProducts}
      />

      <DesignViewerModal
        isOpen={modals.viewer}
        onClose={() => closeModal('viewer')}
        designData={selectedDesign}
        onEdit={handleEditDesign}
        onQuoteResponse={handleQuoteResponse}
      />
      <EnhancedDesignEditorModal
        isOpen={editorModal.isOpen}
        onClose={() => setEditorModal({ isOpen: false, design: null })}
        design={editorModal.design}
        onSave={handleSaveDesign}
        product={editorModal.design?.design?.product || editorModal.design?.product}
        onDesignUpdate={handleDesignUpdate}
      />

      {/* Quote response functionality will be implemented in future updates */}

      <Footer />
    </div>
  );
};

export default DesignHub;