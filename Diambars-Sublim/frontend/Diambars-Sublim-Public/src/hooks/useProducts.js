// src/hooks/useProducts.js - HOOK PARA PRODUCTOS PÚBLICOS
import { useCallback, useEffect, useState } from 'react';
import ProductService from '../api/productService';

const useProducts = () => {
  // ==================== ESTADOS ====================
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalProducts: 0,
    totalPages: 0,
    currentPage: 1,
    perPage: 12,
    hasNext: false,
    hasPrev: false,
    nextPage: null,
    prevPage: null
  });

  // Estados adicionales para filtros y búsqueda
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    isActive: 'true', // Por defecto solo productos activos
    featured: '',
    sort: 'newest'
  });

  // ==================== UTILIDADES ====================

  // Manejar errores de manera consistente
  const handleError = useCallback((error, defaultMessage = 'Error en operación de productos') => {
    console.error('❌ [useProducts] Error:', error);
    
    let errorMessage = defaultMessage;
    
    if (error?.message) {
      errorMessage = error.message;
    }
    
    // Mostrar error específico según el tipo
    if (error?.status === 404) {
      errorMessage = 'Producto no encontrado';
    } else if (error?.status === 400) {
      errorMessage = error.message || 'Datos inválidos';
    }
    
    setError(errorMessage);
    return errorMessage;
  }, []);

  // Formatear producto usando el servicio
  const formatProduct = useCallback((product) => {
    return ProductService.formatProduct(product);
  }, []);

  // ==================== FUNCIONES PRINCIPALES ====================

  // Obtener productos con filtros y paginación
  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useProducts] Obteniendo productos:', params);
      
      // Combinar parámetros con filtros actuales
      const queryParams = {
        ...filters,
        ...params
      };
      
      const response = await ProductService.getAll(queryParams);
      
      if (!response.success || !Array.isArray(response.data?.products)) {
        throw new Error("Formato de respuesta inválido");
      }

      // Formatear productos
      const formattedProducts = response.data.products
        .map(formatProduct)
        .filter(product => product !== null);
      
      setProducts(formattedProducts);
      
      // Actualizar paginación
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
      
      console.log('✅ [useProducts] Productos cargados:', {
        count: formattedProducts.length,
        pagination: response.data.pagination
      });
      
      return formattedProducts;
    } catch (error) {
      handleError(error, 'Error al cargar productos');
      setProducts([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters, formatProduct, handleError]);

  // Obtener producto por ID
  const getProductById = useCallback(async (id) => {
    try {
      setError(null);
      
      console.log('🔍 [useProducts] Obteniendo producto por ID:', id);
      
      if (!id) {
        throw new Error('ID de producto requerido');
      }

      const response = await ProductService.getById(id);
      
      if (!response.success || !response.data?.product) {
        throw new Error('Producto no encontrado');
      }

      const formattedProduct = formatProduct(response.data.product);
      console.log('✅ [useProducts] Producto obtenido:', formattedProduct);
      
      return formattedProduct;
    } catch (error) {
      handleError(error, 'Error al obtener producto');
      return null;
    }
  }, [formatProduct, handleError]);

  // Buscar productos
  const searchProducts = useCallback(async (query, limit = 10) => {
    try {
      setError(null);
      
      console.log('🔍 [useProducts] Buscando productos:', { query, limit });
      
      if (!query || query.trim().length < 2) {
        return [];
      }

      const response = await ProductService.search(query.trim(), limit);
      
      if (!response.success || !Array.isArray(response.data?.products)) {
        return [];
      }

      const formattedProducts = response.data.products
        .map(formatProduct)
        .filter(product => product !== null);
      
      console.log('✅ [useProducts] Resultados de búsqueda:', formattedProducts.length);
      return formattedProducts;
    } catch (error) {
      console.error('❌ [useProducts] Error en búsqueda:', error);
      return [];
    }
  }, [formatProduct]);

  // Obtener productos relacionados
  const getRelatedProducts = useCallback(async (id, limit = 4) => {
    try {
      setError(null);
      
      if (!id) {
        return [];
      }

      const response = await ProductService.getRelated(id, limit);
      
      if (!response.success || !Array.isArray(response.data?.products)) {
        return [];
      }

      return response.data.products
        .map(formatProduct)
        .filter(product => product !== null);
    } catch (error) {
      console.error('❌ [useProducts] Error obteniendo productos relacionados:', error);
      return [];
    }
  }, [formatProduct]);

  // ==================== UTILIDADES DE KONVA ====================

  // Preparar producto para editor Konva
  const prepareForKonvaEditor = useCallback((product) => {
    try {
      return ProductService.prepareForKonvaEditor(product);
    } catch (error) {
      console.error('❌ [useProducts] Error preparando para Konva:', error);
      return null;
    }
  }, []);

  // ==================== ESTADÍSTICAS Y ANÁLISIS ====================

  // Obtener estadísticas de productos
  const getProductStats = useCallback(() => {
    const total = products.length;
    const active = products.filter(p => p.isActive).length;
    const featured = products.filter(p => p.isFeatured).length;
    const withCustomization = products.filter(p => p.hasCustomizationAreas).length;
    
    const avgPrice = total > 0 ? products.reduce((sum, p) => sum + p.basePrice, 0) / total : 0;

    // Productos más recientes
    const recentProducts = [...products]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Categorías más populares
    const categoryCounts = products.reduce((acc, product) => {
      const category = product.categoryName || 'Sin categoría';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const topCategories = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Rango de precios
    const prices = products.map(p => p.basePrice).filter(p => p > 0);
    const priceRange = prices.length > 0 ? {
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: prices.reduce((sum, price) => sum + price, 0) / prices.length
    } : { min: 0, max: 0, avg: 0 };

    return { 
      total, 
      active, 
      featured,
      withCustomization,
      avgPrice,
      recentProducts,
      topCategories,
      priceRange
    };
  }, [products]);

  // ==================== GESTIÓN DE FILTROS ====================

  // Actualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      category: '',
      isActive: 'true',
      featured: '',
      sort: 'newest'
    });
  }, []);

  // ==================== FILTROS RÁPIDOS ====================

  // Obtener solo productos activos
  const getActiveProducts = useCallback(async (limit = 12) => {
    return fetchProducts({ isActive: 'true', limit });
  }, [fetchProducts]);

  // Obtener productos destacados
  const getFeaturedProducts = useCallback(async (limit = 8) => {
    return fetchProducts({ featured: 'true', isActive: 'true', limit });
  }, [fetchProducts]);

  // Obtener productos por categoría
  const getProductsByCategory = useCallback(async (categoryId, limit = 12) => {
    return fetchProducts({ category: categoryId, isActive: 'true', limit });
  }, [fetchProducts]);

  // ==================== EFECTOS ====================

  // Cargar productos cuando cambien los filtros (solo si no están vacíos)
  useEffect(() => {
    // Solo cargar automáticamente si hay filtros específicos
    const hasSpecificFilters = filters.search || filters.category || filters.featured;
    
    if (hasSpecificFilters) {
      fetchProducts();
    }
  }, [filters, fetchProducts]);

  // Limpiar error después de un tiempo
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ==================== RETORNO ====================

  return {
    // Estados principales
    products,
    loading,
    error,
    pagination,
    filters,

    // Funciones principales
    fetchProducts,
    getProductById,
    searchProducts,
    getRelatedProducts,

    // Filtros rápidos
    getActiveProducts,
    getFeaturedProducts,
    getProductsByCategory,

    // Utilidades Konva
    prepareForKonvaEditor,

    // Estadísticas y análisis
    getProductStats,

    // Gestión de filtros
    updateFilters,
    clearFilters,

    // Utilidades
    refetch: fetchProducts,
    
    // Estados calculados
    hasProducts: products.length > 0,
    isEmpty: !loading && products.length === 0,
    hasError: !!error,
    isFirstLoad: !loading && products.length === 0 && !error,
    
    // Funciones auxiliares
    formatProduct,
    
    // Configuración por defecto
    getDefaultConfig: ProductService.getDefaultProductConfig,
    
    // Validación
    validateProductData: ProductService.validateProductData,

    // Filtros útiles
    activeProducts: products.filter(p => p.isActive),
    featuredProducts: products.filter(p => p.isFeatured),
    customizableProducts: products.filter(p => p.canCustomize)
  };
};

export default useProducts;