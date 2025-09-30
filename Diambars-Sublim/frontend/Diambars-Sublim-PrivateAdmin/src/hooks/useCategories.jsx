import { useCallback, useEffect, useState } from 'react';
import categoryService from '../api/categoryService';
import { toast } from 'react-hot-toast';

// Función mejorada para manejar errores
const handleError = (error, defaultMessage, context = '') => {
  console.error(`❌ [useCategories] Error${context ? ` en ${context}` : ''}:`, {
    error,
    response: error.response,
    config: error.config,
    timestamp: new Date().toISOString()
  });

  let errorMessage = defaultMessage;
  let errorType = 'unknown';

  // Determinar el tipo de error
  if (error.response) {
    const status = error.response.status;
    const errorData = error.response.data || {};
    
    errorMessage = errorData.message || errorData.error || error.message || defaultMessage;
    
    switch (status) {
      case 400:
        errorType = 'validation';
        break;
      case 401:
        errorType = 'unauthorized';
        errorMessage = 'No tienes permisos para realizar esta acción';
        break;
      case 403:
        errorType = 'forbidden';
        errorMessage = 'Acceso denegado';
        break;
      case 404:
        errorType = 'not_found';
        errorMessage = 'Recurso no encontrado';
        break;
      case 409:
        errorType = 'conflict';
        break;
      case 413:
        errorType = 'file_too_large';
        errorMessage = 'El archivo es demasiado grande';
        break;
      case 422:
        errorType = 'validation';
        break;
      case 500:
        errorType = 'server';
        errorMessage = 'Error interno del servidor';
        break;
      default:
        errorType = 'network';
        errorMessage = 'Error de conexión con el servidor';
    }
  } else if (error.request) {
    errorType = 'network';
    errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
  } else {
    errorType = 'client';
    errorMessage = error.message || defaultMessage;
  }

  // Mostrar toast con tipo específico
  if (errorType === 'validation') {
    toast.error(`❌ ${errorMessage}`, { duration: 5000 });
  } else if (errorType === 'network') {
    toast.error(`🌐 ${errorMessage}`, { duration: 7000 });
  } else if (errorType === 'server') {
    toast.error(`⚠️ ${errorMessage}`, { duration: 6000 });
  } else {
    toast.error(`❌ ${errorMessage}`, { duration: 4000 });
  }

  return {
    message: errorMessage,
    type: errorType,
    originalError: error
  };
};

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  // Función para reintentar operaciones
  const retryOperation = useCallback(async (operation, maxRetries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (err) {
        console.warn(`⚠️ Intento ${attempt}/${maxRetries} falló:`, err.message);
        
        if (attempt === maxRetries) {
          throw err;
        }
        
        // Esperar antes del siguiente intento
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }, []);

  const fetchCategories = useCallback(async (forceRefresh = false) => {
    if (loading && !forceRefresh) return;
    
    setLoading(true);
    setError(null);
    
    try {
      console.log("🔄 [useCategories] Cargando categorías...");
      
      const data = await retryOperation(
        () => categoryService.getAll(),
        3,
        1000
      );
      
      console.log("✅ [useCategories] Categorías recibidas:", data);

      // Validar estructura de datos
      if (!data) {
        throw new Error("No se recibieron datos del servidor");
      }

      const categoriesData = data.categories || [];
      const treeData = data.categoryTree || [];

      if (!Array.isArray(categoriesData)) {
        throw new Error("Formato de categorías inválido");
      }

      setCategories(categoriesData);
      setCategoryTree(treeData);
      setFlatCategories(categoriesData);
      setRetryCount(0);

      console.log(`✅ [useCategories] ${categoriesData.length} categorías cargadas exitosamente`);

    } catch (err) {
      console.error("❌ [useCategories] Error al cargar categorías:", err);
      
      const errorInfo = handleError(err, "Error al cargar categorías", "fetchCategories");
      setError(errorInfo.message);
      
      // Limpiar datos en caso de error
      setCategories([]);
      setCategoryTree([]);
      setFlatCategories([]);
      
      // Incrementar contador de reintentos
      setRetryCount(prev => prev + 1);
      
    } finally {
      setLoading(false);
    }
  }, [loading, retryOperation]);

  const removeCategory = useCallback(async (id) => {
    if (!id) {
      toast.error('ID de categoría requerido');
      return;
    }

    try {
      console.log(`🗑️ [useCategories] Eliminando categoría ${id}...`);
      
      await retryOperation(
        () => categoryService.deleteCategory(id),
        2,
        500
      );
      
      toast.success('✅ Categoría eliminada exitosamente');
      await fetchCategories(true); // Forzar recarga
      
    } catch (error) {
      const errorInfo = handleError(error, 'Error al eliminar categoría', 'removeCategory');
      
      // Mostrar mensaje específico según el tipo de error
      if (errorInfo.type === 'conflict') {
        toast.error('❌ No se puede eliminar: La categoría tiene subcategorías o productos asociados');
      } else if (errorInfo.type === 'not_found') {
        toast.error('❌ La categoría no existe');
      }
      
      throw errorInfo.originalError;
    }
  }, [fetchCategories, retryOperation]);

  const getCategoryById = useCallback(async (id) => {
    if (!id) {
      throw new Error('ID de categoría requerido');
    }

    try {
      console.log(`🔍 [useCategories] Obteniendo categoría ${id}...`);
      
      const response = await retryOperation(
        () => categoryService.getCategoryById(id),
        2,
        500
      );
      
      return response;
      
    } catch (error) {
      const errorInfo = handleError(error, 'Error al obtener categoría', 'getCategoryById');
      throw errorInfo.originalError;
    }
  }, [retryOperation]);

  const createCategory = useCallback(async (formData) => {
    if (!formData) {
      toast.error('Datos de categoría requeridos');
      return;
    }

    try {
      console.log('➕ [useCategories] Creando nueva categoría...');
      
      const response = await retryOperation(
        () => categoryService.createCategory(formData),
        2,
        1000
      );
      
      toast.success('✅ Categoría creada exitosamente');
      await fetchCategories(true); // Forzar recarga
      
      return response;
      
    } catch (error) {
      const errorInfo = handleError(error, 'Error al crear categoría', 'createCategory');
      
      // Mostrar mensaje específico según el tipo de error
      if (errorInfo.type === 'validation') {
        toast.error('❌ Datos inválidos: Verifica que todos los campos estén correctos');
      } else if (errorInfo.type === 'conflict') {
        toast.error('❌ Ya existe una categoría con ese nombre');
      } else if (errorInfo.type === 'file_too_large') {
        toast.error('❌ La imagen es demasiado grande (máximo 5MB)');
      }
      
      throw errorInfo.originalError;
    }
  }, [fetchCategories, retryOperation]);

  const updateCategory = useCallback(async (id, formData) => {
    if (!id || !formData) {
      toast.error('ID y datos de categoría requeridos');
      return;
    }

    try {
      console.log(`✏️ [useCategories] Actualizando categoría ${id}...`);
      
      const response = await retryOperation(
        () => categoryService.updateCategory(id, formData),
        2,
        1000
      );
      
      toast.success('✅ Categoría actualizada exitosamente');
      await fetchCategories(true); // Forzar recarga
      
      return response;
      
    } catch (error) {
      const errorInfo = handleError(error, 'Error al actualizar categoría', 'updateCategory');
      
      // Mostrar mensaje específico según el tipo de error
      if (errorInfo.type === 'validation') {
        toast.error('❌ Datos inválidos: Verifica que todos los campos estén correctos');
      } else if (errorInfo.type === 'conflict') {
        toast.error('❌ Ya existe otra categoría con ese nombre');
      } else if (errorInfo.type === 'not_found') {
        toast.error('❌ La categoría no existe');
      } else if (errorInfo.type === 'file_too_large') {
        toast.error('❌ La imagen es demasiado grande (máximo 5MB)');
      }
      
      throw errorInfo.originalError;
    }
  }, [fetchCategories, retryOperation]);

  const searchCategories = useCallback(async (query) => {
    if (!query || query.trim().length < 2) {
      return { categories: [], total: 0 };
    }

    try {
      console.log(`🔍 [useCategories] Buscando categorías: "${query}"`);
      
      const response = await retryOperation(
        () => categoryService.searchCategories(query.trim()),
        2,
        500
      );
      
      return response;
      
    } catch (error) {
      const errorInfo = handleError(error, 'Error al buscar categorías', 'searchCategories');
      throw errorInfo.originalError;
    }
  }, [retryOperation]);

  // Función para reintentar la carga
  const retryFetch = useCallback(() => {
    console.log(`🔄 [useCategories] Reintentando carga (intento ${retryCount + 1})...`);
    fetchCategories(true);
  }, [fetchCategories, retryCount]);

  // Función para limpiar errores
  const clearError = useCallback(() => {
    setError(null);
    setRetryCount(0);
  }, []);

  // Función para validar datos de categoría
  const validateCategoryData = useCallback((data) => {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres');
    }
    
    if (data.name && data.name.trim().length > 100) {
      errors.push('El nombre no puede exceder los 100 caracteres');
    }
    
    if (data.description && data.description.length > 500) {
      errors.push('La descripción no puede exceder los 500 caracteres');
    }
    
    if (data.order !== undefined && (isNaN(data.order) || data.order < 0)) {
      errors.push('El orden debe ser un número mayor o igual a 0');
    }
    
    return errors;
  }, []);

  useEffect(() => {
    fetchCategories();
  }, []); // ✅ SOLUCIÓN: Remover fetchCategories de las dependencias para evitar re-renderizado infinito

  return {
    // Estados
    categories,
    categoryTree,
    flatCategories,
    loading,
    error,
    retryCount,
    
    // Funciones principales
    fetchCategories,
    removeCategory,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory: removeCategory,
    searchCategories,
    
    // Funciones auxiliares
    retryFetch,
    clearError,
    validateCategoryData,
    
    // Estados de control
    hasError: !!error,
    canRetry: retryCount < 3,
    isEmpty: categories.length === 0 && !loading
  };
};

export default useCategories;
