// src/api/categoryService.js - Servicio de categorías para React Native
import apiClient from './ApiClient';
import { showError } from '../utils/SweetAlert';

const BASE_URL = '/categories';

const CategoryService = {
  // ==================== CRUD BÁSICO ====================
  
  /**
   * Obtener todas las categorías
   */
  getAll: async (params = {}) => {
    try {
      console.log('📂 [CategoryService-Mobile] Obteniendo categorías:', params);
      
      const response = await apiClient.get(BASE_URL, { params });
      console.log('✅ [CategoryService-Mobile] Categorías obtenidas:', response);
      return response;
    } catch (error) {
      console.error('❌ [CategoryService-Mobile] Error obteniendo categorías:', error);
      throw error;
    }
  },

  /**
   * Obtener categoría por ID
   */
  getById: async (id) => {
    try {
      console.log('📂 [CategoryService-Mobile] Obteniendo categoría:', id);
      
      const response = await apiClient.get(`${BASE_URL}/${id}`);
      console.log('✅ [CategoryService-Mobile] Categoría obtenida:', response);
      return response;
    } catch (error) {
      console.error('❌ [CategoryService-Mobile] Error obteniendo categoría:', error);
      throw error;
    }
  },

  /**
   * Crear nueva categoría
   */
  create: async (categoryData) => {
    try {
      console.log('🆕 [CategoryService-Mobile] Creando categoría:', categoryData);
      console.log('🔍 [CategoryService-Mobile] Tipo de categoryData:', typeof categoryData);
      console.log('🔍 [CategoryService-Mobile] Es FormData:', categoryData instanceof FormData);

      // Si es FormData, no validar aquí (se validó en el hook)
      if (!(categoryData instanceof FormData)) {
        // Validaciones básicas solo para objetos JavaScript
        if (!categoryData.name || !categoryData.name.trim()) {
          throw new Error('El nombre de la categoría es obligatorio');
        }
      }

      // Enviar con headers explícitos como en productos
      const response = await apiClient.post(BASE_URL, categoryData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 segundos
      });
      console.log('✅ [CategoryService-Mobile] Categoría creada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [CategoryService-Mobile] Error creando categoría:', error);
      throw error;
    }
  },

  /**
   * Actualizar categoría
   */
  update: async (id, categoryData) => {
    try {
      console.log('✏️ [CategoryService-Mobile] Actualizando categoría:', id, categoryData);

      const response = await apiClient.put(`${BASE_URL}/${id}`, categoryData);
      console.log('✅ [CategoryService-Mobile] Categoría actualizada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [CategoryService-Mobile] Error actualizando categoría:', error);
      throw error;
    }
  },

  /**
   * Eliminar categoría
   */
  delete: async (id) => {
    try {
      console.log('🗑️ [CategoryService-Mobile] Eliminando categoría:', id);

      const response = await apiClient.delete(`${BASE_URL}/${id}`);
      console.log('✅ [CategoryService-Mobile] Categoría eliminada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [CategoryService-Mobile] Error eliminando categoría:', error);
      throw error;
    }
  },

  // ==================== FUNCIONALIDADES AVANZADAS ====================

  /**
   * Buscar categorías
   */
  search: async (query, filters = {}) => {
    try {
      console.log('🔍 [CategoryService-Mobile] Buscando categorías:', query, filters);
      
      const params = {
        search: query,
        ...filters
      };
      
      const response = await apiClient.get(`${BASE_URL}/search`, { params });
      console.log('✅ [CategoryService-Mobile] Búsqueda completada:', response);
      return response;
    } catch (error) {
      console.error('❌ [CategoryService-Mobile] Error en búsqueda:', error);
      throw error;
    }
  },

  /**
   * Obtener árbol de categorías
   */
  getTree: async () => {
    try {
      console.log('🌳 [CategoryService-Mobile] Obteniendo árbol de categorías');
      
      // Usar el endpoint principal que devuelve tanto categories como categoryTree
      const response = await apiClient.get(BASE_URL);
      console.log('✅ [CategoryService-Mobile] Árbol obtenido:', response);
      return response;
    } catch (error) {
      console.error('❌ [CategoryService-Mobile] Error obteniendo árbol:', error);
      throw error;
    }
  },

  /**
   * Obtener categorías jerárquicas
   */
  getHierarchical: async () => {
    try {
      console.log('📊 [CategoryService-Mobile] Obteniendo categorías jerárquicas');
      
      // Usar el endpoint principal que devuelve tanto categories como categoryTree
      const response = await apiClient.get(BASE_URL);
      console.log('✅ [CategoryService-Mobile] Jerarquía obtenida:', response);
      return response;
    } catch (error) {
      console.error('❌ [CategoryService-Mobile] Error obteniendo jerarquía:', error);
      throw error;
    }
  },

  /**
   * Cambiar estado de categoría
   */
  toggleStatus: async (id) => {
    try {
      console.log('🔄 [CategoryService-Mobile] Cambiando estado de categoría:', id);
      
      const response = await apiClient.patch(`${BASE_URL}/${id}/toggle-status`);
      console.log('✅ [CategoryService-Mobile] Estado cambiado:', response);
      return response;
    } catch (error) {
      console.error('❌ [CategoryService-Mobile] Error cambiando estado:', error);
      throw error;
    }
  },

  /**
   * Actualizar orden de categorías
   */
  updateOrder: async (categories) => {
    try {
      console.log('📋 [CategoryService-Mobile] Actualizando orden de categorías');
      
      const response = await apiClient.patch(`${BASE_URL}/reorder`, { categories });
      console.log('✅ [CategoryService-Mobile] Orden actualizado:', response);
      return response;
    } catch (error) {
      console.error('❌ [CategoryService-Mobile] Error actualizando orden:', error);
      throw error;
    }
  },

  /**
   * Obtener categorías activas
   */
  getActive: async () => {
    try {
      console.log('✅ [CategoryService-Mobile] Obteniendo categorías activas');
      
      const response = await apiClient.get(`${BASE_URL}/active`);
      console.log('✅ [CategoryService-Mobile] Categorías activas obtenidas:', response);
      return response;
    } catch (error) {
      console.error('❌ [CategoryService-Mobile] Error obteniendo categorías activas:', error);
      throw error;
    }
  },

  /**
   * Obtener categorías para homepage
   */
  getForHomepage: async () => {
    try {
      console.log('🏠 [CategoryService-Mobile] Obteniendo categorías para homepage');
      
      const response = await apiClient.get(`${BASE_URL}/homepage`);
      console.log('✅ [CategoryService-Mobile] Categorías para homepage obtenidas:', response);
      return response;
    } catch (error) {
      console.error('❌ [CategoryService-Mobile] Error obteniendo categorías para homepage:', error);
      throw error;
    }
  },

  // ==================== UTILIDADES ====================

  /**
   * Formatear categoría para móvil
   */
  formatCategory: (category) => {
    if (!category || typeof category !== 'object') {
      return null;
    }

    const safeName = category.name || 'Categoría sin nombre';
    const safeDescription = category.description || '';

    return {
      ...category,
      id: category._id || category.id,
      name: safeName,
      description: safeDescription,
      statusText: category.isActive ? 'Activa' : 'Inactiva',
      parentName: category.parent?.name || 'Sin categoría padre',
      hasChildren: category.children && category.children.length > 0,
      childrenCount: category.children?.length || 0,
      image: category.image || null,
      showOnHomepage: category.showOnHomepage || false,
      order: category.order || 0,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
      // Para vista de árbol
      depth: category.depth || 0,
      isExpanded: category.isExpanded || false,
      // Para vista jerárquica
      level: category.level || 0,
      path: category.path || safeName,
    };
  },

  /**
   * Validar datos de categoría
   */
  validateCategoryData: (categoryData) => {
    const errors = [];

    if (!categoryData.name || typeof categoryData.name !== 'string' || categoryData.name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
    if (categoryData.name && categoryData.name.trim().length > 100) {
      errors.push('El nombre no puede exceder 100 caracteres');
    }

    if (categoryData.description && categoryData.description.length > 500) {
      errors.push('La descripción no puede exceder 500 caracteres');
    }

    if (categoryData.parentId && typeof categoryData.parentId !== 'string') {
      errors.push('La categoría padre debe ser válida');
    }

    if (categoryData.order && (isNaN(categoryData.order) || categoryData.order < 0)) {
      errors.push('El orden debe ser un número mayor o igual a 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Sanitizar datos de categoría
   */
  sanitizeCategoryData: (categoryData) => {
    const sanitized = { ...categoryData };

    if (sanitized.name) sanitized.name = sanitized.name.trim();
    if (sanitized.description) sanitized.description = sanitized.description.trim();
    if (sanitized.order) sanitized.order = parseInt(sanitized.order);
    if (sanitized.parentId === '') sanitized.parentId = null;

    return sanitized;
  },

  /**
   * Construir árbol de categorías
   */
  buildCategoryTree: (categories) => {
    const categoryMap = new Map();
    const rootCategories = [];

    // Crear mapa de categorías
    categories.forEach(category => {
      categoryMap.set(category.id, {
        ...category,
        children: []
      });
    });

    // Construir árbol
    categories.forEach(category => {
      const categoryNode = categoryMap.get(category.id);
      
      if (category.parentId && categoryMap.has(category.parentId)) {
        const parent = categoryMap.get(category.parentId);
        parent.children.push(categoryNode);
      } else {
        rootCategories.push(categoryNode);
      }
    });

    return rootCategories;
  },

  /**
   * Aplanar árbol de categorías
   */
  flattenCategoryTree: (tree, depth = 0) => {
    const flattened = [];
    
    tree.forEach(category => {
      flattened.push({
        ...category,
        depth,
        isExpanded: false
      });
      
      if (category.children && category.children.length > 0) {
        const children = CategoryService.flattenCategoryTree(category.children, depth + 1);
        flattened.push(...children);
      }
    });

    return flattened;
  }
};

export default CategoryService;
