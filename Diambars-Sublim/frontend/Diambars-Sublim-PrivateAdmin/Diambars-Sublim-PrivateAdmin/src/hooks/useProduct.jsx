import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import productService from '../api/productService';
import useCategories from './useCategories';

/**
 * Hook para gestionar productos con manejo robusto de errores
 * y soporte para categorías/subcategorías
 */
export const useProducts = (filters = {}) => {
  // Estados para datos
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  
  // Estados para operaciones
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Estados para resultados
  const [createResult, setCreateResult] = useState(null);
  const [updateResult, setUpdateResult] = useState(null);
  const [deleteResult, setDeleteResult] = useState(null);
  
  // Obtener categorías/subcategorías usando el hook existente
  const { 
    categories, 
    categoryTree, 
    flatCategories, 
    loading: loadingCategories 
  } = useCategories();

  // Función para obtener subcategorías de una categoría padre
  const getSubcategories = useCallback((parentId = null) => {
    if (!parentId) {
      // Si no hay parentId, devolver categorías de nivel superior
      return categoryTree.filter(cat => !cat.parentCategory);
    }
    
    // Encontrar la categoría padre y devolver sus hijos
    const parent = flatCategories.find(cat => cat._id === parentId);
    if (!parent) return [];
    
    // Filtrar todas las categorías que tienen a este parent como padre
    return flatCategories.filter(cat => 
      cat.parentCategory && cat.parentCategory === parentId
    );
  }, [categoryTree, flatCategories]);

  // Función para cargar productos
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Fetching products with filters:', filters);
      const response = await productService.getAllProducts(filters);
      
      setProducts(response.data?.products || []);
      setPagination(response.data?.pagination || {});
      console.log('✅ Products fetched successfully:', response);
    } catch (err) {
      console.error('❌ Error fetching products:', err);
      setError(err.message || 'Error al cargar productos');
      toast.error(err.message || 'Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Cargar productos al montar o cambiar filtros
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Crear un producto
  const createProduct = async (productData) => {
    try {
      setIsCreating(true);
      setError(null);
      
      const response = await productService.createProduct(productData);
      setCreateResult(response);
      toast.success('Producto creado exitosamente');
      
      // Refrescar la lista
      fetchProducts();
      return response;
    } catch (err) {
      console.error('❌ Error creating product:', err);
      setError(err.message || 'Error al crear el producto');
      toast.error(err.message || 'Error al crear el producto');
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  // Actualizar un producto
  const updateProduct = async ({ id, data }) => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const response = await productService.updateProduct(id, data);
      setUpdateResult(response);
      toast.success('Producto actualizado exitosamente');
      
      // Refrescar la lista
      fetchProducts();
      return response;
    } catch (err) {
      console.error('❌ Error updating product:', err);
      setError(err.message || 'Error al actualizar el producto');
      toast.error(err.message || 'Error al actualizar el producto');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  };

  // Eliminar un producto
  const deleteProduct = async (id) => {
    try {
      setIsDeleting(true);
      setError(null);
      
      const response = await productService.deleteProduct(id);
      setDeleteResult(response);
      toast.success('Producto eliminado exitosamente');
      
      // Refrescar la lista
      fetchProducts();
      return response;
    } catch (err) {
      console.error('❌ Error deleting product:', err);
      setError(err.message || 'Error al eliminar el producto');
      toast.error(err.message || 'Error al eliminar el producto');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    // Datos
    products,
    pagination,
    
    // Estados
    isLoading,
    isError: !!error,
    error,
    isCreating,
    isUpdating,
    isDeleting,
    
    // Acciones
    refetch: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    
    // Resultado de mutaciones
    createResult,
    updateResult,
    deleteResult,
    
    // Categorías y subcategorías
    categories,
    categoryTree,
    flatCategories,
    getSubcategories,
    isLoadingCategories: loadingCategories
  };
};