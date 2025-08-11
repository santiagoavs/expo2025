import React, { useState } from 'react';
import Swal from 'sweetalert2';
import './CreateProductModal.css';

// Componentes de iconos simples como reemplazo de Phosphor Icons
const XIcon = () => <span style={{ fontSize: '20px' }}>✖</span>;
const UploadIcon = () => <span style={{ fontSize: '32px' }}>⬆️</span>;
const PlusIcon = () => <span style={{ fontSize: '16px' }}>+</span>;
const PackageIcon = () => <span style={{ fontSize: '24px' }}>📦</span>;

const CreateProductModal = ({ isOpen, onClose, onCreateProduct }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    productionTime: '3',
    category: 'general',
    isActive: true
  });
  
  const [mainImage, setMainImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [customizationAreas, setCustomizationAreas] = useState([
    { name: 'Área Principal', x: 50, y: 50, width: 200, height: 200, maxElements: 3 }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'textil', label: 'Textil' },
    { value: 'ceramica', label: 'Cerámica' },
    { value: 'accesorios', label: 'Accesorios' },
    { value: 'hogar', label: 'Hogar' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Limpiar error específico
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErrors(prev => ({
          ...prev,
          image: 'La imagen no debe superar los 5MB'
        }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: 'Debe seleccionar un archivo de imagen válido'
        }));
        return;
      }

      setMainImage(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Limpiar error
      if (errors.image) {
        setErrors(prev => ({
          ...prev,
          image: null
        }));
      }
    }
  };

  const handleCustomizationAreaChange = (index, field, value) => {
    setCustomizationAreas(prev => prev.map((area, i) => 
      i === index ? { ...area, [field]: field === 'name' ? value : Number(value) } : area
    ));
  };

  const addCustomizationArea = () => {
    setCustomizationAreas(prev => [
      ...prev,
      { 
        name: `Área ${prev.length + 1}`, 
        x: 50, 
        y: 50, 
        width: 150, 
        height: 150, 
        maxElements: 3 
      }
    ]);
  };

  const removeCustomizationArea = (index) => {
    if (customizationAreas.length > 1) {
      setCustomizationAreas(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.basePrice || isNaN(formData.basePrice) || parseFloat(formData.basePrice) <= 0) {
      newErrors.basePrice = 'Ingrese un precio válido mayor a 0';
    }

    if (!mainImage) {
      newErrors.image = 'Debe seleccionar una imagen principal';
    }

    if (customizationAreas.some(area => !area.name.trim())) {
      newErrors.customizationAreas = 'Todas las áreas deben tener un nombre';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Mostrar errores de validación con SweetAlert2
      const errorList = Object.values(errors).join('\n• ');
      await Swal.fire({
        title: 'Errores en el formulario',
        text: `Por favor corrige los siguientes errores:\n\n• ${errorList}`,
        icon: 'error',
        confirmButtonText: 'Revisar',
        confirmButtonColor: '#040DBF',
        background: '#ffffff',
        color: '#010326'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Crear preview de imagen si existe
      let imagePreview = null;
      if (mainImage) {
        imagePreview = URL.createObjectURL(mainImage);
      }

      const productData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        productionTime: parseInt(formData.productionTime),
        customizationAreas,
        mainImage,
        imagePreview, // Agregar preview para mostrar inmediatamente
        metadata: {
          featured: false,
          searchTags: [],
          stats: { views: 0, designs: 0, orders: 0 }
        }
      };

      await onCreateProduct(productData);
      
      // Resetear formulario
      setFormData({
        name: '',
        description: '',
        basePrice: '',
        productionTime: '3',
        category: 'general',
        isActive: true
      });
      setMainImage(null);
      setImagePreview(null);
      setCustomizationAreas([
        { name: 'Área Principal', x: 50, y: 50, width: 200, height: 200, maxElements: 3 }
      ]);
      setErrors({});

    } catch (error) {
      console.error('Error creando producto:', error);
      setErrors({ submit: 'Error al crear el producto. Inténtelo de nuevo.' });
      
      await Swal.fire({
        title: 'Error al crear producto',
        text: 'Ocurrió un error inesperado. Por favor inténtelo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Intentar de nuevo',
        confirmButtonColor: '#040DBF',
        background: '#ffffff',
        color: '#010326'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="create-modal-overlay" onClick={onClose}>
      <div className="create-modal-container" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="create-modal-header">
          <div className="create-modal-title-wrapper">
            <PackageIcon />
            <h2 className="create-modal-title">Crear Nuevo Producto</h2>
          </div>
          <button 
            className="create-modal-close-btn"
            onClick={onClose}
            type="button"
          >
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="create-modal-content">
          <form onSubmit={handleSubmit} className="create-product-form">
            
            {/* Información básica */}
            <div className="create-form-section">
              <h3 className="create-form-section-title">Información Básica</h3>
              
              <div className="create-form-row">
                <div className="create-form-group">
                  <label className="create-form-label">
                    Nombre del Producto *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`create-form-input ${errors.name ? 'create-input-error' : ''}`}
                    placeholder="Ej: Camiseta Premium Sublimada"
                  />
                  {errors.name && (
                    <span className="create-form-error">{errors.name}</span>
                  )}
                </div>

                <div className="create-form-group">
                  <label className="create-form-label">
                    Precio Base (USD) *
                  </label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
                    onChange={handleInputChange}
                    className={`create-form-input ${errors.basePrice ? 'create-input-error' : ''}`}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                  {errors.basePrice && (
                    <span className="create-form-error">{errors.basePrice}</span>
                  )}
                </div>
              </div>

              <div className="create-form-row">
                <div className="create-form-group">
                  <label className="create-form-label">
                    Categoría
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="create-form-select"
                  >
                    {categories.map(cat => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="create-form-group">
                  <label className="create-form-label">
                    Tiempo de Producción (días)
                  </label>
                  <input
                    type="number"
                    name="productionTime"
                    value={formData.productionTime}
                    onChange={handleInputChange}
                    className="create-form-input"
                    min="1"
                    max="30"
                  />
                </div>
              </div>

              <div className="create-form-group">
                <label className="create-form-label">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="create-form-textarea"
                  placeholder="Descripción detallada del producto..."
                  rows="3"
                />
              </div>

              <div className="create-form-group">
                <label className="create-form-checkbox-wrapper">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="create-form-checkbox"
                  />
                  <span className="create-form-checkbox-label">Producto activo</span>
                </label>
              </div>
            </div>

            {/* Imagen del producto */}
            <div className="create-form-section">
              <h3 className="create-form-section-title">Imagen del Producto</h3>
              
              <div className="create-image-upload-container">
                <div className="create-image-upload-area">
                  {imagePreview ? (
                    <div className="create-image-preview">
                      <img src={imagePreview} alt="Preview" className="create-preview-image" />
                      <button
                        type="button"
                        className="create-image-remove-btn"
                        onClick={() => {
                          setMainImage(null);
                          setImagePreview(null);
                        }}
                      >
                        <XIcon />
                      </button>
                    </div>
                  ) : (
                    <label className="create-image-upload-label">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="create-image-upload-input"
                      />
                      <div className="create-upload-placeholder">
                        <UploadIcon />
                        <span className="create-upload-text">
                          Haz clic para subir imagen
                        </span>
                        <span className="create-upload-hint">
                          PNG, JPG hasta 5MB
                        </span>
                      </div>
                    </label>
                  )}
                </div>
                {errors.image && (
                  <span className="create-form-error">{errors.image}</span>
                )}
              </div>
            </div>

            {/* Áreas de personalización */}
            <div className="create-form-section">
              <div className="create-section-header">
                <h3 className="create-form-section-title">Áreas de Personalización</h3>
                <button
                  type="button"
                  onClick={addCustomizationArea}
                  className="create-add-area-btn"
                >
                  <PlusIcon />
                  <span>Agregar Área</span>
                </button>
              </div>

              {customizationAreas.map((area, index) => (
                <div key={index} className="create-customization-area">
                  <div className="create-area-header">
                    <span className="create-area-number">Área {index + 1}</span>
                    {customizationAreas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCustomizationArea(index)}
                        className="create-remove-area-btn"
                      >
                        <XIcon />
                      </button>
                    )}
                  </div>

                  <div className="create-area-fields">
                    <div className="create-form-group">
                      <label className="create-form-label">Nombre del Área</label>
                      <input
                        type="text"
                        value={area.name}
                        onChange={(e) => handleCustomizationAreaChange(index, 'name', e.target.value)}
                        className="create-form-input"
                        placeholder="Nombre del área personalizable"
                      />
                    </div>

                    <div className="create-area-dimensions">
                      <div className="create-form-group">
                        <label className="create-form-label">X</label>
                        <input
                          type="number"
                          value={area.x}
                          onChange={(e) => handleCustomizationAreaChange(index, 'x', e.target.value)}
                          className="create-form-input create-dimension-input"
                          min="0"
                        />
                      </div>

                      <div className="create-form-group">
                        <label className="create-form-label">Y</label>
                        <input
                          type="number"
                          value={area.y}
                          onChange={(e) => handleCustomizationAreaChange(index, 'y', e.target.value)}
                          className="create-form-input create-dimension-input"
                          min="0"
                        />
                      </div>

                      <div className="create-form-group">
                        <label className="create-form-label">Ancho</label>
                        <input
                          type="number"
                          value={area.width}
                          onChange={(e) => handleCustomizationAreaChange(index, 'width', e.target.value)}
                          className="create-form-input create-dimension-input"
                          min="1"
                        />
                      </div>

                      <div className="create-form-group">
                        <label className="create-form-label">Alto</label>
                        <input
                          type="number"
                          value={area.height}
                          onChange={(e) => handleCustomizationAreaChange(index, 'height', e.target.value)}
                          className="create-form-input create-dimension-input"
                          min="1"
                        />
                      </div>

                      <div className="create-form-group">
                        <label className="create-form-label">Max Elementos</label>
                        <input
                          type="number"
                          value={area.maxElements}
                          onChange={(e) => handleCustomizationAreaChange(index, 'maxElements', e.target.value)}
                          className="create-form-input create-dimension-input"
                          min="1"
                          max="10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {errors.customizationAreas && (
                <span className="create-form-error">{errors.customizationAreas}</span>
              )}
            </div>

            {/* Error general */}
            {errors.submit && (
              <div className="create-form-error create-submit-error">
                {errors.submit}
              </div>
            )}
          </form>
        </div>

        {/* Footer con botones */}
        <div className="create-modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="create-cancel-btn"
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="create-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="create-btn-spinner"></div>
                <span>Creando...</span>
              </>
            ) : (
              <>
                <PlusIcon />
                <span>Crear Producto</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateProductModal;