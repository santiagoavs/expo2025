// src/hooks/useCategories.js - HOOK PARA CATEGORÍAS EN MÓVIL
import { useCallback, useEffect, useState } from 'react';
import categoryService from '../api/categoryService';
import { 
  showError, 
  showSuccess, 
  showDeleteConfirm, 
  showStatusChange,
  showValidationError 
} from '../utils/SweetAlert';

const useCategories = () => {
  // ==================== ESTADOS ====================
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [hierarchicalCategories, setHierarchicalCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'all', // all, active, inactive
    parent: 'all', // all, root, specific
    homepage: 'all' // all, yes, no
  });
  const [sortBy, setSortBy] = useState('name'); // name, order, created
  const [sortOrder, setSortOrder] = useState('asc'); // asc, desc
  const [viewMode, setViewMode] = useState('grid'); // grid, tree, list

  // ==================== FUNCIONES AUXILIARES ====================
  const handleError = useCallback((error, context = 'Error') => {
    console.error(`❌ [useCategories-Mobile] ${context}:`, error);
    setError(error.message || 'Error inesperado');
    showError(context, error.message || 'Ha ocurrido un error inesperado');
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // ==================== FETCH DE DATOS ====================
  const fetchCategories = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);

      console.log('📂 [useCategories-Mobile] Obteniendo categorías:', params);

      const response = await categoryService.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        status: filters.status,
        parent: filters.parent,
        homepage: filters.homepage,
        sortBy,
        sortOrder,
        ...params
      });

      // El servicio devuelve un objeto con categories y categoryTree
      if (response && response.categories) {
        setCategories(response.categories);
        if (response.categoryTree) {
          setCategoryTree(response.categoryTree);
        }
        console.log('✅ [useCategories-Mobile] Categorías obtenidas:', response.categories.length);
      } else {
        throw new Error('Error al obtener categorías');
      }
    } catch (error) {
      handleError(error, 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, sortBy, sortOrder, handleError]);

  const fetchCategoryTree = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🌳 [useCategories-Mobile] Obteniendo árbol de categorías');

      const response = await categoryService.getTree();

      // El servicio devuelve un objeto con categoryTree
      if (response && response.categoryTree) {
        setCategoryTree(response.categoryTree);
        console.log('✅ [useCategories-Mobile] Árbol obtenido:', response.categoryTree.length);
      } else if (Array.isArray(response)) {
        setCategoryTree(response);
        console.log('✅ [useCategories-Mobile] Árbol obtenido:', response.length);
      } else {
        throw new Error('Error al obtener árbol');
      }
    } catch (error) {
      handleError(error, 'Error al cargar árbol de categorías');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  const fetchHierarchicalCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 [useCategories-Mobile] Obteniendo categorías jerárquicas');

      const response = await categoryService.getHierarchical();

      // El servicio devuelve un objeto con categories y categoryTree
      if (response && response.categories) {
        // Para la vista jerárquica, usar las categorías con su estructura plana
        setHierarchicalCategories(response.categories);
        console.log('✅ [useCategories-Mobile] Jerarquía obtenida:', response.categories.length);
      } else if (Array.isArray(response)) {
        setHierarchicalCategories(response);
        console.log('✅ [useCategories-Mobile] Jerarquía obtenida:', response.length);
      } else {
        throw new Error('Error al obtener jerarquía');
      }
    } catch (error) {
      handleError(error, 'Error al cargar categorías jerárquicas');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // ==================== CRUD OPERATIONS ====================
  const createCategory = useCallback(async (categoryData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🆕 [useCategories-Mobile] Creando categoría:', categoryData);

      // Sanitizar datos
      const sanitizedData = categoryService.sanitizeCategoryData(categoryData);
      console.log('🔍 [useCategories-Mobile] Datos sanitizados:', sanitizedData);
      console.log('🔍 [useCategories-Mobile] image sanitizada:', sanitizedData.image);

      // Validar datos
      const validation = categoryService.validateCategoryData(sanitizedData);
      if (!validation.isValid) {
        showValidationError(validation.errors);
        throw new Error(`Errores de validación:\n• ${validation.errors.join('\n• ')}`);
      }

      // Crear FormData para envío con archivos
      const formDataToSend = new FormData();
      
      // Agregar campos de texto
      Object.keys(sanitizedData).forEach(key => {
        if (key !== 'image') {
          if (Array.isArray(sanitizedData[key])) {
            formDataToSend.append(key, JSON.stringify(sanitizedData[key]));
          } else if (typeof sanitizedData[key] === 'object') {
            formDataToSend.append(key, JSON.stringify(sanitizedData[key]));
          } else {
            formDataToSend.append(key, sanitizedData[key]);
          }
        }
      });
      
      // Agregar imagen si existe
      if (sanitizedData.image && sanitizedData.image.uri) {
        console.log('📤 [useCategories-Mobile] Agregando imagen:', sanitizedData.image);
        
        // Crear objeto de archivo para React Native
        const imageFile = {
          uri: sanitizedData.image.uri,
          type: sanitizedData.image.mimeType || 'image/jpeg',
          name: sanitizedData.image.fileName || 'category-image.jpg'
        };
        
        formDataToSend.append('image', imageFile);
        console.log('📤 [useCategories-Mobile] Imagen agregada al FormData:', imageFile);
      } else {
        console.log('❌ [useCategories-Mobile] No hay imagen para agregar');
        console.log('❌ [useCategories-Mobile] image:', sanitizedData.image);
      }

      console.log('📤 [useCategories-Mobile] FormData preparado para envío');
      const response = await categoryService.create(formDataToSend);

      // El servicio devuelve los datos formateados
      if (response) {
        // Mostrar éxito
        showSuccess(
          '¡Categoría creada!',
          'La categoría se ha creado exitosamente',
          () => {
            // Refrescar lista según el modo de vista
            if (viewMode === 'tree') {
              fetchCategoryTree();
            } else if (viewMode === 'list') {
              fetchHierarchicalCategories();
            } else {
              fetchCategories();
            }
          }
        );

        console.log('✅ [useCategories-Mobile] Categoría creada exitosamente');
        return response;
      } else {
        throw new Error('Error al crear categoría');
      }
    } catch (error) {
      handleError(error, 'Error al crear categoría');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [viewMode, fetchCategories, fetchCategoryTree, fetchHierarchicalCategories, handleError]);

  const updateCategory = useCallback(async (id, categoryData) => {
    try {
      setLoading(true);
      setError(null);

      console.log('✏️ [useCategories-Mobile] Actualizando categoría:', id, categoryData);

      // Sanitizar datos
      const sanitizedData = categoryService.sanitizeCategoryData(categoryData);

      // Validar datos
      const validation = categoryService.validateCategoryData(sanitizedData);
      if (!validation.isValid) {
        showValidationError(validation.errors);
        throw new Error(`Errores de validación:\n• ${validation.errors.join('\n• ')}`);
      }

      const response = await categoryService.update(id, sanitizedData);

      // El servicio devuelve los datos formateados
      if (response) {
        // Mostrar éxito
        showSuccess(
          '¡Categoría actualizada!',
          'La categoría se ha actualizado exitosamente',
          () => {
            // Refrescar lista según el modo de vista
            if (viewMode === 'tree') {
              fetchCategoryTree();
            } else if (viewMode === 'list') {
              fetchHierarchicalCategories();
            } else {
              fetchCategories();
            }
          }
        );

        console.log('✅ [useCategories-Mobile] Categoría actualizada exitosamente');
        return response;
      } else {
        throw new Error('Error al actualizar categoría');
      }
    } catch (error) {
      handleError(error, 'Error al actualizar categoría');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [viewMode, fetchCategories, fetchCategoryTree, fetchHierarchicalCategories, handleError]);

  const deleteCategory = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🗑️ [useCategories-Mobile] Eliminando categoría:', id);

      const response = await categoryService.delete(id);

      // El servicio devuelve los datos formateados
      if (response) {
        // Mostrar éxito
        showSuccess(
          '¡Categoría eliminada!',
          'La categoría se ha eliminado exitosamente',
          () => {
            // Refrescar lista según el modo de vista
            if (viewMode === 'tree') {
              fetchCategoryTree();
            } else if (viewMode === 'list') {
              fetchHierarchicalCategories();
            } else {
              fetchCategories();
            }
          }
        );

        console.log('✅ [useCategories-Mobile] Categoría eliminada exitosamente');
        return response;
      } else {
        throw new Error('Error al eliminar categoría');
      }
    } catch (error) {
      handleError(error, 'Error al eliminar categoría');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [viewMode, fetchCategories, fetchCategoryTree, fetchHierarchicalCategories, handleError]);

  const toggleCategoryStatus = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 [useCategories-Mobile] Cambiando estado de categoría:', id);

      const response = await categoryService.toggleStatus(id);

      // El servicio devuelve los datos formateados
      if (response) {
        // Mostrar éxito
        showSuccess(
          '¡Estado actualizado!',
          'El estado de la categoría se ha actualizado exitosamente',
          () => {
            // Refrescar lista según el modo de vista
            if (viewMode === 'tree') {
              fetchCategoryTree();
            } else if (viewMode === 'list') {
              fetchHierarchicalCategories();
            } else {
              fetchCategories();
            }
          }
        );

        console.log('✅ [useCategories-Mobile] Estado cambiado exitosamente');
        return response;
      } else {
        throw new Error('Error al cambiar estado');
      }
    } catch (error) {
      handleError(error, 'Error al cambiar estado');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [viewMode, fetchCategories, fetchCategoryTree, fetchHierarchicalCategories, handleError]);

  // ==================== FUNCIONES DE FILTROS Y BÚSQUEDA ====================
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const updateSorting = useCallback((newSortBy, newSortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

  const updateViewMode = useCallback((newViewMode) => {
    setViewMode(newViewMode);
  }, []);

  const searchCategories = useCallback(async (query) => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [useCategories-Mobile] Buscando categorías:', query);

      const response = await categoryService.search(query, filters);

      // El servicio devuelve un objeto con categories
      if (response && response.categories) {
        setCategories(response.categories);
        console.log('✅ [useCategories-Mobile] Búsqueda completada:', response.categories.length);
      } else if (Array.isArray(response)) {
        setCategories(response);
        console.log('✅ [useCategories-Mobile] Búsqueda completada:', response.length);
      } else {
        throw new Error('Error en la búsqueda');
      }
    } catch (error) {
      handleError(error, 'Error en la búsqueda');
    } finally {
      setLoading(false);
    }
  }, [filters, handleError]);

  // ==================== EFECTOS ====================
  useEffect(() => {
    // Cargar categorías según el modo de vista
    if (viewMode === 'tree') {
      fetchCategoryTree();
    } else if (viewMode === 'list') {
      fetchHierarchicalCategories();
    } else {
      fetchCategories();
    }
  }, [viewMode, fetchCategories, fetchCategoryTree, fetchHierarchicalCategories]);

  // ==================== ESTADOS DERIVADOS ====================
  const hasCategories = categories.length > 0;
  const hasTree = categoryTree.length > 0;
  const hasHierarchical = hierarchicalCategories.length > 0;
  const isEmpty = !loading && !hasCategories && !hasTree && !hasHierarchical;
  const canRetry = !loading && error;

  // ==================== RETURN ====================
  return {
    // Estados
    categories,
    categoryTree,
    hierarchicalCategories,
    loading,
    error,
    pagination,
    filters,
    sortBy,
    sortOrder,
    viewMode,

    // Estados derivados
    hasCategories,
    hasTree,
    hasHierarchical,
    isEmpty,
    canRetry,

    // Funciones CRUD
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,

    // Funciones de datos
    fetchCategories,
    fetchCategoryTree,
    fetchHierarchicalCategories,
    searchCategories,

    // Funciones de filtros
    updateFilters,
    updateSorting,
    updateViewMode,

    // Utilidades
    clearError,
    handleError
  };
};

export default useCategories;
