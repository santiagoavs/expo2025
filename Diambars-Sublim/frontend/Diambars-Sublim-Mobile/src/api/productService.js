// src/api/productService.js - Servicio de productos para React Native
import apiClient from './ApiClient';

const BASE_URL = '/products';

const ProductService = {
  // ==================== OBTENER PRODUCTOS ====================
  
  getAll: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 20,
        category,
        isActive,
        search,
        sort = 'newest',
        featured
      } = params;

      console.log('🔍 [ProductService-Mobile] Obteniendo productos con params:', params);

      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      
      if (category && category.trim() !== '') queryParams.append('category', category);
      if (isActive !== undefined && isActive !== '') queryParams.append('isActive', isActive);
      if (search && search.trim() !== '') queryParams.append('search', search.trim());
      if (sort) queryParams.append('sort', sort);
      if (featured !== undefined && featured !== '') queryParams.append('featured', featured);

      const url = `${BASE_URL}?${queryParams.toString()}`;
      console.log('📡 [ProductService-Mobile] URL final:', url);

      const response = await apiClient.get(url);
      
      console.log('✅ [ProductService-Mobile] Productos obtenidos:', response);
      return response;
    } catch (error) {
      console.error('❌ [ProductService-Mobile] Error obteniendo productos:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      console.log('🔍 [ProductService-Mobile] Obteniendo producto por ID:', id);
      
      if (!id) {
        throw new Error('ID de producto requerido');
      }

      const response = await apiClient.get(`${BASE_URL}/${id}`);
      console.log('✅ [ProductService-Mobile] Producto obtenido:', response);
      return response;
    } catch (error) {
      console.error('❌ [ProductService-Mobile] Error obteniendo producto:', error);
      throw error;
    }
  },

  search: async (query, limit = 10) => {
    try {
      console.log('🔍 [ProductService-Mobile] Buscando productos:', { query, limit });
      
      if (!query || query.trim().length < 2) {
        return { success: true, data: { products: [] } };
      }

      const queryParams = new URLSearchParams({
        q: query.trim(),
        limit: limit.toString()
      });

      const response = await apiClient.get(`${BASE_URL}/search?${queryParams}`);
      console.log('✅ [ProductService-Mobile] Resultados de búsqueda:', response);
      return response;
    } catch (error) {
      console.error('❌ [ProductService-Mobile] Error en búsqueda:', error);
      throw error;
    }
  },

  // ==================== CREAR PRODUCTO ====================
  
  create: async (productData) => {
    try {
      console.log('🆕 [ProductService-Mobile] Creando producto:', productData);

      // Validaciones básicas
      if (!productData.name || !productData.name.trim()) {
        throw new Error('El nombre del producto es obligatorio');
      }
      
      if (!productData.basePrice || isNaN(productData.basePrice) || parseFloat(productData.basePrice) <= 0) {
        throw new Error('El precio base debe ser un número mayor que 0');
      }

      const response = await apiClient.post(BASE_URL, productData);
      console.log('✅ [ProductService-Mobile] Producto creado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [ProductService-Mobile] Error creando producto:', error);
      throw error;
    }
  },

  // ==================== ACTUALIZAR PRODUCTO ====================
  
  update: async (id, productData) => {
    try {
      console.log('✏️ [ProductService-Mobile] Actualizando producto:', { id, productData });

      if (!id) {
        throw new Error('ID de producto requerido para actualización');
      }

      const response = await apiClient.put(`${BASE_URL}/${id}`, productData);
      console.log('✅ [ProductService-Mobile] Producto actualizado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [ProductService-Mobile] Error actualizando producto:', error);
      throw error;
    }
  },

  // ==================== ACTIVAR/DESACTIVAR PRODUCTO ====================
  
  toggleStatus: async (id, isActive) => {
    try {
      console.log('🔄 [ProductService-Mobile] Cambiando estado del producto:', { id, isActive });
      
      if (!id) {
        throw new Error('ID de producto requerido');
      }

      const response = await apiClient.patch(`${BASE_URL}/${id}/status`, { isActive });
      console.log('✅ [ProductService-Mobile] Estado actualizado:', response);
      return response;
    } catch (error) {
      console.error('❌ [ProductService-Mobile] Error cambiando estado:', error);
      throw error;
    }
  },

  // ==================== ESTADÍSTICAS ====================
  
  updateStats: async (id, action) => {
    try {
      const validActions = ['view', 'design', 'order'];
      if (!validActions.includes(action)) {
        throw new Error(`Acción inválida. Debe ser: ${validActions.join(', ')}`);
      }

      if (!id) {
        throw new Error('ID de producto requerido para actualizar estadísticas');
      }

      const response = await apiClient.patch(`${BASE_URL}/${id}/stats`, { action });
      return response;
    } catch (error) {
      // Error silencioso para estadísticas
      throw error;
    }
  },

  // ==================== UTILIDADES ====================
  
  formatProduct: (product) => {
    if (!product || typeof product !== 'object') {
      return null;
    }

    const safeName = product.name || 'Producto sin nombre';
    const safePrice = typeof product.basePrice === 'number' ? product.basePrice : 0;

    return {
      ...product,
      id: product._id || product.id,
      name: safeName,
      basePrice: safePrice,
      formattedPrice: new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD'
      }).format(safePrice),
      statusText: product.isActive ? 'Activo' : 'Inactivo',
      categoryName: product.category?.name || 'Sin categoría',
      mainImage: product.images?.main || null,
      additionalImages: product.images?.additional || [],
      totalOrders: product.metadata?.stats?.orders || 0,
      totalViews: product.metadata?.stats?.views || 0,
      totalDesigns: product.metadata?.stats?.designs || 0,
      isFeatured: product.metadata?.featured || false,
      searchTags: product.metadata?.searchTags || [],
      createdDate: product.createdAt ? new Date(product.createdAt).toLocaleDateString() : null,
      updatedDate: product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : null,
      daysAgo: product.createdAt ? ProductService.calculateDaysAgo(product.createdAt) : 0
    };
  },

  calculateDaysAgo: (date) => {
    if (!date) return 0;
    try {
      const now = new Date();
      const createdDate = new Date(date);
      const diffTime = Math.abs(now - createdDate);
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      console.error('Error calculando días:', error);
      return 0;
    }
  },

  // ==================== VALIDACIONES ====================

  validateProductData: (productData) => {
    const errors = [];

    // Validación básica
    if (!productData.name || typeof productData.name !== 'string' || productData.name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
    if (productData.name && productData.name.trim().length > 100) {
      errors.push('El nombre no puede exceder 100 caracteres');
    }

    if (!productData.basePrice || isNaN(productData.basePrice) || parseFloat(productData.basePrice) <= 0) {
      errors.push('El precio debe ser un número mayor que 0');
    }
    if (productData.basePrice && parseFloat(productData.basePrice) > 10000) {
      errors.push('El precio no puede exceder $10,000');
    }

    if (!productData.categoryId || typeof productData.categoryId !== 'string') {
      errors.push('Debe seleccionar una categoría válida');
    }

    if (productData.productionTime && 
        (isNaN(productData.productionTime) || 
         parseInt(productData.productionTime) < 1 || 
         parseInt(productData.productionTime) > 30)) {
      errors.push('El tiempo de producción debe estar entre 1 y 30 días');
    }

    if (productData.description && productData.description.length > 1000) {
      errors.push('La descripción no puede exceder 1000 caracteres');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Limpiar datos del producto antes de enviar
  sanitizeProductData: (productData) => {
    const sanitized = { ...productData };

    // Limpiar strings
    if (sanitized.name) sanitized.name = sanitized.name.trim();
    if (sanitized.description) sanitized.description = sanitized.description.trim();

    // Convertir números
    if (sanitized.basePrice) sanitized.basePrice = parseFloat(sanitized.basePrice);
    if (sanitized.productionTime) sanitized.productionTime = parseInt(sanitized.productionTime);

    // Limpiar tags
    if (sanitized.searchTags && Array.isArray(sanitized.searchTags)) {
      sanitized.searchTags = sanitized.searchTags
        .filter(tag => tag && tag.trim().length > 0)
        .map(tag => tag.trim().toLowerCase())
        .slice(0, 10);
    }

    return sanitized;
  }
};

export default ProductService;
