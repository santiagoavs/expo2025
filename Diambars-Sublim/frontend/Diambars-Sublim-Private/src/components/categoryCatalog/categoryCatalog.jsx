import React, { useState, useContext, useEffect } from 'react';
import { 
  FaChevronDown, 
  FaChevronRight, 
  FaEdit, 
  FaTrash, 
  FaSync,
  FaPlus,
  FaSearch
} from 'react-icons/fa';
import { CategoryContext } from '../../context/categoryContext';
import { useNavigate } from 'react-router-dom';
import './CategoryCatalog.css';

const CategoryCatalog = () => {
  const { 
    categories, 
    categoryTree,
    flatCategories,
    loading, 
    error,
    fetchCategories,
    removeCategory
  } = useContext(CategoryContext);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [expanded, setExpanded] = useState({});
  const [filteredCategories, setFilteredCategories] = useState([]);
  const navigate = useNavigate();

  // Inicializar categorías expandidas
  useEffect(() => {
    const initialExpanded = {};
    categoryTree.forEach(cat => {
      if (!cat.parent) {
        initialExpanded[cat._id] = true;
      }
    });
    setExpanded(initialExpanded);
  }, [categoryTree]);

  // Filtrar categorías basado en el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredCategories(categoryTree);
      return;
    }

    const filtered = flatCategories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()))
      .map(cat => cat._id)
    );

    const filterTree = (tree) => {
      return tree
        .filter(cat => 
          filtered.includes(cat._id) ||
          (cat.children && filterTree(cat.children).length > 0)
        )
        .map(cat => ({
          ...cat,
          children: cat.children ? filterTree(cat.children) : []
        }));
    };

    setFilteredCategories(filterTree(categoryTree));
  }, [searchTerm, categoryTree, flatCategories]);

  const handleToggle = (categoryId) => {
    setExpanded(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const handleEdit = (categoryId) => {
    navigate(`/category/edit/${categoryId}`);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('¿Estás seguro de eliminar esta categoría?')) {
      try {
        await removeCategory(categoryId);
      } catch (error) {
        alert(error.message);
      }
    }
  };

  const handleRefresh = async () => {
    try {
      await fetchCategories();
    } catch (error) {
      console.error("Error refreshing categories:", error);
    }
  };

  const handleCreateNew = () => {
    navigate('/category/new');
  };

  const buildTree = (tree = [], parentId = null) => {
    return tree
      .filter(cat => 
        (parentId === null && !cat.parent) || 
        (cat.parent && cat.parent.toString() === parentId.toString())
      )
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(cat => {
        const isExpanded = expanded[cat._id];
        const hasChildren = cat.children && cat.children.length > 0;

        return (
          <div key={cat._id} className="category-group">
            <div className="group-header" onClick={() => handleToggle(cat._id)}>
              {hasChildren ? (
                isExpanded ? <FaChevronDown /> : <FaChevronRight />
              ) : <span style={{ width: '16px', display: 'inline-block' }}></span>}
              
              <span className="category-name">
                {cat.name} 
                <span className="product-count">({cat.productCount || 0})</span>
              </span>
              
              <div className="category-actions">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleEdit(cat._id); }}
                  className="edit-btn"
                  title="Editar categoría"
                >
                  <FaEdit />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(cat._id); }}
                  className="delete-btn"
                  title="Eliminar categoría"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            
            {isExpanded && hasChildren && (
              <div className="subcategories">
                {buildTree(cat.children, cat._id)}
              </div>
            )}
          </div>
        );
      });
  };

  if (loading && !categories.length) {
    return (
      <div className="category-catalog-container">
        <div className="loading-message">Cargando categorías...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-catalog-container">
        <div className="error-message">
          Error al cargar categorías: {error}
          <button onClick={handleRefresh} className="retry-btn">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-catalog-container">
      <div className="category-catalog-header">
        <h2>GESTIÓN DE CATEGORÍAS</h2>
        <div className="header-actions">
          <button onClick={handleRefresh} className="refresh-btn" title="Actualizar lista">
            <FaSync />
          </button>
          <button onClick={handleCreateNew} className="new-btn" title="Crear nueva categoría">
            <FaPlus />
          </button>
        </div>
      </div>

      <div className="catalog-section">
        <label className="section-title">CATEGORÍAS</label>
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
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
              title="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>

        <div className="category-list">
          {filteredCategories.length > 0 ? (
            buildTree(filteredCategories)
          ) : (
            <div className="empty-message">
              {searchTerm ? 
                "No se encontraron categorías que coincidan con la búsqueda" : 
                "No hay categorías creadas"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryCatalog;