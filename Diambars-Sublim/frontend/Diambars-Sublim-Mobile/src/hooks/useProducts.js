// src/hooks/useProducts.js - Hook personalizado para productos en React Native
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import productService from '../api/productService';

const useProducts = () => {
  // ==================== ESTADOS ====================
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalProducts: 0,
    totalPages: 0,
    currentPage: 1,
    perPage: 20,
    hasNext: false,
    hasPrev: false,
    nextPage: null,
    prevPage: null
  });

  // Estados adicionales para filtros y búsqueda
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    isActive: '',
    featured: '',
    sort: 'newest'
  });

  // ==================== UTILIDADES ====================

  // Manejar errores de manera consistente
  const handleError = useCallback((error, defaultMessage = 'Error en operación de productos') => {
    console.error('❌ [useProducts-Mobile] Error:', error);
    
    let errorMessage = defaultMessage;
    
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    // Mostrar error específico según el tipo
    if (error?.response?.status === 404) {
      errorMessage = 'Producto no encontrado';
    } else if (error?.response?.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
    } else if (error?.response?.status === 400) {
      errorMessage = error?.response?.data?.message || 'Datos inválidos';
    }
    
    setError(errorMessage);
    
    // Mostrar alerta de error
    Alert.alert(
      'Error',
      errorMessage,
      [{ text: 'OK', style: 'default' }]
    );
    
    return errorMessage;
  }, []);

  // Formatear producto usando el servicio
  const formatProduct = useCallback((product) => {
    return productService.formatProduct(product);
  }, []);

  // ==================== FUNCIONES PRINCIPALES ====================

  // Obtener productos con filtros y paginación
  const fetchProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useProducts-Mobile] Obteniendo productos:', params);
      
      // Combinar parámetros con filtros actuales
      const queryParams = {
        ...filters,
        ...params
      };
      
      const response = await productService.getAll(queryParams);
      
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
      
      console.log('✅ [useProducts-Mobile] Productos cargados:', {
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

  // Obtener todos los productos (incluyendo inactivos)
  const fetchAllProducts = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 [useProducts-Mobile] Obteniendo todos los productos (incluyendo inactivos):', params);
      
      // Combinar parámetros con filtros actuales
      const queryParams = {
        ...filters,
        ...params,
        includeInactive: true // Parámetro especial para incluir inactivos
      };
      
      const response = await productService.getAll(queryParams);
      
      if (!response.success || !Array.isArray(response.data?.products)) {
        throw new Error("Formato de respuesta inválido");
      }

      // Formatear productos sin filtrar por estado
      const formattedProducts = response.data.products
        .map(formatProduct)
        .filter(product => product !== null);
      
      console.log('✅ [useProducts-Mobile] Todos los productos cargados:', {
        count: formattedProducts.length,
        active: formattedProducts.filter(p => p.isActive).length,
        inactive: formattedProducts.filter(p => !p.isActive).length
      });
      
      return formattedProducts;
    } catch (error) {
      handleError(error, 'Error al cargar todos los productos');
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters, formatProduct, handleError]);

  // Crear producto
  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🆕 [useProducts-Mobile] Creando producto:', productData);
      
      // Sanitizar datos
      const sanitizedData = productService.sanitizeProductData(productData);
      
      // Validar datos
      const validation = productService.validateProductData(sanitizedData);
      if (!validation.isValid) {
        throw new Error(`Errores de validación:\n• ${validation.errors.join('\n• ')}`);
      }

      const response = await productService.create(sanitizedData);
      
      if (!response.success) {
        throw new Error(response.message || 'Error al crear producto');
      }
      
      // Mostrar éxito
      Alert.alert(
        '¡Producto creado!',
        'El producto se ha creado exitosamente',
        [{ text: 'Continuar', style: 'default' }]
      );
      
      // Refrescar lista
      await fetchProducts();
      
      console.log('✅ [useProducts-Mobile] Producto creado exitosamente');
      return response.data;
    } catch (error) {
      handleError(error, 'Error al crear producto');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, handleError]);

  // Actualizar producto
  const updateProduct = useCallback(async (id, productData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('✏️ [useProducts-Mobile] Actualizando producto:', { id, productData });
      
      if (!id) {
        throw new Error('ID de producto requerido');
      }
      
      // Sanitizar datos
      const sanitizedData = productService.sanitizeProductData(productData);
      
      const response = await productService.update(id, sanitizedData);
      
      if (!response.success) {
        throw new Error(response.message || 'Error al actualizar producto');
      }
      
      // Mostrar éxito
      Alert.alert(
        '¡Producto actualizado!',
        'Los cambios se han guardado exitosamente',
        [{ text: 'Continuar', style: 'default' }]
      );
      
      // Refrescar lista
      await fetchProducts();
      
      console.log('✅ [useProducts-Mobile] Producto actualizado exitosamente');
      return response.data;
    } catch (error) {
      handleError(error, 'Error al actualizar producto');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, handleError]);

  // Activar/Desactivar producto
  const toggleProductStatus = useCallback(async (id, isActive) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useProducts-Mobile] Cambiando estado del producto:', { id, isActive });
      
      if (!id) {
        throw new Error('ID de producto requerido');
      }
      
      const response = await productService.toggleStatus(id, isActive);
      
      if (!response.success) {
        throw new Error(response.message || 'Error al cambiar estado del producto');
      }
      
      // Mostrar éxito
      Alert.alert(
        '¡Estado actualizado!',
        `El producto ha sido ${isActive ? 'activado' : 'desactivado'} exitosamente`,
        [{ text: 'Continuar', style: 'default' }]
      );
      
      // Refrescar lista
      await fetchProducts();
      
      console.log('✅ [useProducts-Mobile] Estado del producto actualizado');
      return response.data;
    } catch (error) {
      handleError(error, 'Error al cambiar estado del producto');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, handleError]);

  // Obtener producto por ID
  const getProductById = useCallback(async (id) => {
    try {
      setError(null);
      
      console.log('🔍 [useProducts-Mobile] Obteniendo producto por ID:', id);
      
      if (!id) {
        throw new Error('ID de producto requerido');
      }

      const response = await productService.getById(id);
      
      if (!response.success || !response.data?.product) {
        throw new Error('Producto no encontrado');
      }

      const formattedProduct = formatProduct(response.data.product);
      console.log('✅ [useProducts-Mobile] Producto obtenido:', formattedProduct);
      
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
      
      console.log('🔍 [useProducts-Mobile] Buscando productos:', { query, limit });
      
      if (!query || query.trim().length < 2) {
        return [];
      }

      const response = await productService.search(query.trim(), limit);
      
      if (!response.success || !Array.isArray(response.data?.products)) {
        return [];
      }

      const formattedProducts = response.data.products
        .map(formatProduct)
        .filter(product => product !== null);
      
      console.log('✅ [useProducts-Mobile] Resultados de búsqueda:', formattedProducts.length);
      return formattedProducts;
    } catch (error) {
      console.error('❌ [useProducts-Mobile] Error en búsqueda:', error);
      return [];
    }
  }, [formatProduct]);

  // Actualizar estadísticas de producto (silencioso)
  const updateProductStats = useCallback(async (id, action) => {
    try {
      if (!id || !action) return;
      
      await productService.updateStats(id, action);
      // Actualización silenciosa, no mostrar notificación
    } catch (error) {
      // Error silencioso para estadísticas
      console.warn('⚠️ [useProducts-Mobile] Error actualizando estadísticas:', error);
    }
  }, []);

  // ==================== ESTADÍSTICAS Y ANÁLISIS ====================

  // Obtener estadísticas de productos
  const getProductStats = useCallback(() => {
    const total = products.length;
    const active = products.filter(p => p.isActive).length;
    const inactive = products.filter(p => !p.isActive).length;
    const featured = products.filter(p => p.isFeatured).length;
    
    const totalRevenue = products.reduce((sum, product) => 
      sum + (product.basePrice * product.totalOrders), 0
    );
    
    const totalOrders = products.reduce((sum, product) => 
      sum + product.totalOrders, 0
    );

    const totalViews = products.reduce((sum, product) => 
      sum + product.totalViews, 0
    );

    const avgPrice = total > 0 ? products.reduce((sum, p) => sum + p.basePrice, 0) / total : 0;

    // Top 5 productos más vendidos
    const topProducts = [...products]
      .sort((a, b) => b.totalOrders - a.totalOrders)
      .slice(0, 5);

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

    return { 
      total, 
      active, 
      inactive, 
      featured, 
      totalRevenue,
      totalOrders,
      totalViews,
      avgPrice,
      topProducts,
      recentProducts,
      topCategories,
      conversionRate: totalViews > 0 ? ((totalOrders / totalViews) * 100) : 0
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
      isActive: '',
      featured: '',
      sort: 'newest'
    });
  }, []);

  // ==================== EFECTOS ====================

  // Cargar productos cuando cambien los filtros
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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

    // Funciones principales CRUD
    fetchProducts,
    fetchAllProducts,
    createProduct,
    updateProduct,
    toggleProductStatus,
    getProductById,
    searchProducts,
    updateProductStats,

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
    formatProduct
  };
};

export default useProducts;
