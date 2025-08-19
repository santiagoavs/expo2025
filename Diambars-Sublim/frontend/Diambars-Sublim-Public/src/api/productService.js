// src/api/ProductService.js - SERVICIO DE PRODUCTOS PARA USUARIOS PÚBLICOS
import apiClient from './apiClient';

class ProductService {
  // ==================== OBTENER PRODUCTOS ====================
  
  /**
   * Obtener todos los productos con filtros y paginación
   * @param {Object} params - Parámetros de filtrado
   * @returns {Promise} Lista de productos
   */
  async getAll(params = {}) {
    try {
      console.log('🔍 [ProductService] Obteniendo productos:', params);
      
      const queryParams = new URLSearchParams();
      
      // Paginación
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      
      // Filtros
      if (params.search) queryParams.append('search', params.search);
      if (params.category) queryParams.append('category', params.category);
      if (params.categories) queryParams.append('categories', params.categories);
      if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
      if (params.featured !== undefined) queryParams.append('featured', params.featured.toString());
      
      // Ordenamiento
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.order) queryParams.append('order', params.order);
      
      const queryString = queryParams.toString();
      const url = `/products${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get(url);
      
      if (response.success) {
        console.log('✅ [ProductService] Productos obtenidos:', response.data?.products?.length || 0);
      }
      
      return response;
    } catch (error) {
      console.error('❌ [ProductService] Error obteniendo productos:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener producto por ID con configuración para diseño
   * @param {string} id - ID del producto
   * @returns {Promise} Producto con configuración de diseño
   */
  async getById(id) {
    try {
      console.log('🔍 [ProductService] Obteniendo producto por ID:', id);
      
      const response = await apiClient.get(`/products/${id}`);
      
      if (response.success) {
        console.log('✅ [ProductService] Producto obtenido exitosamente');
      }
      
      return response;
    } catch (error) {
      console.error('❌ [ProductService] Error obteniendo producto:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Buscar productos por término
   * @param {string} query - Término de búsqueda
   * @param {number} limit - Límite de resultados
   * @returns {Promise} Resultados de búsqueda
   */
  async search(query, limit = 10) {
    try {
      console.log('🔍 [ProductService] Buscando productos:', { query, limit });
      
      if (!query || query.trim().length < 2) {
        return { success: true, data: { products: [] } };
      }

      const params = new URLSearchParams();
      params.append('search', query.trim());
      params.append('limit', limit.toString());
      params.append('isActive', 'true'); // Solo productos activos
      
      const response = await apiClient.get(`/products?${params.toString()}`);
      
      if (response.success) {
        console.log('✅ [ProductService] Búsqueda completada:', response.data?.products?.length || 0);
      }
      
      return response;
    } catch (error) {
      console.error('❌ [ProductService] Error en búsqueda:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener productos relacionados
   * @param {string} id - ID del producto base
   * @param {number} limit - Límite de productos relacionados
   * @returns {Promise} Productos relacionados
   */
  async getRelated(id, limit = 4) {
    try {
      console.log('🔍 [ProductService] Obteniendo productos relacionados:', { id, limit });
      
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      params.append('isActive', 'true');
      params.append('exclude', id);
      
      const response = await apiClient.get(`/products/related/${id}?${params.toString()}`);
      
      if (response.success) {
        console.log('✅ [ProductService] Productos relacionados obtenidos');
      }
      
      return response;
    } catch (error) {
      console.error('❌ [ProductService] Error obteniendo relacionados:', error);
      // No lanzar error para productos relacionados, devolver array vacío
      return { success: true, data: { products: [] } };
    }
  }

  // ==================== FORMATEO Y UTILIDADES ====================

  /**
   * Formatear producto para mostrar en la UI
   * @param {Object} product - Producto raw del backend
   * @returns {Object} Producto formateado
   */
  formatProduct(product) {
    if (!product || typeof product !== 'object') {
      return null;
    }
    
    try {
      const formatted = {
        id: product._id || product.id,
        name: product.name || 'Producto sin nombre',
        description: product.description || '',
        basePrice: product.basePrice || 0,
        formattedPrice: product.basePrice ? `$${product.basePrice.toFixed(2)}` : 'Precio no disponible',
        
        // Imágenes
        images: {
          main: product.images?.main || product.mainImage || null,
          gallery: product.images?.gallery || []
        },
        mainImage: product.images?.main || product.mainImage || null,
        
        // Categoría
        category: product.category ? {
          id: product.category._id || product.category.id,
          name: product.category.name || 'Sin categoría'
        } : null,
        categoryName: product.category?.name || 'Sin categoría',
        
        // Estados
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
        
        // Opciones del producto
        options: Array.isArray(product.options) ? product.options : [],
        
        // Áreas de personalización (crucial para el editor)
        customizationAreas: Array.isArray(product.customizationAreas) ? product.customizationAreas.map(area => ({
          id: area._id || area.id,
          _id: area._id || area.id, // Mantener ambos para compatibilidad
          name: area.name || `Área ${area.id}`,
          displayName: area.displayName || area.name || `Área ${area.id}`,
          position: area.position || { x: 0, y: 0, width: 200, height: 100 },
          accepts: area.accepts || { text: true, image: true },
          maxElements: area.maxElements || 10,
          konvaConfig: area.konvaConfig || {}
        })) : [],
        
        // Configuración del editor
        editorConfig: product.editorConfig || {
          stageWidth: 800,
          stageHeight: 600,
          backgroundFill: '#f8f9fa'
        },
        
        // Metadatos
        tags: Array.isArray(product.tags) ? product.tags : [],
        createdAt: product.createdAt ? new Date(product.createdAt) : new Date(),
        updatedAt: product.updatedAt ? new Date(product.updatedAt) : new Date(),
        
        // Estadísticas (si están disponibles)
        totalViews: product.totalViews || 0,
        totalOrders: product.totalOrders || 0,
        
        // Estados calculados
        hasCustomizationAreas: Array.isArray(product.customizationAreas) && product.customizationAreas.length > 0,
        canCustomize: Array.isArray(product.customizationAreas) && product.customizationAreas.length > 0,
        isAvailable: product.isActive !== false
      };
      
      return formatted;
    } catch (error) {
      console.error('❌ [ProductService] Error formateando producto:', error);
      return null;
    }
  }

  /**
   * Validar datos de producto
   * @param {Object} productData - Datos a validar
   * @returns {Object} Resultado de validación
   */
  validateProductData(productData) {
    const errors = [];
    
    if (!productData.name || productData.name.trim().length === 0) {
      errors.push('El nombre del producto es requerido');
    }
    
    if (productData.basePrice && (typeof productData.basePrice !== 'number' || productData.basePrice < 0)) {
      errors.push('El precio base debe ser un número válido mayor o igual a 0');
    }
    
    if (productData.customizationAreas && Array.isArray(productData.customizationAreas)) {
      productData.customizationAreas.forEach((area, index) => {
        if (!area.name) {
          errors.push(`Área ${index + 1}: nombre requerido`);
        }
        
        if (!area.position || typeof area.position !== 'object') {
          errors.push(`Área ${index + 1}: posición requerida`);
        } else {
          const pos = area.position;
          if (typeof pos.x !== 'number' || typeof pos.y !== 'number' || 
              typeof pos.width !== 'number' || typeof pos.height !== 'number') {
            errors.push(`Área ${index + 1}: posición inválida (x, y, width, height requeridos)`);
          }
        }
        
        if (!area.accepts || typeof area.accepts !== 'object') {
          errors.push(`Área ${index + 1}: configuración de aceptación requerida`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // ==================== PREPARACIÓN PARA KONVA ====================

  /**
   * Preparar producto para el editor Konva
   * @param {Object} product - Producto a preparar
   * @returns {Object} Configuración para Konva
   */
  prepareForKonvaEditor(product) {
    if (!product) return null;
    
    try {
      const formatted = this.formatProduct(product);
      if (!formatted) return null;

      return {
        id: formatted.id,
        name: formatted.name,
        mainImage: formatted.mainImage,
        images: formatted.images,
        
        customizationAreas: formatted.customizationAreas,
        editorConfig: formatted.editorConfig,
        options: formatted.options,
        
        // Configuración específica para Konva
        stageWidth: formatted.editorConfig.stageWidth || 800,
        stageHeight: formatted.editorConfig.stageHeight || 600,
        backgroundFill: formatted.editorConfig.backgroundFill || '#f8f9fa'
      };
    } catch (error) {
      console.error('❌ [ProductService] Error preparando para Konva:', error);
      return null;
    }
  }

  // ==================== CONFIGURACIÓN POR DEFECTO ====================

  /**
   * Obtener configuración por defecto para productos
   * @returns {Object} Configuración por defecto
   */
  getDefaultProductConfig() {
    return {
      basePrice: 0,
      isActive: true,
      isFeatured: false,
      images: {
        main: null,
        gallery: []
      },
      options: [],
      customizationAreas: [
        {
          id: 'area-1',
          name: 'Área Principal',
          displayName: 'Área Principal',
          position: { x: 50, y: 50, width: 300, height: 200 },
          accepts: { text: true, image: true },
          maxElements: 10,
          konvaConfig: {}
        }
      ],
      editorConfig: {
        stageWidth: 800,
        stageHeight: 600,
        backgroundFill: '#f8f9fa'
      },
      tags: []
    };
  }

  // ==================== MANEJO DE ERRORES ====================

  /**
   * Manejar errores de manera consistente
   * @param {Error} error - Error capturado
   * @returns {Error} Error procesado
   */
  handleError(error) {
    let message = 'Error en operación de productos';
    
    if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.message) {
      message = error.message;
    }
    
    // Crear error personalizado
    const processedError = new Error(message);
    processedError.status = error?.response?.status;
    processedError.code = error?.response?.data?.error;
    processedError.originalError = error;
    
    return processedError;
  }
}

// Exportar instancia única
export default new ProductService();