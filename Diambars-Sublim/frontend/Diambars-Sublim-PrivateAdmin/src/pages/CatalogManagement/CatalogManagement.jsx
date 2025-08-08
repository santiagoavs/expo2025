import React, { useState, useEffect } from 'react';
import './CatalogManagement.css';
import Navbar from '../../components/NavBar/NavBar';
import StatCard from '../../components/StatCard/StatCard';
import ProductCard from '../../components/ProductCard/ProductCard';
import QuickActions from '../../components/QuickActions/QuickActions';
import { TbShirt, TbTruckDelivery } from "react-icons/tb";
import { MdPendingActions, MdInventory, MdAnalytics } from "react-icons/md";
import { BiTime, BiTrendingUp } from "react-icons/bi";
import { FaPlus, FaFilter, FaSearch } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

const CatalogManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  // Simular carga inicial
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Datos de estadísticas principales
  const mainStats = [
    {
      id: 'active-products',
      title: "Productos Activos",
      value: 247,
      change: "+12%",
      trend: "up",
      icon: TbShirt,
      color: "blue",
      description: "Productos disponibles en el catálogo"
    },
    {
      id: 'pending-orders',
      title: "Pedidos Pendientes",
      value: 18,
      change: "+5%",
      trend: "up",
      icon: MdPendingActions,
      color: "orange",
      description: "Pedidos esperando procesamiento"
    },
    {
      id: 'revenue',
      title: "Ingresos del Mes",
      value: "$12,847",
      change: "+23%",
      trend: "up",
      icon: BiTrendingUp,
      color: "green",
      description: "Ingresos generados este mes"
    },
    {
      id: 'delivery',
      title: "En Entrega",
      value: 34,
      change: "-2%",
      trend: "down",
      icon: TbTruckDelivery,
      color: "purple",
      description: "Productos en proceso de entrega"
    }
  ];

  // Datos de productos recientes
  const recentProducts = [
    {
      id: 'REC001',
      name: "Camiseta Premium Sublimada",
      image: "/src/img/camiseta.png",
      price: 29.99,
      status: "active",
      category: "Textil",
      sales: 45,
      createdAt: "2024-12-15"
    },
    {
      id: 'REC002',
      name: "Taza Personalizada Cerámica",
      image: "/src/img/taza.png",
      price: 18.99,
      status: "pending",
      category: "Cerámica",
      sales: 32,
      createdAt: "2024-12-14"
    },
    {
      id: 'REC003',
      name: "Funda iPhone Sublimada",
      image: "/src/img/funda.png",
      price: 24.99,
      status: "active",
      category: "Accesorios",
      sales: 67,
      createdAt: "2024-12-13"
    },
    {
      id: 'REC004',
      name: "Bolso Eco Personalizado",
      image: "/src/img/bolso.png",
      price: 35.99,
      status: "active",
      category: "Textil",
      sales: 23,
      createdAt: "2024-12-12"
    }
  ];

  // Datos de productos más vendidos
  const topProducts = [
    {
      id: 'TOP001',
      name: "Camiseta Deportiva Pro",
      image: "/src/img/camiseta.png",
      price: 32.99,
      status: "active",
      category: "Textil",
      sales: 156,
      createdAt: "2024-11-20"
    },
    {
      id: 'TOP002',
      name: "Taza Mágica Térmica",
      image: "/src/img/taza.png",
      price: 22.99,
      status: "active",
      category: "Cerámica",
      sales: 134,
      createdAt: "2024-11-18"
    },
    {
      id: 'TOP003',
      name: "Funda Samsung Galaxy",
      image: "/src/img/funda.png",
      price: 26.99,
      status: "active",
      category: "Accesorios",
      sales: 128,
      createdAt: "2024-11-15"
    },
    {
      id: 'TOP004',
      name: "Bolso Tote Premium",
      image: "/src/img/bolso.png",
      price: 42.99,
      status: "active",
      category: "Textil",
      sales: 119,
      createdAt: "2024-11-12"
    },
    {
      id: 'TOP005',
      name: "Camiseta Vintage Style",
      image: "/src/img/camiseta.png",
      price: 28.99,
      status: "active",
      category: "Textil",
      sales: 98,
      createdAt: "2024-11-10"
    },
    {
      id: 'TOP006',
      name: "Taza Clásica 320ml",
      image: "/src/img/taza.png",
      price: 16.99,
      status: "active",
      category: "Cerámica",
      sales: 87,
      createdAt: "2024-11-08"
    }
  ];

  const handleCreateProduct = () => {
    navigate('/product-creation');
  };

  const handleManageInventory = () => {
    navigate('/inventory');
  };

  const handleViewReports = () => {
    navigate('/stats');
  };

  if (isLoading) {
    return (
      <div className="catalog-loading">
        <div className="loading-spinner"></div>
        <p>Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <Navbar />
      
      <div className="catalog-container">
        <div className="catalog-content">
          
          {/* Header Principal */}
          <div className="page-header">
            <div className="header-content">
              <div className="header-text">
                <h1 className="page-title">Gestión de Catálogo</h1>
                <p className="page-description">
                  Administra tu inventario de productos personalizados y sublimados
                </p>
              </div>
              
              <div className="header-actions">
                <button 
                  className="primary-btn"
                  onClick={handleCreateProduct}
                >
                  <FaPlus />
                  <span>Nuevo Producto</span>
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas Principales */}
          <div className="stats-section">
            <h2 className="section-title">Resumen General</h2>
            <div className="stats-grid">
              {mainStats.map((stat) => (
                <StatCard
                  key={stat.id}
                  {...stat}
                />
              ))}
            </div>
          </div>

          {/* Acciones Rápidas */}
          <QuickActions 
            onCreateProduct={handleCreateProduct}
            onManageInventory={handleManageInventory}
            onViewReports={handleViewReports}
          />

          {/* Productos Recientes */}
          <div className="products-section">
            <div className="section-header">
              <div className="section-title-wrapper">
                <h2 className="section-title">Productos Recientes</h2>
                <span className="section-count">({recentProducts.length})</span>
              </div>
              
              <div className="section-actions">
                <div className="filter-group">
                  <FaFilter className="filter-icon" />
                  <select 
                    className="filter-select"
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="pending">Pendientes</option>
                  </select>
                </div>
                
                <button className="view-all-btn">
                  Ver Todos
                </button>
              </div>
            </div>

            <div className="products-grid recent-grid">
              {recentProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  {...product}
                />
              ))}
            </div>
          </div>

          {/* Productos Más Vendidos */}
          <div className="products-section">
            <div className="section-header">
              <div className="section-title-wrapper">
                <h2 className="section-title">Más Vendidos</h2>
                <span className="section-count">({topProducts.length})</span>
              </div>
              
              <div className="section-actions">
                <button className="analytics-btn" onClick={handleViewReports}>
                  <MdAnalytics />
                  <span>Ver Análisis</span>
                </button>
              </div>
            </div>

            <div className="products-grid top-grid">
              {topProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  {...product}
                  rank={index + 1}
                  isTopProduct={true}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CatalogManagement;