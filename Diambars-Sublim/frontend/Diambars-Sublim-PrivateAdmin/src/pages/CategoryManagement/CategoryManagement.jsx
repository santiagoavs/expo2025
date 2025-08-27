import React, { useState, useRef } from 'react';
import Swal from 'sweetalert2';
import useCategories from '../../hooks/useCategories';
import Navbar from '../../components/NavBar/NavBar';
import './CategoryManagement.css';

// Componentes de iconos usando Lucide React (más moderno que emojis)
const PlusIcon = () => <span className="category-icon">+</span>;
const SearchIcon = () => <span className="category-icon">🔍</span>;
const EditIcon = () => <span className="category-icon">✏️</span>;
const TrashIcon = () => <span className="category-icon">🗑️</span>;
const EyeIcon = () => <span className="category-icon">👁️</span>;
const EyeSlashIcon = () => <span className="category-icon">🚫</span>;
const FolderOpenIcon = () => <span className="category-icon">📂</span>;
const ImageIcon = () => <span className="category-icon">🖼️</span>;
const FilterIcon = () => <span className="category-icon">⚙️</span>;   
const XIcon = () => <span className="category-icon">✕</span>;
const CaretDownIcon = () => <span className="category-icon">▼</span>;
const CaretRightIcon = () => <span className="category-icon">▶</span>;
const TreeIcon = () => <span className="category-icon">🌳</span>;
const FolderIcon = () => <span className="category-icon">📁</span>;
const GridIcon = () => <span className="category-icon">⊞</span>;
const ListIcon = () => <span className="category-icon">☰</span>;

