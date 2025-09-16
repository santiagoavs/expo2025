// src/components/filters/sidebarFilters.jsx
import React, { useState, useEffect, useRef } from 'react';
import './sidebarFilters.css';

const FilterSidebar = ({ onFiltersChange, activeFilters = {} }) => {
  const [categories, setCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const sidebarRef = useRef(null);

  // Cargar categorías al montar el componente
  useEffect(() => {
    fetchCategories();
  }, []);

  // Enhanced scroll behavior for floating sidebar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate scroll progress (0 to 1)
      const maxScroll = documentHeight - windowHeight;
      const progress = Math.min(scrollTop / maxScroll, 1);
      setScrollProgress(progress);
      
      // Enhanced visibility logic
      const shouldBeVisible = scrollTop > 50; // Show after scrolling past header
      setIsVisible(shouldBeVisible);
      
      // Apply dynamic positioning based on scroll
      if (sidebarRef.current) {
        const sidebar = sidebarRef.current;
        const opacity = shouldBeVisible ? 1 : 0.7;
        const scale = shouldBeVisible ? 1 : 0.95;
        const translateY = shouldBeVisible ? 0 : 10;
        
        sidebar.style.opacity = opacity;
        sidebar.style.transform = `translateY(${translateY}px) scale(${scale})`;
        
        // Dynamic blur and shadow based on scroll speed
        const scrollSpeed = Math.abs(scrollTop - (sidebar.dataset.lastScroll || 0));
        sidebar.dataset.lastScroll = scrollTop;
        
        if (scrollSpeed > 5) {
          sidebar.style.backdropFilter = 'blur(25px)';
          sidebar.style.webkitBackdropFilter = 'blur(25px)';
        } else {
          sidebar.style.backdropFilter = 'blur(20px)';
          sidebar.style.webkitBackdropFilter = 'blur(20px)';
        }
      }
    };
    
    // Throttled scroll handler for better performance
    let ticking = false;
    const throttledScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', throttledScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => {
      window.removeEventListener('scroll', throttledScroll);
    };
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Cargando categorías...');
      
      const response = await fetch('/api/categories', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Respuesta completa de categorías:', data);
      
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
    <aside 
      ref={sidebarRef}
      className={`filter-sidebar ${isVisible ? 'visible' : 'hidden'}`}
      style={{
        '--scroll-progress': scrollProgress,
      }}
    >
      <div className="filter-header">
        <h3 className="filter-title">Filtros</h3>
        {Object.keys(activeFilters).length > 0 && (
          <button onClick={clearAllFilters} className="clear-filters-btn">
            Limpiar
          </button>
        )}
      </div>
      
      {/* Scroll progress indicator */}
      <div className="scroll-progress-indicator">
        <div 
          className="scroll-progress-bar" 
          style={{ width: `${scrollProgress * 100}%` }}
        />
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