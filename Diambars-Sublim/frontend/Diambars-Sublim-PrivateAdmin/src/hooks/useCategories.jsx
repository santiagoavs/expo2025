import { useCallback, useEffect, useState } from 'react';
import categoryService from '../api/categoryService';
import { toast } from 'react-hot-toast';

const handleError = (error, defaultMessage) => {
  const errorData = error.response?.data || {};
  const errorMessage = errorData.message || errorData.error || error.message || defaultMessage;

  console.error('Error:', { error, response: error.response, config: error.config });
  toast.error(errorMessage);
  throw new Error(errorMessage);
};

const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [flatCategories, setFlatCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await categoryService.getAll(); // Esperamos un objeto { categories, categoryTree }
      console.log("👉 Categorías recibidas:", data);

      if (!data || !Array.isArray(data.categories) || !Array.isArray(data.categoryTree)) {
        throw new Error("Categorías inválidas");
      }

      setCategories(data.categories);
      setCategoryTree(data.categoryTree);

      // flatCategories = categories planas (sin jerarquía)
      setFlatCategories(data.categories);

    } catch (err) {
      console.error("❌ Error al cargar categorías:", err);
      setError(err.message || "Error al cargar categorías");
      setCategories([]);
      setCategoryTree([]);
      setFlatCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const removeCategory = useCallback(async (id) => {
    try {
      await categoryService.deleteCategory(id);
      toast.success('Categoría eliminada');
      await fetchCategories();
    } catch (error) {
      handleError(error, 'Error al eliminar categoría');
    }
  }, [fetchCategories]);

  const getCategoryById = useCallback(async (id) => {
    try {
      const response = await categoryService.getCategoryById(id);
      return response;
    } catch (error) {
      handleError(error, 'Error al obtener categoría');
    }
  }, []);

  const createCategory = useCallback(async (formData) => {
    try {
      const response = await categoryService.createCategory(formData);
      toast.success('Categoría creada');
      await fetchCategories();
      return response;
    } catch (error) {
      handleError(error, 'Error al crear categoría');
    }
  }, [fetchCategories]);

  const updateCategory = useCallback(async (id, formData) => {
    try {
      const response = await categoryService.updateCategory(id, formData);
      toast.success('Categoría actualizada');
      await fetchCategories();
      return response;
    } catch (error) {
      handleError(error, 'Error al actualizar categoría');
    }
  }, [fetchCategories]);

  const searchCategories = useCallback(async (query) => {
    try {
      const response = await categoryService.searchCategories(query);
      return response;
    } catch (error) {
      handleError(error, 'Error al buscar categorías');
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    categoryTree,
    flatCategories,
    loading,
    error,
    fetchCategories,
    removeCategory,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory: removeCategory,
    searchCategories
  };
};

export default useCategories;
