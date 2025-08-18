// src/hooks/useProducts.js - HOOK MEJORADO PARA PRODUCTOS
import { useCallback, useEffect, useState } from 'react';
import productService from '../api/ProductService';
import Swal from 'sweetalert2';

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
    isActive: '',
    featured: '',
    sort: 'newest'
  });

  // ==================== UTILIDADES ====================

  // Manejar errores de manera consistente
  const handleError = useCallback((error, defaultMessage = 'Error en operación de productos') => {
    console.error('❌ [useProducts] Error:', error);
    
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
    
    // Mostrar toast de error
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: errorMessage,
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      background: '#ffffff',
      color: '#010326',
      iconColor: '#040DBF'
    });
    
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
      
      console.log('🔍 [useProducts] Obteniendo productos:', params);
      
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

  // Crear producto
  const createProduct = useCallback(async (productData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🆕 [useProducts] Creando producto:', productData);
      
      // Sanitizar datos antes de enviar
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
      await Swal.fire({
        title: '¡Producto creado!',
        text: 'El producto se ha creado exitosamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#1F64BF',
        timer: 3000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInDown animate__faster'
        }
      });
      
      // Refrescar lista
      await fetchProducts();
      
      console.log('✅ [useProducts] Producto creado exitosamente');
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
      
      console.log('✏️ [useProducts] Actualizando producto:', { id, productData });
      
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
      await Swal.fire({
        title: '¡Producto actualizado!',
        text: 'Los cambios se han guardado exitosamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#1F64BF',
        timer: 3000,
        timerProgressBar: true
      });
      
      // Refrescar lista
      await fetchProducts();
      
      console.log('✅ [useProducts] Producto actualizado exitosamente');
      return response.data;
    } catch (error) {
      handleError(error, 'Error al actualizar producto');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, handleError]);

  // Eliminar producto con confirmación
  const deleteProduct = useCallback(async (id, productName = 'este producto') => {
    try {
      console.log('🗑️ [useProducts] Solicitando eliminación de producto:', id);
      
      if (!id) {
        throw new Error('ID de producto requerido');
      }
      
      // Confirmación con SweetAlert2
      const result = await Swal.fire({
        title: '¿Eliminar producto?',
        html: `
          <p>¿Estás seguro de que quieres eliminar <strong>"${productName}"</strong>?</p>
          <p class="text-sm text-gray-600 mt-2">Esta acción no se puede deshacer.</p>
        `,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#040DBF',
        cancelButtonColor: '#032CA6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
        focusCancel: true
      });

      if (!result.isConfirmed) {
        return false;
      }
      
      setLoading(true);
      setError(null);
      
      const response = await productService.delete(id);
      
      if (!response.success) {
        throw new Error(response.message || 'Error al eliminar producto');
      }
      
      // Mostrar éxito
      await Swal.fire({
        title: '¡Producto eliminado!',
        text: response.message || 'El producto ha sido eliminado exitosamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#1F64BF',
        timer: 3000,
        timerProgressBar: true
      });
      
      // Refrescar lista
      await fetchProducts();
      
      console.log('✅ [useProducts] Producto eliminado exitosamente');
      return true;
    } catch (error) {
      handleError(error, 'Error al eliminar producto');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, handleError]);

  // Obtener producto por ID
  const getProductById = useCallback(async (id) => {
    try {
      setError(null);
      
      console.log('🔍 [useProducts] Obteniendo producto por ID:', id);
      
      if (!id) {
        throw new Error('ID de producto requerido');
      }

      const response = await productService.getById(id);
      
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

      const response = await productService.search(query.trim(), limit);
      
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

      const response = await productService.getRelated(id, limit);
      
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

  // Actualizar estadísticas de producto (silencioso)
  const updateProductStats = useCallback(async (id, action) => {
    try {
      if (!id || !action) return;
      
      await productService.updateStats(id, action);
      // Actualización silenciosa, no mostrar notificación
    } catch (error) {
      // Error silencioso para estadísticas
      console.warn('⚠️ [useProducts] Error actualizando estadísticas:', error);
    }
  }, []);

  // ==================== FUNCIONES KONVA ====================

  // Obtener configuración Konva
  const getKonvaConfig = useCallback(async (id, options = {}) => {
    try {
      setError(null);
      
      console.log('🎨 [useProducts] Obteniendo configuración Konva:', { id, options });
      
      if (!id) {
        throw new Error('ID de producto requerido');
      }

      const response = await productService.getKonvaConfig(id, options);
      
      if (!response.success || !response.data?.config) {
        throw new Error('No se pudo obtener la configuración del editor');
      }

      console.log('✅ [useProducts] Configuración Konva obtenida');
      return response.data.config;
    } catch (error) {
      handleError(error, 'Error al obtener configuración del editor');
      return null;
    }
  }, [handleError]);

  // Obtener configuración del editor para admin
  const getEditorConfig = useCallback(async (id) => {
    try {
      setError(null);
      
      if (!id) {
        throw new Error('ID de producto requerido');
      }

      const response = await productService.getEditorConfig(id);
      
      if (!response.success || !response.data) {
        throw new Error('No se pudo obtener la configuración del editor');
      }

      return response.data;
    } catch (error) {
      handleError(error, 'Error al obtener configuración del editor');
      return null;
    }
  }, [handleError]);

  // Vista previa de áreas
  const previewAreas = useCallback(async (areas, imageUrl) => {
    try {
      setError(null);
      
      if (!areas || !Array.isArray(areas) || areas.length === 0) {
        throw new Error('Áreas requeridas para vista previa');
      }

      const response = await productService.previewAreas(areas, imageUrl);
      
      if (!response.success || !response.data) {
        throw new Error('No se pudo generar la vista previa');
      }

      return response.data;
    } catch (error) {
      console.error('❌ [useProducts] Error en vista previa:', error);
      throw error;
    }
  }, []);

  // ==================== UTILIDADES DE KONVA ====================

  // Preparar producto para editor Konva
  const prepareForKonvaEditor = useCallback((product) => {
    try {
      return productService.prepareForKonvaEditor(product);
    } catch (error) {
      console.error('❌ [useProducts] Error preparando para Konva:', error);
      return null;
    }
  }, []);

  // Convertir datos de Konva a formato backend
  const prepareFromKonvaEditor = useCallback((konvaData) => {
    try {
      return productService.prepareFromKonvaEditor(konvaData);
    } catch (error) {
      console.error('❌ [useProducts] Error convirtiendo desde Konva:', error);
      return null;
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

  // ==================== FUNCIONES DE DESARROLLO ====================

  // Crear productos de ejemplo (desarrollo)
  const createSampleProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🧪 [useProducts] Creando productos de ejemplo...');
      
      const response = await productService.createSamples();
      
      if (!response.success) {
        throw new Error(response.message || 'Error al crear productos de ejemplo');
      }
      
      await Swal.fire({
        title: '¡Productos de ejemplo creados!',
        text: 'Se han creado productos de ejemplo exitosamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#1F64BF',
        timer: 3000,
        timerProgressBar: true
      });
      
      // Refrescar lista
      await fetchProducts();
      
      console.log('✅ [useProducts] Productos de ejemplo creados');
      return response.data;
    } catch (error) {
      handleError(error, 'Error al crear productos de ejemplo');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchProducts, handleError]);

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
    createProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    searchProducts,
    getRelatedProducts,
    updateProductStats,

    // Funciones Konva
    getKonvaConfig,
    getEditorConfig,
    previewAreas,
    prepareForKonvaEditor,
    prepareFromKonvaEditor,

    // Estadísticas y análisis
    getProductStats,

    // Gestión de filtros
    updateFilters,
    clearFilters,

    // Utilidades
    createSampleProducts,
    refetch: fetchProducts,
    
    // Estados calculados
    hasProducts: products.length > 0,
    isEmpty: !loading && products.length === 0,
    hasError: !!error,
    isFirstLoad: !loading && products.length === 0 && !error,
    
    // Funciones auxiliares
    formatProduct,
    
    // Configuración por defecto
    getDefaultConfig: productService.getDefaultProductConfig
  };
};

export default useProducts;