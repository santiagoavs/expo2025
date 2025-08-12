import React, { useState, useEffect } from 'react';
import './CatalogManagement.css';
import Navbar from '../../components/NavBar/NavBar';
import ProductCard from '../../components/ProductCard/ProductCard';
import CreateProductModal from '../../components/CreateProductModal/CreateProductModal';
import Swal from 'sweetalert2';

// Componentes de iconos simples como reemplazo
const ShirtIcon = () => <span style={{ fontSize: 'inherit' }}>👔</span>;
const TruckIcon = () => <span style={{ fontSize: 'inherit' }}>🚛</span>;
const PendingIcon = () => <span style={{ fontSize: 'inherit' }}>⏳</span>;
const InventoryIcon = () => <span style={{ fontSize: 'inherit' }}>📦</span>;
const AnalyticsIcon = () => <span style={{ fontSize: 'inherit' }}>📊</span>;
const TimeIcon = () => <span style={{ fontSize: 'inherit' }}>⏰</span>;
const TrendingIcon = () => <span style={{ fontSize: 'inherit' }}>📈</span>;
const PlusIcon = () => <span style={{ fontSize: 'inherit' }}>+</span>;
const FilterIcon = () => <span style={{ fontSize: 'inherit' }}>🔍</span>;
const SearchIcon = () => <span style={{ fontSize: 'inherit' }}>🔎</span>;

