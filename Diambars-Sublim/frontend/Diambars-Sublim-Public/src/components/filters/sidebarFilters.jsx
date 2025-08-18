// src/components/filters/sidebarFilters.jsx
import React, { useState, useEffect } from 'react';
import './sidebarFilters.css';

const FilterSidebar = ({ onFiltersChange, activeFilters = {} }) => {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
  try {
    setLoading(true);
    setError(null);
    
    console.log('Cargando categorías...');
    
    // Construir la URL completa
    const baseURL = process.env.NODE_ENV === 'production' 
      ? process.env.REACT_APP_API_URL || '' 
      : 'http://localhost:4000';
    
    const url = `${baseURL}/api/categories`;
    console.log('Fetching desde:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Verificar que la respuesta sea JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Expected JSON, got ${contentType}`);
    }
    
    const data = await response.json();
    console.log('Data recibida:', data);
    
    if (data.categories && data.categoryTree) {
      setCategories(data.categories);
      setCategoryTree(data.categoryTree);
      console.log('✅ Categorías cargadas:', data.categories.length);
    } else {
      console.warn('⚠️ Estructura de datos inesperada:', data);
      setError('Estructura de datos inesperada del servidor');
    }
  } catch (err) {
    console.error('❌ Error cargando categorías:', err);
    setError(`Error al cargar categorías: ${err.message}`);
  } finally {
    setLoading(false);
  }
};

  // Manejar selección de categoría
  const handleCategorySelect = (categoryId, categoryName) => {
    const newFilters = { ...activeFilters };
    
    if (!newFilters.categories) {
      newFilters.categories = [];
    }

    // Toggle categoría
    const isSelected = newFilters.categories.some(cat => cat.id === categoryId);
    
    if (isSelected) {
      // Remover categoría
      newFilters.categories = newFilters.categories.filter(cat => cat.id !== categoryId);
    } else {
      // Agregar categoría
      newFilters.categories.push({ id: categoryId, name: categoryName });
    }

    // Si no hay categorías seleccionadas, eliminar el filtro
    if (newFilters.categories.length === 0) {
      delete newFilters.categories;
    }

    onFiltersChange && onFiltersChange(newFilters);
  };

  // Toggle expansión de categoría padre
  const toggleCategoryExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Verificar si una categoría está seleccionada
  const isCategorySelected = (categoryId) => {
    return activeFilters.categories?.some(cat => cat.id === categoryId) || false;
  };

  // Renderizar una categoría individual
  const renderCategory = (category, level = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedCategories.has(category._id);
    const isSelected = isCategorySelected(category._id);

    return (
      <div key={category._id} className="category-item">
        <div 
          className={`category-content level-${level} ${isSelected ? 'selected' : ''}`}
          style={{ paddingLeft: `${level * 15}px` }}
        >
          {hasChildren && (
            <button
              className={`expand-button ${isExpanded ? 'expanded' : ''}`}
              onClick={() => toggleCategoryExpansion(category._id)}
              aria-label={isExpanded ? 'Contraer' : 'Expandir'}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}
          
          <label className="category-label">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleCategorySelect(category._id, category.name)}
              className="category-checkbox"
            />
            <span className="category-name">
              {category.name}
              {category.productCount > 0 && (
                <span className="product-count">({category.productCount})</span>
              )}
            </span>
          </label>
        </div>

        {hasChildren && isExpanded && (
          <div className="subcategories">
            {category.children.map(child => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Limpiar todos los filtros
  const clearAllFilters = () => {
    onFiltersChange && onFiltersChange({});
  };

  // Mostrar loading
  if (loading) {
    return (
      <aside className="filter-sidebar">
        <h3 className="filter-title">Filtros</h3>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Cargando categorías...</p>
        </div>
      </aside>
    );
  }

  // Mostrar error
  if (error) {
    return (
      <aside className="filter-sidebar">
        <h3 className="filter-title">Filtros</h3>
        <div className="error-state">
          <p className="error-message">{error}</p>
          <button onClick={fetchCategories} className="retry-button">
            Reintentar
          </button>
        </div>
      </aside>
    );
  }

  return (
    <aside className="filter-sidebar">
      <div className="filter-header">
        <h3 className="filter-title">Filtros</h3>
        {Object.keys(activeFilters).length > 0 && (
          <button onClick={clearAllFilters} className="clear-filters-btn">
            Limpiar
          </button>
        )}
      </div>

      {/* Filtros activos */}
      {activeFilters.categories && activeFilters.categories.length > 0 && (
        <div className="active-filters">
          <h4 className="active-filters-title">Filtros activos:</h4>
          <div className="active-filter-tags">
            {activeFilters.categories.map(cat => (
              <span key={cat.id} className="filter-tag">
                {cat.name}
                <button
                  onClick={() => handleCategorySelect(cat.id, cat.name)}
                  className="remove-filter-btn"
                  aria-label={`Quitar filtro ${cat.name}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Categorías */}
      <div className="filter-group">
        <h4 className="filter-heading">Categorías</h4>
        
        {categoryTree.length === 0 ? (
          <p className="no-categories">No hay categorías disponibles</p>
        ) : (
          <div className="categories-list">
            {categoryTree.map(category => renderCategory(category))}
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="filter-info">
        <small>
          {categories.length} categoría{categories.length !== 1 ? 's' : ''} disponible{categories.length !== 1 ? 's' : ''}
        </small>
      </div>
    </aside>
  );
};

export default FilterSidebar;