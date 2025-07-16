import { useState, useEffect, useCallback } from 'react';
import api from '../api/apiClient';
import { showError, showSuccess } from '../utils/sweetAlert';

const useCategory = () => {
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = (err, fallbackMsg) => {
    console.error(err);
    const msg = err?.message || fallbackMsg || 'Error inesperado';
    setError(err);
    showError('Oops...', msg);
  };

  // 🔄 Obtener todas
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/categories');
      setCategories(data);
    } catch (err) {
      handleError(err, 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔍 Buscar
  const searchCategories = async (query) => {
    setLoading(true);
    try {
      const data = await api.get('/categories/search', { params: { q: query } });
      setCategories(data);
    } catch (err) {
      handleError(err, 'Error al buscar categorías');
    } finally {
      setLoading(false);
    }
  };

  // 📥 Obtener por ID
  const getCategoryById = async (id) => {
    setLoading(true);
    try {
      const data = await api.get(`/categories/${id}`);
      setCategory(data);
      return data;
    } catch (err) {
      handleError(err, 'Error al obtener categoría');
    } finally {
      setLoading(false);
    }
  };

  // ➕ Crear
  const createCategory = async (formData) => {
    setLoading(true);
    try {
      const data = await api.post('/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showSuccess('Categoría creada con éxito');
      fetchCategories();
      return data;
    } catch (err) {
      handleError(err, 'Error al crear categoría');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Actualizar
  const updateCategory = async (id, formData) => {
    setLoading(true);
    try {
      const data = await api.put(`/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showSuccess('Categoría actualizada');
      fetchCategories();
      return data;
    } catch (err) {
      handleError(err, 'Error al actualizar categoría');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // ❌ Eliminar
  const deleteCategory = async (id) => {
    setLoading(true);
    try {
      const data = await api.delete(`/categories/${id}`);
      showSuccess('Categoría eliminada');
      fetchCategories();
      return data;
    } catch (err) {
      handleError(err, 'Error al eliminar categoría');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🚀 Auto fetch on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    category,
    loading,
    error,
    fetchCategories,
    searchCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
  };
};

export default useCategory;