const CategoryManagement = () => {
  const {
    categories,
    categoryTree,
    flatCategories,
    loading,
    error,
    removeCategory,
    createCategory,
    updateCategory
  } = useCategories();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent: '',
    image: null,
    isActive: true,
    showOnHomepage: false,
    order: 0
  });
  const [filterActive, setFilterActive] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [expandedCategories, setExpandedCategories] = useState({});
  const fileInputRef = useRef(null);

  // Datos fallback para demostración
  const fallbackCategories = [
    {
      _id: 'cat1',
      name: 'Textiles',
      description: 'Productos textiles personalizados para sublimación',
      isActive: true,
      showOnHomepage: true,
      order: 1,
      createdAt: '2024-01-15',
      image: null,
      children: [
        {
          _id: 'cat1a',
          name: 'Camisetas',
          description: 'Camisetas sublimadas de alta calidad',
          isActive: true,
          parent: { _id: 'cat1' },
          order: 1,
          image: null
        },
        {
          _id: 'cat1b',
          name: 'Polos',
          description: 'Polos personalizados para empresas',
          isActive: true,
          parent: { _id: 'cat1' },
          order: 2,
          image: null
        }
      ]
    },
    {
      _id: 'cat2',
      name: 'Accesorios',
      description: 'Accesorios personalizados para complementar tu look',
      isActive: true,
      showOnHomepage: false,
      order: 2,
      createdAt: '2024-01-16',
      image: null,
      children: [
        {
          _id: 'cat2a',
          name: 'Gorras',
          description: 'Gorras con diseños únicos',
          isActive: true,
          parent: { _id: 'cat2' },
          order: 1,
          image: null
        }
      ]
    },
    {
      _id: 'cat3',
      name: 'Hogar',
      description: 'Artículos para el hogar personalizados',
      isActive: false,
      showOnHomepage: false,
      order: 3,
      createdAt: '2024-01-17',
      image: null,
      children: []
    }
  ];

  // Usar datos fallback si no hay datos del hook
  const displayCategories = flatCategories.length > 0 ? flatCategories : fallbackCategories.flatMap(cat => [cat, ...cat.children]);
  const displayCategoryTree = categoryTree.length > 0 ? categoryTree : fallbackCategories;

  // Filtrar y buscar categorías
  const filteredCategories = displayCategories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (category.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && category.isActive) ||
                         (filterActive === 'inactive' && !category.isActive);
    
    return matchesSearch && matchesFilter;
  });

  // Ordenar categorías
  const sortedCategories = [...filteredCategories].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'order':
        return (a.order || 0) - (b.order || 0);
      case 'created':
        return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
      default:
        return 0;
    }
  });

  const handleOpenModal = (category = null) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        parent: category.parent?._id || '',
        image: null,
        isActive: category.isActive,
        showOnHomepage: category.showOnHomepage || false,
        order: category.order || 0
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: '',
        description: '',
        parent: '',
        image: null,
        isActive: true,
        showOnHomepage: false,
        order: 0
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      parent: '',
      image: null,
      isActive: true,
      showOnHomepage: false,
      order: 0
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({
      ...prev,
      image: file
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('parent', formData.parent);
    submitData.append('isActive', formData.isActive);
    submitData.append('showOnHomepage', formData.showOnHomepage);
    submitData.append('order', formData.order);
    
    if (formData.image) {
      submitData.append('image', formData.image);
    }

    try {
      if (selectedCategory) {
        await updateCategory(selectedCategory._id, submitData);
      } else {
        await createCategory(submitData);
      }
      
      await Swal.fire({
        title: '¡Éxito!',
        text: `Categoría ${selectedCategory ? 'actualizada' : 'creada'} correctamente`,
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#1F64BF',
        background: '#ffffff',
        color: '#010326',
        timer: 2000,
        showConfirmButton: false,
        position: 'top-end',
        toast: true
      });
      
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      
      await Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error al guardar la categoría',
        icon: 'error',
        confirmButtonText: 'Intentar de nuevo',
        confirmButtonColor: '#EF4444',
        background: '#ffffff',
        color: '#010326'
      });
    }
  };

  const handleDelete = async (categoryId) => {
    const result = await Swal.fire({
      title: '¿Eliminar categoría?',
      text: 'Esta acción no se puede deshacer. Todas las subcategorías también serán eliminadas.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      background: '#ffffff',
      color: '#010326',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await removeCategory(categoryId);
        
        await Swal.fire({
          title: '¡Eliminada!',
          text: 'La categoría ha sido eliminada exitosamente',
          icon: 'success',
          confirmButtonColor: '#10B981',
          background: '#ffffff',
          color: '#010326',
          timer: 2000,
          showConfirmButton: false,
          position: 'top-end',
          toast: true
        });
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
        
        await Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la categoría. Puede tener productos asociados.',
          icon: 'error',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#EF4444',
          background: '#ffffff',
          color: '#010326'
        });
      }
    }
  };

  const getParentName = (parentId) => {
    if (!parentId) return 'Categoría Principal';
    const parent = displayCategories.find(cat => cat._id === parentId);
    return parent ? parent.name : 'Desconocido';
  };

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const renderGridView = () => {
    return (
      <div className="category-grid">
        {sortedCategories.map((category) => (
          <div key={category._id} className="category-card">
            <div className="category-card__image">
              {category.image ? (
                <img 
                  src={category.image} 
                  alt={category.name}
                  className="category-card__img"
                />
              ) : (
                <div className="category-card__placeholder">
                  <ImageIcon />
                </div>
              )}
              
              <div className="category-card__badges">
                {category.showOnHomepage && (
                  <span className="category-badge category-badge--homepage">★</span>
                )}
                <span className={`category-badge ${category.isActive ? 'category-badge--active' : 'category-badge--inactive'}`}>
                  {category.isActive ? <EyeIcon /> : <EyeSlashIcon />}
                </span>
              </div>
            </div>

            <div className="category-card__content">
              <div className="category-card__header">
                <h3 className="category-card__title">{category.name}</h3>
                <span className="category-card__parent">{getParentName(category.parent?._id)}</span>
              </div>
              
              {category.description && (
                <p className="category-card__description">{category.description}</p>
              )}

              <div className="category-card__meta">
                <span className="category-card__order">Orden: {category.order || 0}</span>
                <span className="category-card__date">
                  {new Date(category.createdAt || Date.now()).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="category-card__actions">
              <button
                className="category-action-btn category-action-btn--edit"
                onClick={() => handleOpenModal(category)}
                title="Editar categoría"
              >
                <EditIcon />
              </button>
              <button
                className="category-action-btn category-action-btn--delete"
                onClick={() => handleDelete(category._id)}
                title="Eliminar categoría"
              >
                <TrashIcon />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTreeView = () => {
    const rootCategories = displayCategoryTree.filter(cat => !cat.parent);
    
    const renderCategory = (category, depth = 0) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories[category._id];
      const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (category.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterActive === 'all' || 
                           (filterActive === 'active' && category.isActive) ||
                           (filterActive === 'inactive' && !category.isActive);

      if (!matchesSearch || !matchesFilter) return null;

      return (
        <div key={category._id} className="tree-item">
          <div 
            className={`tree-node tree-node--depth-${depth}`}
            style={{ paddingLeft: `${depth * 24}px` }}
          >
            <div className="tree-toggle">
              {hasChildren ? (
                <button
                  className="tree-expand-btn"
                  onClick={() => toggleExpand(category._id)}
                >
                  {isExpanded ? <CaretDownIcon /> : <CaretRightIcon />}
                </button>
              ) : (
                <span className="tree-leaf"></span>
              )}
            </div>

            <div className="tree-content">
              <div className="tree-info">
                <div className="tree-icon">
                  {depth === 0 ? <FolderOpenIcon /> : <FolderIcon />}
                </div>
                
                <div className="tree-details">
                  <div className="tree-name">
                    {category.name}
                    <span className="tree-level">
                      {depth === 0 ? '(Principal)' : '(Subcategoría)'}
                    </span>
                  </div>
                  {category.description && (
                    <div className="tree-desc">{category.description}</div>
                  )}
                </div>
              </div>

              <div className="tree-image">
                {category.image ? (
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="tree-img"
                  />
                ) : (
                  <div className="tree-no-img">
                    <ImageIcon />
                  </div>
                )}
              </div>

              <div className="tree-meta">
                <span className={`tree-status ${category.isActive ? 'tree-status--active' : 'tree-status--inactive'}`}>
                  {category.isActive ? <EyeIcon /> : <EyeSlashIcon />}
                </span>
                
                {category.showOnHomepage && (
                  <span className="tree-homepage" title="Mostrar en homepage">★</span>
                )}
              </div>

              <div className="tree-actions">
                <button
                  className="tree-action-btn tree-action-btn--edit"
                  onClick={() => handleOpenModal(category)}
                  title="Editar"
                >
                  <EditIcon />
                </button>
                <button
                  className="tree-action-btn tree-action-btn--delete"
                  onClick={() => handleDelete(category._id)}
                  title="Eliminar"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="tree-children">
              {category.children.map(child => renderCategory(child, depth + 1))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="tree-view">
        {rootCategories.length > 0 ? (
          rootCategories.map(category => renderCategory(category))
        ) : (
          <div className="empty-state">
            <TreeIcon />
            <p>No hay categorías para mostrar</p>
            <button 
              className="empty-action-btn"
              onClick={() => handleOpenModal()}
            >
              <PlusIcon />
              Crear primera categoría
            </button>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="category-page">

        <div className="category-loading">
          <div className="category-spinner"></div>
          <p>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-page">
        <div className="category-error">
          <div className="category-error__icon">❌</div>
          <h2>Error al cargar categorías</h2>
          <p>{error}</p>
          <button 
            className="category-retry-btn"
            onClick={() => window.location.reload()}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="category-page">
      
      <div className="category-container">
        <div className="category-content">
          {/* Header */}
          <div className="category-header">
            <div className="category-header__title">
              <div className="category-header__icon">
                <FolderOpenIcon />
              </div>
              <div className="category-header__text">
                <h1>Gestión de Categorías</h1>
                <p>Organiza y administra la estructura completa de tu catálogo</p>
              </div>
            </div>
            <button 
              className="category-add-btn"
              onClick={() => handleOpenModal()}
            >
              <PlusIcon />
              <span>Nueva Categoría</span>
            </button>
          </div>

          {/* Filters */}
          <div className="category-filters">
            <div className="category-search">
              <SearchIcon />
              <input
                type="text"
                placeholder="Buscar categorías por nombre o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="category-search__input"
              />
            </div>

            <div className="category-controls">
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="category-select"
              >
                <option value="all">📋 Todas las categorías</option>
                <option value="active">✅ Solo activas</option>
                <option value="inactive">❌ Solo inactivas</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="category-select"
              >
                <option value="name">🔤 Ordenar por nombre</option>
                <option value="order">🔢 Ordenar por orden</option>
                <option value="created">📅 Ordenar por fecha</option>
              </select>

              <div className="category-view-toggle">
                <button
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'view-toggle-btn--active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Vista en cuadrícula"
                >
                  <GridIcon />
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === 'tree' ? 'view-toggle-btn--active' : ''}`}
                  onClick={() => setViewMode('tree')}
                  title="Vista de árbol"
                >
                  <TreeIcon />
                </button>
                <button
                  className={`view-toggle-btn ${viewMode === 'list' ? 'view-toggle-btn--active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Vista de lista"
                >
                  <ListIcon />
                </button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="category-stats">
            <div className="stat-card stat-card--total">
              <div className="stat-card__icon">📊</div>
              <div className="stat-card__content">
                <span className="stat-card__number">{displayCategories.length}</span>
                <span className="stat-card__label">Total de categorías</span>
              </div>
            </div>
            <div className="stat-card stat-card--active">
              <div className="stat-card__icon">✅</div>
              <div className="stat-card__content">
                <span className="stat-card__number">
                  {displayCategories.filter(cat => cat.isActive).length}
                </span>
                <span className="stat-card__label">Categorías activas</span>
              </div>
            </div>
            <div className="stat-card stat-card--main">
              <div className="stat-card__icon">🏠</div>
              <div className="stat-card__content">
                <span className="stat-card__number">
                  {displayCategories.filter(cat => !cat.parent).length}
                </span>
                <span className="stat-card__label">Categorías principales</span>
              </div>
            </div>
            <div className="stat-card stat-card--sub">
              <div className="stat-card__icon">📁</div>
              <div className="stat-card__content">
                <span className="stat-card__number">
                  {displayCategories.filter(cat => cat.parent).length}
                </span>
                <span className="stat-card__label">Subcategorías</span>
              </div>
            </div>
            <div className="stat-card stat-card--homepage">
              <div className="stat-card__icon">⭐</div>
              <div className="stat-card__content">
                <span className="stat-card__number">
                  {displayCategories.filter(cat => cat.showOnHomepage).length}
                </span>
                <span className="stat-card__label">En página principal</span>
              </div>
            </div>
          </div>

          {/* Vista condicional */}
          <div className="category-view">
            {viewMode === 'grid' && renderGridView()}
            {viewMode === 'tree' && renderTreeView()}
            {viewMode === 'list' && (
              <div className="category-table">
                <div className="table-header">
                  <div className="table-cell">Imagen</div>
                  <div className="table-cell">Nombre</div>
                  <div className="table-cell">Categoría Padre</div>
                  <div className="table-cell">Estado</div>
                  <div className="table-cell">Homepage</div>
                  <div className="table-cell">Orden</div>
                  <div className="table-cell">Acciones</div>
                </div>
                <div className="table-body">
                  {sortedCategories.map((category) => (
                    <div key={category._id} className="table-row">
                      <div className="table-cell">
                        {category.image ? (
                          <img 
                            src={category.image} 
                            alt={category.name}
                            className="table-image"
                          />
                        ) : (
                          <div className="table-no-image">
                            <ImageIcon />
                          </div>
                        )}
                      </div>
                      <div className="table-cell">
                        <div>
                          <span className="table-name">{category.name}</span>
                          {category.description && (
                            <p className="table-desc">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="table-cell">{getParentName(category.parent?._id)}</div>
                      <div className="table-cell">
                        <span className={`table-status ${category.isActive ? 'table-status--active' : 'table-status--inactive'}`}>
                          {category.isActive ? (
                            <>
                              <EyeIcon />
                              Activa
                            </>
                          ) : (
                            <>
                              <EyeSlashIcon />
                              Inactiva
                            </>
                          )}
                        </span>
                      </div>
                      <div className="table-cell">
                        <span className={`table-homepage ${category.showOnHomepage ? 'table-homepage--yes' : 'table-homepage--no'}`}>
                          {category.showOnHomepage ? 'Sí ⭐' : 'No'}
                        </span>
                      </div>
                      <div className="table-cell">{category.order || 0}</div>
                      <div className="table-cell">
                        <div className="table-actions">
                          <button
                            className="table-action-btn table-action-btn--edit"
                            onClick={() => handleOpenModal(category)}
                            title="Editar"
                          >
                            <EditIcon />
                          </button>
                          <button
                            className="table-action-btn table-action-btn--delete"
                            onClick={() => handleDelete(category._id)}
                            title="Eliminar"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {sortedCategories.length === 0 && (
              <div className="empty-state">
                <div className="empty-state__icon">
                  <SearchIcon />
                </div>
                <h3>No se encontraron categorías</h3>
                <p>Intenta cambiar los filtros de búsqueda o crear una nueva categoría.</p>
                <button 
                  className="empty-action-btn"
                  onClick={() => {
                    setSearchQuery('');
                    setFilterActive('all');
                  }}
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>

          {/* Modal */}
          {showModal && (
            <div className="category-modal-overlay" onClick={handleCloseModal}>
              <div className="category-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <div className="modal-title">
                    <div className="modal-title__icon">
                      {selectedCategory ? <EditIcon /> : <PlusIcon />}
                    </div>
                    <h2>{selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                  </div>
                  <button
                    className="modal-close-btn"
                    onClick={handleCloseModal}
                  >
                    <XIcon />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-form">
                  <div className="form-row">
                    <div className="form-group form-group--full">
                      <label htmlFor="name" className="form-label">
                        Nombre de la categoría *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="form-input"
                        placeholder="Ej: Camisetas, Accesorios, etc."
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group form-group--full">
                      <label htmlFor="description" className="form-label">
                        Descripción
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="form-textarea"
                        rows="3"
                        placeholder="Describe brevemente esta categoría..."
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="parent" className="form-label">
                        Categoría padre
                      </label>
                      <select
                        id="parent"
                        name="parent"
                        value={formData.parent}
                        onChange={handleInputChange}
                        className="form-select"
                      >
                        <option value="">Sin padre (Categoría Principal)</option>
                        {displayCategories
                          .filter(cat => cat._id !== selectedCategory?._id && !cat.parent)
                          .map(cat => (
                            <option key={cat._id} value={cat._id}>
                              {cat.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="order" className="form-label">
                        Orden de visualización
                      </label>
                      <input
                        type="number"
                        id="order"
                        name="order"
                        value={formData.order}
                        onChange={handleInputChange}
                        min="0"
                        className="form-input"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group form-group--full">
                      <label htmlFor="image" className="form-label">
                        Imagen de la categoría {!selectedCategory && '*'}
                      </label>
                      <div className="file-upload-area">
                        <input
                          type="file"
                          id="image"
                          ref={fileInputRef}
                          onChange={handleImageChange}
                          accept="image/*"
                          className="file-input"
                          required={!selectedCategory}
                        />
                        <div className="file-upload-content">
                          <ImageIcon />
                          <p>
                            <span>Haz clic para subir</span> o arrastra y suelta
                          </p>
                          <small>PNG, JPG, GIF hasta 5MB</small>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          id="isActive"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="isActive" className="checkbox-label">
                          <span className="checkbox-icon">
                            {formData.isActive ? '✅' : '⬜'}
                          </span>
                          Categoría activa
                        </label>
                      </div>
                    </div>

                    <div className="form-group">
                      <div className="checkbox-group">
                        <input
                          type="checkbox"
                          id="showOnHomepage"
                          name="showOnHomepage"
                          checked={formData.showOnHomepage}
                          onChange={handleInputChange}
                          className="form-checkbox"
                        />
                        <label htmlFor="showOnHomepage" className="checkbox-label">
                          <span className="checkbox-icon">
                            {formData.showOnHomepage ? '⭐' : '⬜'}
                          </span>
                          Mostrar en página principal
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="modal-btn modal-btn--cancel"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="modal-btn modal-btn--primary"
                    >
                      {selectedCategory ? '✏️ Actualizar' : '➕ Crear'} Categoría
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;