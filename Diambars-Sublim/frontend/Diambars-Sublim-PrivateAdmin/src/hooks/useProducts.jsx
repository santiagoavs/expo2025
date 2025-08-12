// src/hooks/useProducts.js
import { useCallback, useEffect, useState } from 'react';
import productService from '../api/ProductService';
import { toast } from 'react-hot-toast';

const handleError = (error, defaultMessage) => {
  const errorData = error.response?.data || {};
  const errorMessage = errorData.message || errorData.error || error.message || defaultMessage;

  console.error('Error:', { error, response: error.response, config: error.config });
  toast.error(errorMessage);
  throw new Error(errorMessage);
};

const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalProducts: 0,
    totalPages: 0,
    currentPage: 1,
    perPage: 12,
    hasNext: false,
    hasPrev: false
  });

  // Función para formatear productos con campos faltantes
  const formatProduct = (product) => {
    return productService.formatProduct(product);
  };

  // Obtener productos con filtros
  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      console.log("👉 Obteniendo productos con params:", params);
      const response = await productService.getAll(params);
      
      console.log("📦 Productos recibidos:", response);

      if (!response.success || !Array.isArray(response.data?.products)) {
        throw new Error("Formato de respuesta de productos inválido");
      }

      const formattedProducts = response.data.products.map(formatProduct);
      setProducts(formattedProducts);
      
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }

    } catch (err) {
      console.error("❌ Error al cargar productos:", err);
      setError(err.message || "Error al cargar productos");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear producto
  const createProduct = useCallback(async (productData) => {
    try {
      console.log("🆕 Creando producto:", productData);
      
      // Validar datos antes de enviar
      const validation = productService.validateProductData(productData);
      if (!validation.isValid) {
        throw new Error(`Errores de validación: ${validation.errors.join(', ')}`);
      }

      const response = await productService.create(productData);
      toast.success('Producto creado exitosamente');
      
      // Actualizar lista de productos
      await fetchProducts();
      return response;
    } catch (error) {
      handleError(error, 'Error al crear producto');
    }
  }, [fetchProducts]);

  // Actualizar producto
  const updateProduct = useCallback(async (id, productData) => {
    try {
      console.log("✏️ Actualizando producto:", id, productData);
      
      const response = await productService.update(id, productData);
      toast.success('Producto actualizado exitosamente');
      
      // Actualizar lista de productos
      await fetchProducts();
      return response;
    } catch (error) {
      handleError(error, 'Error al actualizar producto');
    }
  }, [fetchProducts]);

  // Eliminar producto
  const deleteProduct = useCallback(async (id) => {
    try {
      console.log("🗑️ Eliminando producto:", id);
      
      const response = await productService.delete(id);
      toast.success('Producto eliminado exitosamente');
      
      // Actualizar lista de productos
      await fetchProducts();
      return response;
    } catch (error) {
      handleError(error, 'Error al eliminar producto');
    }
  }, [fetchProducts]);

  // Obtener producto por ID
  const getProductById = useCallback(async (id) => {
    try {
      console.log("🔍 Obteniendo producto por ID:", id);
      
      const response = await productService.getById(id);
      if (response.success && response.data?.product) {
        return formatProduct(response.data.product);
      }
      throw new Error("Producto no encontrado");
    } catch (error) {
      handleError(error, 'Error al obtener producto');
    }
  }, []);

  // Buscar productos
  const searchProducts = useCallback(async (query, limit = 10) => {
    try {
      console.log("🔍 Buscando productos:", query);
      
      if (!query || query.trim().length < 2) {
        return [];
      }

      const response = await productService.search(query.trim(), limit);
      if (response.success && Array.isArray(response.data?.products)) {
        return response.data.products.map(formatProduct);
      }
      return [];
    } catch (error) {
      console.error("Error en búsqueda:", error);
      return [];
    }
  }, []);

  // Obtener productos relacionados
  const getRelatedProducts = useCallback(async (id, limit = 4) => {
    try {
      const response = await productService.getRelated(id, limit);
      if (response.success && Array.isArray(response.data?.products)) {
        return response.data.products.map(formatProduct);
      }
      return [];
    } catch (error) {
      console.error("Error obteniendo productos relacionados:", error);
      return [];
    }
  }, []);

  // Actualizar estadísticas de producto
  const updateProductStats = useCallback(async (id, action) => {
    try {
      await productService.updateStats(id, action);
      // No mostrar toast para estadísticas (es una acción silenciosa)
    } catch (error) {
      console.error("Error actualizando estadísticas:", error);
      // No mostrar error al usuario para estadísticas
    }
  }, []);

  // ==================== FUNCIONES KONVA ====================

  // Obtener configuración Konva para producto
  const getKonvaConfig = useCallback(async (id, options = {}) => {
    try {
      console.log("🎨 Obteniendo configuración Konva:", id);
      
      const response = await productService.getKonvaConfig(id, options);
      if (response.success && response.data?.config) {
        return response.data.config;
      }
      throw new Error("No se pudo obtener la configuración del editor");
    } catch (error) {
      handleError(error, 'Error al obtener configuración del editor');
    }
  }, []);

  // Obtener configuración del editor para admin
  const getEditorConfig = useCallback(async (id) => {
    try {
      const response = await productService.getEditorConfig(id);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error("No se pudo obtener la configuración del editor");
    } catch (error) {
      handleError(error, 'Error al obtener configuración del editor');
    }
  }, []);

  // Vista previa de áreas
  const previewAreas = useCallback(async (areas, imageUrl) => {
    try {
      const response = await productService.previewAreas(areas, imageUrl);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error("No se pudo generar la vista previa");
    } catch (error) {
      console.error("Error en vista previa:", error);
      throw error;
    }
  }, []);

  // ==================== UTILIDADES ====================

  // Preparar producto para editor Konva
  const prepareForKonvaEditor = useCallback((product) => {
    return productService.prepareForKonvaEditor(product);
  }, []);

  // Convertir datos de Konva a formato backend
  const prepareFromKonvaEditor = useCallback((konvaData) => {
    return productService.prepareFromKonvaEditor(konvaData);
  }, []);

  // Funciones de estadísticas
  const getProductStats = useCallback(() => {
    const total = products.length;
    const active = products.filter(p => p.isActive).length;
    const inactive = products.filter(p => !p.isActive).length;
    const featured = products.filter(p => p.metadata?.featured).length;
    
    const totalRevenue = products.reduce((sum, product) => 
      sum + (product.basePrice * (product.metadata?.stats?.orders || 0)), 0
    );
    
    const totalOrders = products.reduce((sum, product) => 
      sum + (product.metadata?.stats?.orders || 0), 0
    );

    const avgPrice = total > 0 ? products.reduce((sum, p) => sum + p.basePrice, 0) / total : 0;

    // Top 5 productos más vendidos
    const topProducts = [...products]
      .sort((a, b) => (b.metadata?.stats?.orders || 0) - (a.metadata?.stats?.orders || 0))
      .slice(0, 5);

    return { 
      total, 
      active, 
      inactive, 
      featured, 
      totalRevenue,
      totalOrders,
      avgPrice,
      topProducts
    };
  }, [products]);

  // Crear productos de ejemplo (desarrollo)
  const createSampleProducts = useCallback(async () => {
    try {
      const response = await productService.createSamples();
      toast.success('Productos de ejemplo creados');
      await fetchProducts();
      return response;
    } catch (error) {
      handleError(error, 'Error al crear productos de ejemplo');
    }
  }, [fetchProducts]);

  // ==================== EFECTOS ====================

  // Cargar productos inicialmente
  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    // Estado
    products,
    loading,
    error,
    pagination,

    // Funciones principales
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

    // Utilidades
    getProductStats,
    createSampleProducts,

    // Refrescar datos
    refetch: fetchProducts
  };
};

export default useProducts;