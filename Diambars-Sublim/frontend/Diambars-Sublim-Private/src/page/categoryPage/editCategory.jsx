import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CategoryContext } from '../../context/categoryContext';
import '../../components/newCategory/newCategory.css'; // Reutilizamos los mismos estilos

const EditCategory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    currentCategory,
    fetchCategoryById,
    updateCategory,
    flatCategories
  } = useContext(CategoryContext);
  
  const [formData, setFormData] = useState({
    name: '',
    parent: '',
    description: '',
    isActive: true,
    showOnHomepage: false,
    image: null,
    imagePreview: '',
    currentImage: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Cargar datos de la categoría al montar
  useEffect(() => {
    const loadCategoryData = async () => {
      try {
        await fetchCategoryById(id);
      } catch (err) {
        setError(err.message);
      }
    };
    
    loadCategoryData();
  }, [id, fetchCategoryById]);

  // Actualizar el formulario cuando currentCategory cambie
  useEffect(() => {
    if (currentCategory) {
      setFormData({
        name: currentCategory.name,
        parent: currentCategory.parent?._id || '',
        description: currentCategory.description || '',
        isActive: currentCategory.isActive,
        showOnHomepage: currentCategory.showOnHomepage,
        image: null,
        imagePreview: '',
        currentImage: currentCategory.image
      });
    }
  }, [currentCategory]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)');
        return;
      }
      
      // Validar tamaño de archivo (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('La imagen no debe exceder los 5MB');
        return;
      }

      setFormData(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
        error: null
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    setSuccess(false);

    try {
      // Validaciones frontend
      if (!formData.name.trim()) {
        throw new Error('El nombre de la categoría es obligatorio');
      }

      // Crear FormData
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      
      if (formData.parent) {
        formDataToSend.append('parent', formData.parent);
      } else {
        formDataToSend.append('parent', '');
      }
      
      formDataToSend.append('isActive', formData.isActive);
      formDataToSend.append('showOnHomepage', formData.showOnHomepage);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      await updateCategory(id, formDataToSend);
      setSuccess(true);
      setTimeout(() => navigate('/category'), 2000);
    } catch (err) {
      setError(err.message);
      console.error('Error updating category:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const parentCategories = flatCategories.filter(cat => !cat.parent || cat._id === id);

  return (
    <div className="new-category-wrapper">
      <div className="new-category-header">
        <h2>Editar Categoría</h2>
        <button 
          onClick={() => navigate('/category')}
          className="back-btn"
        >
          Volver al listado
        </button>
      </div>

      <form onSubmit={handleSubmit} className="new-category-body">
        <div className="new-category-form">
          <div className="form-group">
            <label>
              NOMBRE DE CATEGORÍA *
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <div className="form-group">
            <label>
              CATEGORÍA PADRE (opcional)
              <select
                name="parent"
                value={formData.parent}
                onChange={handleChange}
              >
                <option value="">Ninguna (categoría principal)</option>
                {parentCategories.map(cat => (
                  <option 
                    key={cat._id} 
                    value={cat._id} 
                    disabled={cat._id === id}
                  >
                    {cat.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-group">
            <label>
              DESCRIPCIÓN
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              />
            </label>
          </div>

          <div className="form-group switches">
            <label className="switch">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <span className="slider"></span>
              <span className="switch-label">Categoría activa</span>
            </label>

            <label className="switch">
              <input
                type="checkbox"
                name="showOnHomepage"
                checked={formData.showOnHomepage}
                onChange={handleChange}
              />
              <span className="slider"></span>
              <span className="switch-label">Mostrar en página principal</span>
            </label>
          </div>
        </div>

        <div className="new-category-visual">
          <div className="image-section">
            <div className="image-preview-box">
              {formData.imagePreview ? (
                <img src={formData.imagePreview} alt="Vista previa" />
              ) : formData.currentImage ? (
                <img src={formData.currentImage} alt="Imagen actual" />
              ) : (
                <div className="image-placeholder">
                  <span>Sin imagen</span>
                </div>
              )}
            </div>
            <label className="image-upload-btn">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              Cambiar imagen
            </label>
          </div>

          <div className="preview-section">
            <h3>VISTA PREVIA</h3>
            <div className="preview-content">
              <p className="preview-parent">
                {formData.parent ? 
                  `Subcategoría de ${parentCategories.find(c => c._id === formData.parent)?.name || '...'}` : 
                  'Categoría principal'}
              </p>
              <div className="preview-image-box">
                {formData.imagePreview ? (
                  <img src={formData.imagePreview} alt="Vista previa" />
                ) : formData.currentImage ? (
                  <img src={formData.currentImage} alt="Imagen actual" />
                ) : (
                  <div className="image-placeholder">Imagen</div>
                )}
              </div>
              <p className="preview-name">{formData.name || 'Nombre de categoría'}</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            ¡Categoría actualizada exitosamente! Redirigiendo...
          </div>
        )}

        <div className="new-category-actions">
          <button 
            type="submit" 
            className="save-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner"></span>
                Guardando...
              </>
            ) : 'Guardar Cambios'}
          </button>
          <button 
            type="button" 
            className="cancel-btn"
            onClick={() => navigate('/category')}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCategory;