// src/pages/catalogue/categoryView.jsx - INTEGRADO CON SISTEMA DE DISEÑOS
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import SidebarFilters from '../../components/filters/sidebarFilters';
import ProductCard from '../../components/products/productCard';
import Footer from '../../components/UI/footer/footer';
import './categoryView.css';

export default function CategoryView() {
  const { categoria } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [activeFilters, setActiveFilters] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalProducts: 0,
    perPage: 12
  });

  // Cargar productos cuando cambien los filtros
  useEffect(() => {
    fetchProducts();
  }, [activeFilters, categoria]);

  const fetchProducts = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);

      console.log('Cargando productos...', { activeFilters, categoria, page });

      // Construir query params
      const queryParams = new URLSearchParams();
      
      // Paginación
      queryParams.append('page', page.toString());
      queryParams.append('limit', '12');
      
      // Filtro por categoría de la URL (si existe)
      if (categoria) {
        queryParams.append('category', categoria);
      }
      
      // Filtros de categorías seleccionadas
      if (activeFilters.categories && activeFilters.categories.length > 0) {
        const categoryIds = activeFilters.categories.map(cat => cat.id);
        queryParams.append('categories', categoryIds.join(','));
      }

      // Solo productos activos
      queryParams.append('isActive', 'true');
      
      // Ordenamiento por defecto
      queryParams.append('sort', 'newest');

      const url = `/api/products?${queryParams.toString()}`;
      console.log('Fetching desde:', url);

      const response = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta de productos:', data);

      if (data.success && data.data) {
        setProducts(data.data.products || []);
        setPagination(data.data.pagination || {});
        console.log('✅ Productos cargados:', data.data.products?.length || 0);
      } else {
        console.warn('⚠️ Respuesta inesperada:', data);
        setProducts([]);
        setError(data.message || 'No se pudieron cargar los productos');
      }
    } catch (err) {
      console.error('❌ Error cargando productos:', err);
      setError(`Error al cargar productos: ${err.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en filtros
  const handleFiltersChange = (newFilters) => {
    console.log('Filtros actualizados:', newFilters);
    setActiveFilters(newFilters);
    // resetear a página 1 cuando cambien los filtros
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Manejar personalización de producto
  const handleCustomizeProduct = (product) => {
    console.log('Personalizar producto:', product);
    
    if (!isAuthenticated) {
      // Redirigir al perfil con información del producto
      navigate('/profile', { 
        state: { 
          from: `/design-hub?product=${product._id || product.id}`,
          message: `Inicia sesión para personalizar "${product.name}"`,
          productId: product._id || product.id,
          productName: product.name
        } 
      });
      return;
    }

    // Redirigir al hub de diseños con el producto seleccionado
    navigate(`/design-hub?product=${product._id || product.id}`);
  };

  // Renderizar productos o estados especiales
  const renderProducts = () => {
    if (loading) {
      // Mostrar skeleton loading manteniendo el grid
      return Array.from({ length: 9 }).map((_, idx) => (
        <div key={`skeleton-${idx}`} className="product-card loading-skeleton">
          <div className="skeleton-image"></div>
          <div className="skeleton-text"></div>
          <div className="skeleton-button"></div>
        </div>
      ));
    }

    if (error) {
      return (
        <div className="product-grid-message">
          <h3>Error al cargar productos</h3>
          <p>{error}</p>
          <button onClick={() => fetchProducts()} className="retry-button">
            Reintentar
          </button>
        </div>
      );
    }

    if (products.length === 0) {
      return (
        <div className="product-grid-message">
          <h3>No se encontraron productos</h3>
          <p>
            {Object.keys(activeFilters).length > 0 
              ? 'Intenta ajustar los filtros para ver más productos.'
              : 'No hay productos disponibles en este momento.'
            }
          </p>
          {Object.keys(activeFilters).length > 0 && (
            <button 
              onClick={() => setActiveFilters({})}
              className="clear-filters-button"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      );
    }

    // Renderizar productos reales
    return products.map((product) => (
      <ProductCard
        key={product._id || product.id}
        name={product.name}
        image={product.images?.main || '/placeholder-product.jpg'}
        price={product.formattedPrice}
        category={product.category?.name}
        product={product} // Pasar el objeto completo
        onCustomize={() => handleCustomizeProduct(product)}
      />
    ));
  };

  return (
    <div className='category-page'>
      <div className="category-content-wrapper">
        <div className="category-container">
          <SidebarFilters 
            onFiltersChange={handleFiltersChange}
            activeFilters={activeFilters}
          />
          
          <div className="product-grid">
            {renderProducts()}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}