const CatalogManagement = () => {
  // const navigate = useNavigate(); // Comentado temporalmente
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [displayProducts, setDisplayProducts] = useState([]);

  // Hook para manejar productos - comentado temporalmente si no está disponible
  // const {
  //   products: fetchedProducts,
  //   isLoading: loadingProducts,
  //   error: productsError,
  //   createProduct,
  //   refetch
  // } = useProducts();

  // Variables temporales para reemplazar el hook
  const fetchedProducts = [];
  const loadingProducts = false;
  const productsError = null;

  // Datos quemados como fallback
  const fallbackProducts = [
    {
      _id: 'FALLBACK001',
      name: "Camiseta Premium Sublimada",
      images: { main: "/src/img/camiseta.png" },
      basePrice: 29.99,
      isActive: true,
      category: { name: "Textil" },
      metadata: { stats: { orders: 45 } },
      createdAt: "2024-12-15"
    },
    {
      _id: 'FALLBACK002',
      name: "Taza Personalizada Cerámica",
      images: { main: "/src/img/taza.png" },
      basePrice: 18.99,
      isActive: true,
      category: { name: "Cerámica" },
      metadata: { stats: { orders: 32 } },
      createdAt: "2024-12-14"
    },
    {
      _id: 'FALLBACK003',
      name: "Funda iPhone Sublimada",
      images: { main: "/src/img/funda.png" },
      basePrice: 24.99,
      isActive: true,
      category: { name: "Accesorios" },
      metadata: { stats: { orders: 67 } },
      createdAt: "2024-12-13"
    },
    {
      _id: 'FALLBACK004',
      name: "Bolso Eco Personalizado",
      images: { main: "/src/img/bolso.png" },
      basePrice: 35.99,
      isActive: true,
      category: { name: "Textil" },
      metadata: { stats: { orders: 23 } },
      createdAt: "2024-12-12"
    },
    {
      _id: 'FALLBACK005',
      name: "Mouse Pad Gaming",
      images: { main: "https://via.placeholder.com/300x300/1F64BF/FFFFFF?text=MousePad" },
      basePrice: 16.99,
      isActive: true,
      category: { name: "Accesorios" },
      metadata: { stats: { orders: 89 } },
      createdAt: "2024-12-11"
    },
    {
      _id: 'FALLBACK006',
      name: "Gorra Snapback",
      images: { main: "https://via.placeholder.com/300x300/032CA6/FFFFFF?text=Gorra" },
      basePrice: 22.99,
      isActive: true,
      category: { name: "Textil" },
      metadata: { stats: { orders: 56 } },
      createdAt: "2024-12-10"
    },
    {
      _id: 'FALLBACK007',
      name: "Stickers Personalizados",
      images: { main: "https://via.placeholder.com/300x300/040DBF/FFFFFF?text=Stickers" },
      basePrice: 12.99,
      isActive: true,
      category: { name: "Accesorios" },
      metadata: { stats: { orders: 134 } },
      createdAt: "2024-12-09"
    },
    {
      _id: 'FALLBACK008',
      name: "Cuaderno Personalizado",
      images: { main: "https://via.placeholder.com/300x300/010326/FFFFFF?text=Cuaderno" },
      basePrice: 19.99,
      isActive: true,
      category: { name: "Papelería" },
      metadata: { stats: { orders: 78 } },
      createdAt: "2024-12-08"
    }
  ];

  // Efecto para manejar productos - simplificado
  useEffect(() => {
    const timer = setTimeout(() => {
      // Siempre usar productos fallback para asegurar que se muestren
      setDisplayProducts(fallbackProducts);
      setIsLoading(false);
      console.log('Productos cargados:', fallbackProducts);
    }, 1000); // Reducido a 1 segundo

    return () => clearTimeout(timer);
  }, []); // Sin dependencias para evitar problemas

  // Filtrar productos
  const filteredProducts = displayProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'active' && product.isActive) ||
      (selectedFilter === 'pending' && !product.isActive);
    
    return matchesSearch && matchesFilter;
  });

  // Estadísticas calculadas con datos más realistas
  const stats = {
    activeProducts: displayProducts.filter(p => p.isActive).length,
    totalProducts: displayProducts.length,
    totalRevenue: displayProducts.reduce((sum, product) => 
      sum + (product.basePrice * (product.metadata?.stats?.orders || 0)), 0
    ),
    totalOrders: displayProducts.reduce((sum, product) => 
      sum + (product.metadata?.stats?.orders || 0), 0
    ),
    pendingOrders: Math.floor(Math.random() * 15) + 5, // Entre 5-20 pedidos pendientes
    monthlyViews: 2547, // Vistas del mes ficticias
    conversionRate: 12.4 // Tasa de conversión ficticia
  };

  const mainStats = [
    {
      id: 'active-products',
      title: "Productos Activos",
      value: stats.activeProducts,
      change: "+2 este mes",
      trend: "up",
      icon: ShirtIcon,
      color: "blue",
      description: "Productos disponibles en el catálogo"
    },
    {
      id: 'total-orders',
      title: "Pedidos Completados",
      value: stats.totalOrders,
      change: "+15% vs mes anterior",
      trend: "up",
      icon: PendingIcon,
      color: "green",
      description: "Total de pedidos completados"
    },
    {
      id: 'revenue',
      title: "Ingresos Generados",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      change: "+23% este mes",
      trend: "up",
      icon: TrendingIcon,
      color: "purple",
      description: "Ingresos totales por ventas"
    },
    {
      id: 'monthly-views',
      title: "Vistas del Mes",
      value: stats.monthlyViews.toLocaleString(),
      change: "+8% vs mes anterior",
      trend: "up",
      icon: AnalyticsIcon,
      color: "orange",
      description: "Visualizaciones de productos este mes"
    }
  ];

  const handleCreateProduct = () => {
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
  };

  const handleProductCreated = async (productData) => {
    try {
      // Simulamos la creación del producto agregándolo a los datos locales
      const newProduct = {
        _id: `NEW_${Date.now()}`,
        name: productData.name,
        images: { main: productData.imagePreview || "/src/img/placeholder.png" },
        basePrice: productData.basePrice,
        isActive: productData.isActive,
        category: { name: productData.category },
        metadata: { stats: { orders: 0 } },
        createdAt: new Date().toISOString()
      };
      
      // Agregar a la lista actual
      setDisplayProducts(prev => [newProduct, ...prev]);
      setShowCreateModal(false);
      
      // Mostrar notificación de éxito con SweetAlert2
      await Swal.fire({
        title: '¡Producto creado!',
        text: 'El producto se ha creado exitosamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#1F64BF',
        background: '#ffffff',
        color: '#010326',
        showClass: {
          popup: 'animate__animated animate__fadeInDown animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp animate__faster'
        }
      });
      
      // Si tienes la función createProduct del hook, úsala
      // await createProduct(productData);
      // refetch();
    } catch (error) {
      console.error('Error creando producto:', error);
      
      // Mostrar error con SweetAlert2
      await Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al crear el producto',
        icon: 'error',
        confirmButtonText: 'Intentar de nuevo',
        confirmButtonColor: '#040DBF',
        background: '#ffffff',
        color: '#010326'
      });
    }
  };

  const handleEditProduct = (productId) => {
    console.log('Editar producto:', productId);
    
    Swal.fire({
      title: 'Función en desarrollo',
      text: `Editar producto: ${productId}`,
      icon: 'info',
      confirmButtonText: 'Entendido',
      confirmButtonColor: '#1F64BF',
      background: '#ffffff',
      color: '#010326'
    });
  };

  const handleDeleteProduct = async (productId) => {
    const result = await Swal.fire({
      title: '¿Eliminar producto?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#040DBF',
      cancelButtonColor: '#032CA6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      color: '#010326',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      // Remover de la lista local
      setDisplayProducts(prev => prev.filter(product => product._id !== productId));
      
      await Swal.fire({
        title: '¡Eliminado!',
        text: 'El producto ha sido eliminado exitosamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#1F64BF',
        background: '#ffffff',
        color: '#010326',
        timer: 2000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInDown animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutUp animate__faster'
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="catalog-loading-container">
        <div className="catalog-loading-spinner"></div>
        <p className="catalog-loading-text">Cargando catálogo...</p>
      </div>
    );
  }

  return (
    <div className="catalog-management-page">
      <Navbar />
      
      <div className="catalog-management-container">
        <div className="catalog-management-content">
          
          {/* Header Principal */}
          <div className="catalog-header">
            <div className="catalog-header-content">
              <div className="catalog-header-text">
                <h1 className="catalog-title">Gestión de Catálogo</h1>
                <p className="catalog-description">
                  Administra tu inventario de productos personalizados y sublimados
                </p>
              </div>
              
              <div className="catalog-header-actions">
                <button 
                  className="catalog-primary-btn"
                  onClick={handleCreateProduct}
                >
                  <PlusIcon />
                  <span>Nuevo Producto</span>
                </button>
              </div>
            </div>
          </div>

          {/* Estadísticas Principales */}
          <div className="catalog-stats-section">
            <h2 className="catalog-section-title">Resumen General</h2>
            <div className="catalog-stats-grid">
              {mainStats.map((stat) => (
                <div key={stat.id} className={`catalog-stat-card catalog-stat-${stat.color}`}>
                  <div className="catalog-stat-content">
                    <div className="catalog-stat-info">
                      <div className="catalog-stat-header">
                        <h3 className="catalog-stat-title">{stat.title}</h3>
                        <div className="catalog-stat-icon">
                          <stat.icon />
                        </div>
                      </div>
                      <div className="catalog-stat-value">{stat.value}</div>
                      <div className="catalog-stat-change">
                        <span className={`catalog-stat-trend catalog-trend-${stat.trend}`}>
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="catalog-stat-description">
                    {stat.description}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controles de búsqueda y filtros */}
          <div className="catalog-controls">
            <div className="catalog-search-container">
              <div className="catalog-search-box">
                <SearchIcon />
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="catalog-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="catalog-filters">
              <div className="catalog-filter-group">
                <FilterIcon />
                <select 
                  className="catalog-filter-select"
                  value={selectedFilter}
                  onChange={(e) => setSelectedFilter(e.target.value)}
                >
                  <option value="all">Todos los productos</option>
                  <option value="active">Productos activos</option>
                  <option value="pending">Productos inactivos</option>
                </select>
              </div>
            </div>
          </div>

          {/* Lista de Productos */}
          <div className="catalog-products-section">
            <div className="catalog-section-header">
              <div className="catalog-section-title-wrapper">
                <h2 className="catalog-section-title">Productos</h2>
                <span className="catalog-section-count">({filteredProducts.length})</span>
              </div>
            </div>

            {filteredProducts.length > 0 ? (
              <div className="catalog-products-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    id={product._id}
                    name={product.name}
                    image={product.images?.main || '/src/img/placeholder.png'}
                    price={product.basePrice}
                    status={product.isActive ? 'active' : 'inactive'}
                    category={product.category?.name || 'Sin categoría'}
                    sales={product.metadata?.stats?.orders || 0}
                    createdAt={product.createdAt}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                  />
                ))}
              </div>
            ) : (
              <div className="catalog-empty-state">
                <div className="catalog-empty-icon">
                  <InventoryIcon />
                </div>
                <h3 className="catalog-empty-title">No hay productos</h3>
                <p className="catalog-empty-description">
                  {searchQuery || selectedFilter !== 'all' 
                    ? 'No se encontraron productos con los filtros aplicados'
                    : 'Aún no has creado ningún producto. ¡Crea tu primer producto!'}
                </p>
                <button 
                  className="catalog-primary-btn"
                  onClick={handleCreateProduct}
                >
                  <PlusIcon />
                  <span>Crear Primer Producto</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal de creación de producto */}
      {showCreateModal && (
        <CreateProductModal
          isOpen={showCreateModal}
          onClose={handleCloseModal}
          onCreateProduct={handleProductCreated}
        />
      )}
    </div>
  );
};

export default CatalogManagement;