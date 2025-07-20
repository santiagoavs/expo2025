import React, { useState, useEffect } from 'react';
import { FaChevronDown, FaChevronRight, FaEdit, FaTrash, FaSync, FaSearch } from 'react-icons/fa';
import useCategories from '../../hooks/useCategories';
import Swal from 'sweetalert2';
import { motion } from 'framer-motion';
import './CategoryCatalog.css';

const CategoryCatalog = ({ onEditCategory, refreshTrigger }) => {
  const {
    categories,
    categoryTree,
    flatCategories,
    loading,
    error,
    fetchCategories,
    removeCategory,
  } = useCategories();

  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState({});
  const [filteredCategories, setFilteredCategories] = useState([]);

  // Efecto para recargar categorías
  useEffect(() => {
    fetchCategories();
  }, [refreshTrigger, fetchCategories]);

  useEffect(() => {
    if (!categoryTree || categoryTree.length === 0) return;
    const initialExpanded = {};
    categoryTree.forEach((cat) => {
      if (!cat.parent) {
        initialExpanded[cat._id] = true;
      }
    });
    setExpanded(initialExpanded);
  }, [categoryTree]);

  useEffect(() => {
    if (!categoryTree || !flatCategories) return;

    if (!searchTerm) {
      setFilteredCategories(categoryTree);
      return;
    }

    const filteredIds = flatCategories
      .filter(
        (cat) =>
          cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      .map((cat) => cat._id);

    const filterTree = (tree) => {
      return tree
        .filter(
          (cat) =>
            filteredIds.includes(cat._id) ||
            (cat.children && filterTree(cat.children).length > 0)
        )
        .map((cat) => ({
          ...cat,
          children: cat.children ? filterTree(cat.children) : [],
        }));
    };

    setFilteredCategories(filterTree(categoryTree));
  }, [searchTerm, categoryTree, flatCategories]);

  const handleToggle = (categoryId) => {
    setExpanded((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const handleDelete = async (categoryId) => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#086788',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: 'rgba(255, 246, 226, 0.95)',
      backdrop: 'rgba(245, 231, 198, 0.5)'
    });

    if (result.isConfirmed) {
      try {
        await removeCategory(categoryId);
        Swal.fire({
          icon: 'success',
          title: '¡Eliminado!',
          text: 'La categoría ha sido eliminada',
          showConfirmButton: false,
          timer: 1500
        });
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: error.message || 'Ha ocurrido un error al eliminar'
        });
      }
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchCategories();
      Swal.fire({
        icon: 'success',
        title: '¡Actualizado!',
        text: 'La lista de categorías se ha actualizado',
        showConfirmButton: false,
        timer: 1000
      });
    } catch (error) {
      console.error('Error refreshing categories:', error);
    }
  };

  const buildTree = (tree = [], parentId = null, depth = 0) => {
    return tree
      .filter(
        (cat) =>
          (parentId === null && !cat.parent) ||
          (cat.parent && cat.parent.toString() === parentId?.toString())
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((cat) => {
        const isExpanded = expanded[cat._id];
        const hasChildren = cat.children && cat.children.length > 0;

        return (
          <motion.div 
            key={cat._id} 
            className="category-group" 
            style={{ marginLeft: `${depth * 20}px` }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div 
              className="group-header" 
              onClick={() => handleToggle(cat._id)}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.7)' }}
            >
              {hasChildren ? (
                isExpanded ? <FaChevronDown /> : <FaChevronRight />
              ) : (
                <span style={{ width: '16px', display: 'inline-block' }}></span>
              )}
              <span className="category-name">
                {cat.name} <span className="product-count">({cat.productCount || 0})</span>
              </span>
              <div className="category-actions">
                <motion.button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    onEditCategory(cat); 
                  }} 
                  className="edit-btn" 
                  title="Editar categoría"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaEdit />
                </motion.button>
                <motion.button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    handleDelete(cat._id); 
                  }} 
                  className="delete-btn" 
                  title="Eliminar categoría"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FaTrash />
                </motion.button>
              </div>
            </motion.div>
            {isExpanded && hasChildren && (
              <div className="subcategories">
                {buildTree(cat.children, cat._id, depth + 1)}
              </div>
            )}
          </motion.div>
        );
      });
  };

  if (loading && (!categories || categories.length === 0)) {
    return (
      <div className="category-catalog-container">
        <div className="loading-overlay">
          <div className="spinner"></div>
          <p>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-catalog-container">
        <div className="error-overlay">
          <p>Error al cargar categorías: {error}</p>
          <motion.button 
            onClick={handleRefresh} 
            className="retry-btn"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Reintentar
          </motion.button>
        </div>
      </div>
    );
  }

  return (
  <motion.div 
    className="category-catalog-container"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <div className="catalog-section">
      <div className="section-header">
        <label className="section-title">CATEGORÍAS</label>
        <motion.button 
          onClick={handleRefresh} 
          className="refresh-btn" 
          title="Actualizar lista"
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FaSync />
        </motion.button>
      </div>
      
      <div className="search-container">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Buscar categoría..."
          className="category-search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button className="clear-search" onClick={() => setSearchTerm('')} title="Limpiar búsqueda">
            ×
          </button>
        )}
      </div>

      <div className="category-list-container">
        <div className="category-list">
          {Array.isArray(filteredCategories) && filteredCategories.length > 0 ? (
            buildTree(filteredCategories)
          ) : (
            <div className="empty-message">
              {searchTerm ?
                'No se encontraron categorías que coincidan con la búsqueda' :
                'No hay categorías creadas'}
            </div>
          )}
        </div>
      </div>
    </div>
  </motion.div>
);
};

export default CategoryCatalog;