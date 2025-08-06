import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { TbShirt } from "react-icons/tb";
import { MdPendingActions } from "react-icons/md";
import { BiTime } from "react-icons/bi";
import { HiPlus, HiFilter, HiSearch, HiRefresh } from "react-icons/hi";
import { toast } from 'react-hot-toast';
import Navbar from '../../components/navbar/navbar';
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

  // Estados locales para UI
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid, list

  // Fetch products using our custom hook
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
      iconColor: "icon-blue"
    },
    {
      number: isLoading ? '...' : products.filter(p => !p.isActive).length,
      title: "Productos pendientes",
      iconComponent: MdPendingActions,
      iconColor: "icon-pink"
    },
    {
      number: isLoading ? '...' : getLatestProductTime(products),
      title: "Últimos artículos subidos",
      iconComponent: BiTime,
      iconColor: "icon-green"
    }
  ];

  // Get recent products (max 4)
  const recentProducts = isLoading ? [] : products
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  // Handlers
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

  // Effect to refresh data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [refetch]);

  // Helper function to format time since last product
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
      <div className="catalog-page">
        <Navbar />
        <div className="catalog-loading-container">
          <div className="catalog-loading-spinner"></div>
          <p className="catalog-loading-text">Cargando productos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="catalog-page">
        <Navbar />
        <div className="catalog-error-container">
          <div className="catalog-error-content">
            <h2 className="catalog-error-title">Error al cargar productos</h2>
            <p className="catalog-error-message">{error.message}</p>
            <button 
              onClick={handleRefresh}
              className="catalog-error-retry-btn"
              disabled={isRefreshing}
            >
              {isRefreshing ? 'Reintentando...' : 'Reintentar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <Navbar />
      
      <div className="catalog-main-container">
        <div className="catalog-content-wrapper">
          {/* Animated background */}
          <div className="catalog-bg-animation"></div>
          
          {/* Header del catálogo */}
          <motion.div 
            className="catalog-header"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="catalog-header-content">
              <h1 className="catalog-header-title">Gestión de catálogo</h1>
              <p className="catalog-header-subtitle">Gestiona tu catálogo personalizado de sublimación e impresión</p>
            </div>
            
            {/* Search bar */}
            <div className="catalog-search-container">
              <div className="catalog-search-wrapper">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="catalog-search-input"
                />
                <button 
                  onClick={handleSearch}
                  className="catalog-search-btn"
                >
                  <HiSearch size={18} />
                </button>
              </div>
              <button 
                onClick={handleRefresh}
                className="catalog-refresh-btn"
                disabled={isRefreshing}
              >
                <HiRefresh size={18} className={isRefreshing ? 'catalog-refresh-spinning' : ''} />
              </button>
            </div>
          </motion.div>

          {/* Stats cards */}
          <div className="catalog-stats-grid">
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
          <div className="catalog-section">
            <div className="catalog-section-header">
              <h2 className="catalog-section-title">Productos recientes</h2>
              <div className="catalog-section-actions">
                <select 
                  className="catalog-sort-select"
                  value={filters.sort}
                  onChange={handleSortChange}
                >
                  <option value="newest">Más recientes</option>
                  <option value="oldest">Más antiguos</option>
                  <option value="price_asc">Precio: Menor a mayor</option>
                  <option value="price_desc">Precio: Mayor a menor</option>
                  <option value="name_asc">Nombre: A-Z</option>
                  <option value="name_desc">Nombre: Z-A</option>
                </select>
                <button 
                  className="catalog-create-btn"
                  onClick={handleCreateProduct}
                >
                  <HiPlus className="catalog-btn-icon" />
                  <span className="catalog-btn-text">Crear producto</span>
                </button>
              </div>
            </div>

            {/* Recent products grid */}
            <div className="catalog-recent-grid">
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
                <div className="catalog-empty-state">
                  <p className="catalog-empty-text">No hay productos recientes</p>
                </div>
              )}
            </div>
          </div>

          {/* All products section */}
          <div className="catalog-section">
            <div className="catalog-section-header">
              <h2 className="catalog-section-title">Todos los productos</h2>
              <div className="catalog-section-actions">
                <button className="catalog-filter-btn">
                  <HiFilter className="catalog-btn-icon" />
                  <span className="catalog-btn-text">Filtros</span>
                </button>
              </div>
            </div>

            {/* All products grid */}
            <div className="catalog-all-grid">
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
                <div className="catalog-empty-state catalog-empty-all">
                  <p className="catalog-empty-text">No hay productos disponibles</p>
                  <button 
                    onClick={handleCreateProduct}
                    className="catalog-empty-btn"
                  >
                    Crear tu primer producto
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="catalog-pagination">
                <button
                  disabled={!pagination.hasPrev}
                  onClick={() => setFilters(prev => ({ ...prev, page: pagination.prevPage }))}
                  className="catalog-pagination-btn catalog-pagination-prev"
                >
                  Anterior
                </button>
                <span className="catalog-pagination-info">
                  Página {pagination.currentPage} de {pagination.totalPages}
                </span>
                <button
                  disabled={!pagination.hasNext}
                  onClick={() => setFilters(prev => ({ ...prev, page: pagination.nextPage }))}
                  className="catalog-pagination-btn catalog-pagination-next"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatalogManagement;