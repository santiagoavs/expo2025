import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TbShirt } from "react-icons/tb";
import { MdPendingActions } from "react-icons/md";
import { BiTime } from "react-icons/bi";
import { HiPlus, HiFilter, HiSearch, HiRefresh } from "react-icons/hi";
import { toast } from 'react-hot-toast';
import MainLayout from '../../';
import StatCard from '../../components/UI/StatCard';
import ProductCard from '../../components/UI/ProductCard';
import { useProducts } from '../../hooks/useProducts';
import './CatalogManagement.css';

const CatalogManagement = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    sort: 'newest',
    category: '',
    status: '',
    search: ''
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { 
    products, 
    pagination,
    isLoading, 
    error,
    isError,
    refetch 
  } = useProducts(filters);

  // Calculate stats from fetched products
  const stats = [
    {
      number: isLoading ? '...' : products.filter(p => p.isActive).length,
      title: "Productos activos",
      iconComponent: TbShirt,
      iconColor: "catalog-management-icon-blue"
    },
    {
      number: isLoading ? '...' : products.filter(p => !p.isActive).length,
      title: "Productos pendientes",
      iconComponent: MdPendingActions,
      iconColor: "catalog-management-icon-pink"
    },
    {
      number: isLoading ? '...' : getLatestProductTime(products),
      title: "Últimos artículos subidos",
      iconComponent: BiTime,
      iconColor: "catalog-management-icon-green"
    }
  ];

  const recentProducts = isLoading ? [] : products
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  // Event handlers (mantenidos igual)
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleCreateProduct = () => {
    navigate('/product-creation');
  };

  const handleProductOptions = (productId) => {
    setSelectedProduct(productId);
    toast.success(`Opciones para producto ${productId}`);
  };

  const handleSortChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, sort: value }));
  };

  const handleSearch = () => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Productos actualizados');
    } catch (error) {
      toast.error('Error al actualizar');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [refetch]);

  // Helper function for time calculation
  function getLatestProductTime(products) {
    if (!products.length) return 'N/A';
    
    const latestDate = new Date(Math.max(...products.map(p => new Date(p.createdAt))));
    const now = new Date();
    const diffMinutes = Math.floor((now - latestDate) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} min`;
    } else if (diffMinutes < 24 * 60) {
      return `${Math.floor(diffMinutes / 60)} horas`;
    } else {
      return `${Math.floor(diffMinutes / (60 * 24))} días`;
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <MainLayout pageId="cm">
        <div className="catalog-management-page">
          <div className="catalog-management-loading-container">
            <div className="catalog-management-loading-spinner"></div>
            <p className="catalog-management-loading-text">Cargando productos...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (isError) {
    return (
      <MainLayout pageId="cm">
        <div className="catalog-management-page">
          <div className="catalog-management-error-container">
            <div className="catalog-management-error-content">
              <h2 className="catalog-management-error-title">Error al cargar productos</h2>
              <p className="catalog-management-error-message">
                {error?.message || 'Ha ocurrido un error inesperado'}
              </p>
              <button 
                onClick={handleRefresh}
                className="catalog-management-error-retry-btn"
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Reintentando...' : 'Reintentar'}
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Main render
  return (
    <MainLayout pageId="cm">
      {/* ✅ WRAPPER PRINCIPAL - SIN CONTAINERS ANIDADOS */}
      <div className="catalog-management-page">
        <div className="catalog-management-content-wrapper">
          {/* Animated background */}
          <div className="catalog-management-bg-animation"></div>
          
          {/* Header */}
          <motion.header 
            className="catalog-management-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="catalog-management-header-content">
              <h1 className="catalog-management-header-title">Gestión de catálogo</h1>
              <p className="catalog-management-header-subtitle">
                Gestiona tu catálogo personalizado de sublimación e impresión
              </p>
            </div>
            
            {/* Search section */}
            <div className="catalog-management-search-section">
              <div className="catalog-management-search-input-container">
                <div className="catalog-management-search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Buscar productos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="catalog-management-search-input"
                  />
                  <div className="catalog-management-search-input-effects"></div>
                </div>
                
                <button 
                  onClick={handleSearch}
                  className="catalog-management-search-btn"
                  aria-label="Buscar productos"
                >
                  <HiSearch size={20} />
                  <div className="catalog-management-btn-ripple"></div>
                </button>
              </div>
              
              <button 
                onClick={handleRefresh}
                className="catalog-management-refresh-btn"
                disabled={isRefreshing}
                aria-label="Actualizar productos"
              >
                <HiRefresh 
                  size={20} 
                  className={isRefreshing ? 'catalog-management-refresh-spinning' : ''} 
                />
                <div className="catalog-management-btn-ripple"></div>
              </button>
            </div>
          </motion.header>

          {/* Stats cards */}
          <div className="catalog-management-stats-grid">
            {stats.map((stat, index) => (
              <StatCard
                key={index}
                number={stat.number}
                title={stat.title}
                IconComponent={stat.iconComponent}
                iconColor={stat.iconColor}
              />
            ))}
          </div>

          {/* Recent products section */}
          <section className="catalog-management-section">
            <div className="catalog-management-section-header">
              <h2 className="catalog-management-section-title">Productos recientes</h2>
              <div className="catalog-management-section-actions">
                <select 
                  className="catalog-management-sort-select"
                  value={filters.sort}
                  onChange={handleSortChange}
                  aria-label="Ordenar productos"
                >
                  <option value="newest">Más recientes</option>
                  <option value="oldest">Más antiguos</option>
                  <option value="price_asc">Precio: Menor a mayor</option>
                  <option value="price_desc">Precio: Mayor a menor</option>
                  <option value="name_asc">Nombre: A-Z</option>
                  <option value="name_desc">Nombre: Z-A</option>
                </select>
                
                <button 
                  className="catalog-management-create-btn"
                  onClick={handleCreateProduct}
                >
                  <HiPlus className="catalog-management-btn-icon" />
                  <span className="catalog-management-btn-text">Crear producto</span>
                  <div className="catalog-management-btn-shine"></div>
                  <div className="catalog-management-btn-ripple"></div>
                </button>
              </div>
            </div>

            {/* Recent products grid */}
            <div className="catalog-management-recent-grid">
              {recentProducts.length > 0 ? (
                recentProducts.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={handleProductClick}
                    onOptionsClick={handleProductOptions}
                  />
                ))
              ) : (
                <div className="catalog-management-empty-state">
                  <p className="catalog-management-empty-text">No hay productos recientes</p>
                </div>
              )}
            </div>
          </section>

          {/* All products section */}
          <section className="catalog-management-section">
            <div className="catalog-management-section-header">
              <h2 className="catalog-management-section-title">Todos los productos</h2>
              <div className="catalog-management-section-actions">
                <button className="catalog-management-filter-btn">
                  <HiFilter className="catalog-management-btn-icon" />
                  <span className="catalog-management-btn-text">Filtros</span>
                  <div className="catalog-management-btn-shine"></div>
                  <div className="catalog-management-btn-ripple"></div>
                </button>
              </div>
            </div>

            {/* All products grid */}
            <div className="catalog-management-all-grid">
              {products.length > 0 ? (
                products.map(product => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    onClick={handleProductClick}
                    onOptionsClick={handleProductOptions}
                  />
                ))
              ) : (
                <div className="catalog-management-empty-state">
                  <p className="catalog-management-empty-text">No hay productos disponibles</p>
                  <button 
                    onClick={handleCreateProduct}
                    className="catalog-management-empty-btn"
                  >
                    Crear tu primer producto
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination?.totalPages > 1 && (
              <div className="catalog-management-pagination">
                <button
                  disabled={!pagination.hasPrev}
                  onClick={() => setFilters(prev => ({ ...prev, page: pagination.prevPage }))}
                  className="catalog-management-pagination-btn"
                >
                  Anterior
                </button>
                <span className="catalog-management-pagination-info">
                  Página {pagination.currentPage} de {pagination.totalPages}
                </span>
                <button
                  disabled={!pagination.hasNext}
                  onClick={() => setFilters(prev => ({ ...prev, page: pagination.nextPage }))}
                  className="catalog-management-pagination-btn"
                >
                  Siguiente
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  );
};

export default CatalogManagement;