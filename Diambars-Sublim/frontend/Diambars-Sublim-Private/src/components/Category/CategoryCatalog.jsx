import React, { useState, useRef } from 'react';
import { 
  Plus, 
  MagnifyingGlass, 
  PencilSimple, 
  Trash, 
  Eye, 
  EyeSlash,
  FolderOpen,
  Image as ImageIcon,
  SortAscending,
  Funnel,
  X,
  CaretDown,
  CaretRight,
  TreeStructure,
  FolderSimple
} from '@phosphor-icons/react';
import useCategories from '../hooks/useCategories';
import Navbar from '../navbar/Navbar';
import './CategoryManagement.css';

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
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'table'
  const [expandedCategories, setExpandedCategories] = useState({});
  const fileInputRef = useRef(null);

  // Filtrar y buscar categorías
  const filteredCategories = flatCategories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         category.description.toLowerCase().includes(searchQuery.toLowerCase());
    
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
        return a.order - b.order;
      case 'created':
        return new Date(b.createdAt) - new Date(a.createdAt);
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
      handleCloseModal();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      try {
        await removeCategory(categoryId);
      } catch (error) {
        console.error('Error al eliminar categoría:', error);
      }
    }
  };

  const getParentName = (parentId) => {
    if (!parentId) return 'Raíz';
    const parent = flatCategories.find(cat => cat._id === parentId);
    return parent ? parent.name : 'Desconocido';
  };

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const renderTreeView = () => {
    const rootCategories = categoryTree.filter(cat => !cat.parent);
    
    const renderCategory = (category, depth = 0) => {
      const hasChildren = category.children && category.children.length > 0;
      const isExpanded = expandedCategories[category._id];
      const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           category.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterActive === 'all' || 
                           (filterActive === 'active' && category.isActive) ||
                           (filterActive === 'inactive' && !category.isActive);

      if (!matchesSearch || !matchesFilter) return null;

      return (
        <div key={category._id} className="categoryPage__treeItem">
          <div 
            className={`categoryPage__treeNode categoryPage__treeNode--depth-${depth}`}
            style={{ marginLeft: `${depth * 24}px` }}
          >
            <div className="categoryPage__treeToggle">
              {hasChildren ? (
                <button
                  className="categoryPage__expandButton"
                  onClick={() => toggleExpand(category._id)}
                >
                  {isExpanded ? <CaretDown size={16} /> : <CaretRight size={16} />}
                </button>
              ) : (
                <span className="categoryPage__leafIndicator"></span>
              )}
            </div>

            <div className="categoryPage__treeContent">
              <div className="categoryPage__treeInfo">
                <div className="categoryPage__treeIcon">
                  {depth === 0 ? (
                    <FolderOpen size={20} weight="fill" />
                  ) : (
                    <FolderSimple size={18} weight="regular" />
                  )}
                </div>
                
                <div className="categoryPage__treeDetails">
                  <div className="categoryPage__treeName">
                    {category.name}
                    <span className="categoryPage__treeLevel">
                      {depth === 0 ? '(Padre)' : '(Hijo)'}
                    </span>
                  </div>
                  {category.description && (
                    <div className="categoryPage__treeDesc">{category.description}</div>
                  )}
                </div>
              </div>

              <div className="categoryPage__treeImage">
                {category.image ? (
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="categoryPage__treeImg"
                  />
                ) : (
                  <div className="categoryPage__treeNoImg">
                    <ImageIcon size={16} />
                  </div>
                )}
              </div>

              <div className="categoryPage__treeMeta">
                <span className={`categoryPage__treeStatus ${category.isActive ? 'categoryPage__treeStatus--active' : 'categoryPage__treeStatus--inactive'}`}>
                  {category.isActive ? <Eye size={14} /> : <EyeSlash size={14} />}
                </span>
                
                {category.showOnHomepage && (
                  <span className="categoryPage__treeHomepage" title="Mostrar en homepage">★</span>
                )}
              </div>

              <div className="categoryPage__treeActions">
                <button
                  className="categoryPage__treeActionBtn categoryPage__treeActionBtn--edit"
                  onClick={() => handleOpenModal(category)}
                  title="Editar"
                >
                  <PencilSimple size={14} />
                </button>
                <button
                  className="categoryPage__treeActionBtn categoryPage__treeActionBtn--delete"
                  onClick={() => handleDelete(category._id)}
                  title="Eliminar"
                >
                  <Trash size={14} />
                </button>
              </div>
            </div>
          </div>

          {hasChildren && isExpanded && (
            <div className="categoryPage__treeChildren">
              {category.children.map(child => renderCategory(child, depth + 1))}
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="categoryPage__treeView">
        {rootCategories.length > 0 ? (
          rootCategories.map(category => renderCategory(category))
        ) : (
          <div className="categoryPage__empty">
            <TreeStructure size={64} />
            <p>No hay categorías para mostrar</p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="categoryPage">
        <div className="categoryPage__loading">
          <div className="categoryPage__spinner"></div>
          <p>Cargando categorías...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categoryPage">
        <div className="categoryPage__error">
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="categoryPage">
      <Navbar />
      
      <div className="categoryPage__container">
        <div className="categoryPage__content">
          <div className="categoryPage__header">
            <div className="categoryPage__headerTitle">
              <FolderOpen size={32} weight="bold" />
              <div>
                <h1>Gestión de Categorías</h1>
                <p className="categoryPage__subtitle">Organiza y administra la estructura de tu catálogo</p>
              </div>
            </div>
            <button 
              className="categoryPage__addButton"
              onClick={() => handleOpenModal()}
            >
              <Plus size={20} weight="bold" />
              Nueva Categoría
            </button>
          </div>

          <div className="categoryPage__filters">
            <div className="categoryPage__searchContainer">
              <MagnifyingGlass size={20} />
              <input
                type="text"
                placeholder="Buscar categorías..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="categoryPage__searchInput"
              />
            </div>

            <div className="categoryPage__filterControls">
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="categoryPage__select"
              >
                <option value="all">Todas</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="categoryPage__select"
              >
                <option value="name">Ordenar por Nombre</option>
                <option value="order">Ordenar por Orden</option>
                <option value="created">Ordenar por Fecha</option>
              </select>

              <div className="categoryPage__viewToggle">
                <button
                  className={`categoryPage__viewBtn ${viewMode === 'tree' ? 'categoryPage__viewBtn--active' : ''}`}
                  onClick={() => setViewMode('tree')}
                  title="Vista de árbol"
                >
                  <TreeStructure size={18} />
                </button>
                <button
                  className={`categoryPage__viewBtn ${viewMode === 'table' ? 'categoryPage__viewBtn--active' : ''}`}
                  onClick={() => setViewMode('table')}
                  title="Vista de tabla"
                >
                  <Funnel size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="categoryPage__stats">
            <div className="categoryPage__stat">
              <span className="categoryPage__statNumber">{flatCategories.length}</span>
              <span className="categoryPage__statLabel">Total</span>
            </div>
            <div className="categoryPage__stat">
              <span className="categoryPage__statNumber">
                {flatCategories.filter(cat => cat.isActive).length}
              </span>
              <span className="categoryPage__statLabel">Activas</span>
            </div>
            <div className="categoryPage__stat">
              <span className="categoryPage__statNumber">
                {flatCategories.filter(cat => !cat.parent).length}
              </span>
              <span className="categoryPage__statLabel">Principales</span>
            </div>
            <div className="categoryPage__stat">
              <span className="categoryPage__statNumber">
                {flatCategories.filter(cat => cat.parent).length}
              </span>
              <span className="categoryPage__statLabel">Subcategorías</span>
            </div>
          </div>

          {/* Vista condicional - Árbol o Tabla */}
          {viewMode === 'tree' ? (
            renderTreeView()
          ) : (
            <div className="categoryPage__table">
              <div className="categoryPage__tableHeader">
                <div className="categoryPage__tableCell categoryPage__tableCell--image">Imagen</div>
                <div className="categoryPage__tableCell categoryPage__tableCell--name">Nombre</div>
                <div className="categoryPage__tableCell categoryPage__tableCell--parent">Padre</div>
                <div className="categoryPage__tableCell categoryPage__tableCell--status">Estado</div>
                <div className="categoryPage__tableCell categoryPage__tableCell--homepage">Homepage</div>
                <div className="categoryPage__tableCell categoryPage__tableCell--order">Orden</div>
                <div className="categoryPage__tableCell categoryPage__tableCell--actions">Acciones</div>
              </div>

              <div className="categoryPage__tableBody">
                {sortedCategories.map((category) => (
                  <div key={category._id} className="categoryPage__tableRow">
                    <div className="categoryPage__tableCell categoryPage__tableCell--image">
                      {category.image ? (
                        <img 
                          src={category.image} 
                          alt={category.name}
                          className="categoryPage__categoryImage"
                        />
                      ) : (
                        <div className="categoryPage__noImage">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>
                    
                    <div className="categoryPage__tableCell categoryPage__tableCell--name">
                      <div>
                        <span className="categoryPage__categoryName">{category.name}</span>
                        {category.description && (
                          <p className="categoryPage__categoryDesc">{category.description}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="categoryPage__tableCell categoryPage__tableCell--parent">
                      {getParentName(category.parent?._id)}
                    </div>
                    
                    <div className="categoryPage__tableCell categoryPage__tableCell--status">
                      <span className={`categoryPage__status ${category.isActive ? 'categoryPage__status--active' : 'categoryPage__status--inactive'}`}>
                        {category.isActive ? (
                          <>
                            <Eye size={16} />
                            Activa
                          </>
                        ) : (
                          <>
                            <EyeSlash size={16} />
                            Inactiva
                          </>
                        )}
                      </span>
                    </div>
                    
                    <div className="categoryPage__tableCell categoryPage__tableCell--homepage">
                      <span className={`categoryPage__homepage ${category.showOnHomepage ? 'categoryPage__homepage--yes' : 'categoryPage__homepage--no'}`}>
                        {category.showOnHomepage ? 'Sí' : 'No'}
                      </span>
                    </div>
                    
                    <div className="categoryPage__tableCell categoryPage__tableCell--order">
                      {category.order}
                    </div>
                    
                    <div className="categoryPage__tableCell categoryPage__tableCell--actions">
                      <button
                        className="categoryPage__actionButton categoryPage__actionButton--edit"
                        onClick={() => handleOpenModal(category)}
                        title="Editar"
                      >
                        <PencilSimple size={16} />
                      </button>
                      <button
                        className="categoryPage__actionButton categoryPage__actionButton--delete"
                        onClick={() => handleDelete(category._id)}
                        title="Eliminar"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {sortedCategories.length === 0 && viewMode === 'table' && (
            <div className="categoryPage__empty">
              <FolderOpen size={64} />
              <p>No se encontraron categorías</p>
            </div>
          )}

          {showModal && (
            <div className="categoryPage__modal">
              <div className="categoryPage__modalContent">
                <div className="categoryPage__modalHeader">
                  <h2>{selectedCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
                  <button
                    className="categoryPage__closeButton"
                    onClick={handleCloseModal}
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="categoryPage__form">
                  <div className="categoryPage__formGroup">
                    <label htmlFor="name">Nombre *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="categoryPage__input"
                    />
                  </div>

                  <div className="categoryPage__formGroup">
                    <label htmlFor="description">Descripción</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      className="categoryPage__textarea"
                      rows="3"
                    />
                  </div>

                  <div className="categoryPage__formGroup">
                    <label htmlFor="parent">Categoría Padre</label>
                    <select
                      id="parent"
                      name="parent"
                      value={formData.parent}
                      onChange={handleInputChange}
                      className="categoryPage__select"
                    >
                      <option value="">Sin padre (Categoría Principal)</option>
                      {flatCategories
                        .filter(cat => cat._id !== selectedCategory?._id)
                        .map(cat => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="categoryPage__formGroup">
                    <label htmlFor="image">Imagen {!selectedCategory && '*'}</label>
                    <input
                      type="file"
                      id="image"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      className="categoryPage__fileInput"
                      required={!selectedCategory}
                    />
                  </div>

                  <div className="categoryPage__formGroup">
                    <label htmlFor="order">Orden</label>
                    <input
                      type="number"
                      id="order"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      min="0"
                      className="categoryPage__input"
                    />
                  </div>

                  <div className="categoryPage__formRow">
                    <div className="categoryPage__checkboxGroup">
                      <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleInputChange}
                        className="categoryPage__checkbox"
                      />
                      <label htmlFor="isActive">Categoría activa</label>
                    </div>

                    <div className="categoryPage__checkboxGroup">
                      <input
                        type="checkbox"
                        id="showOnHomepage"
                        name="showOnHomepage"
                        checked={formData.showOnHomepage}
                        onChange={handleInputChange}
                        className="categoryPage__checkbox"
                      />
                      <label htmlFor="showOnHomepage">Mostrar en homepage</label>
                    </div>
                  </div>

                  <div className="categoryPage__formActions">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="categoryPage__cancelButton"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="categoryPage__submitButton"
                    >
                      {selectedCategory ? 'Actualizar' : 'Crear'} Categoría
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