import React, { createContext, useState, useEffect, useCallback } from 'react';
import { 
  getAllCategories,
  getCategoryById,
  createCategory as createCategoryService,
  updateCategory as updateCategoryService,
  deleteCategory as deleteCategoryService,
  searchCategories as searchCategoriesService
} from '../api/categoryService';

export const CategoryContext = createContext();

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para aplanar el árbol de categorías
  const flattenCategories = useCallback((tree, result = []) => {
    if (!tree) return [];
    tree.forEach(category => {
      result.push({
        ...category,
        children: undefined // Eliminamos children para la lista plana
      });
      if (category.children) {
        flattenCategories(category.children, result);
      }
    });
    return result;
  }, []);

  // Cargar todas las categorías
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAllCategories();
      
      setCategories(response.categories || []);
      setCategoryTree(response.categoryTree || []);
      setFlatCategories(flattenCategories(response.categoryTree || []));
      
    } catch (err) {
      setError(err.message);
      console.error("Error fetching categories:", err);
      setCategories([]);
      setCategoryTree([]);
      setFlatCategories([]);
    } finally {
      setLoading(false);
    }
  }, [flattenCategories]);

  // Cargar una categoría específica por ID
  const fetchCategoryById = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getCategoryById(id);
      setCurrentCategory(response.category || null);
      
      return response.category;
    } catch (err) {
      setError(err.message);
      console.error("Error fetching category:", err);
      setCurrentCategory(null);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear categoría
  const addCategory = useCallback(async (formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await createCategoryService(formData);
      await fetchCategories(); // Refrescar la lista
      
      return response.category;
    } catch (err) {
      setError(err.message);
      console.error("Error adding category:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  // Actualizar categoría
  const updateCategory = useCallback(async (id, formData) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await updateCategoryService(id, formData);
      await fetchCategories(); // Refrescar la lista
      
      return response.category;
    } catch (err) {
      setError(err.message);
      console.error("Error updating category:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  // Eliminar categoría
  const removeCategory = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      await deleteCategoryService(id);
      await fetchCategories(); // Refrescar la lista
    } catch (err) {
      setError(err.message);
      console.error("Error deleting category:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchCategories]);

  // Buscar categorías
  const searchCategories = useCallback(async (query) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await searchCategoriesService(query);
      return response.categories || [];
    } catch (err) {
      setError(err.message);
      console.error("Error searching categories:", err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar categorías al montar
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <CategoryContext.Provider
      value={{
        categories,
        categoryTree,
        flatCategories,
        currentCategory,
        loading,
        error,
        fetchCategories,
        fetchCategoryById,
        addCategory,
        updateCategory,
        removeCategory,
        searchCategories
      }}
    >
      {children}
    </CategoryContext.Provider>
  );
};