import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import './CreateProductModal.css';

// Importar servicios
import categoryService from '../../api/CategoryService';
import productService from '../../api/ProductService';

// Componentes de iconos simples como reemplazo de Phosphor Icons
const XIcon = () => <span style={{ fontSize: '20px' }}>✖</span>;
const UploadIcon = () => <span style={{ fontSize: '32px' }}>⬆️</span>;
const PlusIcon = () => <span style={{ fontSize: '16px' }}>+</span>;
const PackageIcon = () => <span style={{ fontSize: '24px' }}>📦</span>;
const EditIcon = () => <span style={{ fontSize: '16px' }}>✏️</span>;
const EyeIcon = () => <span style={{ fontSize: '16px' }}>👁️</span>;
const SaveIcon = () => <span style={{ fontSize: '16px' }}>💾</span>;

const CreateProductModal = ({ 
  isOpen, 
  onClose, 
  onCreateProduct,
  editMode = false,
  productToEdit = null 
}) => {
  // Estados principales
  const [activeTab, setActiveTab] = useState('basic');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    productionTime: '3',
    categoryId: '',
    isActive: true,
    featured: false,
    searchTags: []
  });

  // Estados de imágenes
  const [mainImage, setMainImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);

  // Estados de áreas de personalización
  const [customizationAreas, setCustomizationAreas] = useState([]);
  const [showKonvaEditor, setShowKonvaEditor] = useState(false);
  const [currentImageForEditor, setCurrentImageForEditor] = useState(null);

  // Estados de opciones del producto
  const [productOptions, setProductOptions] = useState([]);

  // Cargar categorías al montar
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      
      // Si es modo edición, cargar datos del producto
      if (editMode && productToEdit) {
        loadProductData(productToEdit);
      } else {
        resetForm();
      }
    }
  }, [isOpen, editMode, productToEdit]);

  const loadCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await categoryService.getAll();
      
      if (response.success && Array.isArray(response.data?.categories)) {
        setCategories(response.data.categories.filter(cat => cat.isActive));
      } else {
        // Categorías por defecto si no hay respuesta
        setCategories([
          { _id: 'general', name: 'General' },
          { _id: 'textil', name: 'Textil' },
          { _id: 'ceramica', name: 'Cerámica' },
          { _id: 'accesorios', name: 'Accesorios' },
          { _id: 'hogar', name: 'Hogar' }
        ]);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      // Usar categorías por defecto en caso de error
      setCategories([
        { _id: 'general', name: 'General' },
        { _id: 'textil', name: 'Textil' },
        { _id: 'ceramica', name: 'Cerámica' },
        { _id: 'accesorios', name: 'Accesorios' },
        { _id: 'hogar', name: 'Hogar' }
      ]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadProductData = (product) => {
    setFormData({
      name: product.name || '',
      description: product.description || '',
      basePrice: product.basePrice?.toString() || '',
      productionTime: product.productionTime?.toString() || '3',
      categoryId: product.category?._id || product.categoryId || '',
      isActive: product.isActive !== false,
      featured: product.metadata?.featured || false,
      searchTags: product.metadata?.searchTags || []
    });

    if (product.images?.main) {
      setImagePreview(product.images.main);
    }

    setCustomizationAreas(product.customizationAreas || []);
    setProductOptions(product.options || []);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      basePrice: '',
      productionTime: '3',
      categoryId: '',
      isActive: true,
      featured: false,
      searchTags: []
    });
    setMainImage(null);
    setImagePreview(null);
    setAdditionalImages([]);
    setCustomizationAreas([
      {
        name: 'Área Principal',
        displayName: 'Área Principal',
        position: { x: 50, y: 50, width: 200, height: 200, rotationDegree: 0 },
        accepts: { text: true, image: true },
        maxElements: 5,
        konvaConfig: {
          strokeColor: '#1F64BF',
          strokeWidth: 2,
          fillOpacity: 0.1,
          cornerRadius: 0,
          dash: []
        }
      }
    ]);
    setProductOptions([]);
    setErrors({});
  };

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
        setCurrentImageForEditor(e.target.result);
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

  const handleAdditionalImagesChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      setErrors(prev => ({
        ...prev,
        additionalImages: 'Máximo 5 imágenes adicionales'
      }));
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) return false;
      if (!file.type.startsWith('image/')) return false;
      return true;
    });

    if (validFiles.length !== files.length) {
      setErrors(prev => ({
        ...prev,
        additionalImages: 'Algunas imágenes no son válidas (máximo 5MB cada una)'
      }));
    } else {
      setErrors(prev => ({
        ...prev,
        additionalImages: null
      }));
    }

    setAdditionalImages(validFiles);
  };

  // ==================== ÁREAS DE PERSONALIZACIÓN ====================

  const handleAreaChange = (index, field, value) => {
    setCustomizationAreas(prev => prev.map((area, i) => {
      if (i === index) {
        if (field.startsWith('position.')) {
          const positionField = field.replace('position.', '');
          return {
            ...area,
            position: {
              ...area.position,
              [positionField]: positionField === 'rotationDegree' ? value : Number(value)
            }
          };
        } else if (field.startsWith('accepts.')) {
          const acceptsField = field.replace('accepts.', '');
          return {
            ...area,
            accepts: {
              ...area.accepts,
              [acceptsField]: value
            }
          };
        } else {
          return {
            ...area,
            [field]: field === 'maxElements' ? Number(value) : value
          };
        }
      }
      return area;
    }));
  };

  const addCustomizationArea = () => {
    const newArea = {
      name: `Área ${customizationAreas.length + 1}`,
      displayName: `Área ${customizationAreas.length + 1}`,
      position: { x: 50, y: 50, width: 150, height: 150, rotationDegree: 0 },
      accepts: { text: true, image: true },
      maxElements: 5,
      konvaConfig: {
        strokeColor: '#1F64BF',
        strokeWidth: 2,
        fillOpacity: 0.1,
        cornerRadius: 0,
        dash: []
      }
    };
    setCustomizationAreas(prev => [...prev, newArea]);
  };

  const removeCustomizationArea = (index) => {
    if (customizationAreas.length > 1) {
      setCustomizationAreas(prev => prev.filter((_, i) => i !== index));
    }
  };

  const openKonvaEditor = () => {
    if (!imagePreview) {
      Swal.fire({
        title: 'Imagen requerida',
        text: 'Debes subir una imagen principal antes de definir las áreas',
        icon: 'warning',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#1F64BF'
      });
      return;
    }
    setShowKonvaEditor(true);
  };

  const handleAreasFromKonva = (areas) => {
    setCustomizationAreas(areas);
    setShowKonvaEditor(false);
  };

  // ==================== OPCIONES DEL PRODUCTO ====================

  const addProductOption = () => {
    const newOption = {
      name: 'Nueva Opción',
      label: 'Nueva Opción',
      type: 'dropdown',
      required: false,
      values: [
        { label: 'Opción 1', value: 'option1', additionalPrice: 0, inStock: true }
      ]
    };
    setProductOptions(prev => [...prev, newOption]);
  };

  const removeProductOption = (index) => {
    setProductOptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleOptionChange = (optionIndex, field, value) => {
    setProductOptions(prev => prev.map((option, i) => {
      if (i === optionIndex) {
        return { ...option, [field]: value };
      }
      return option;
    }));
  };

  const handleOptionValueChange = (optionIndex, valueIndex, field, value) => {
    setProductOptions(prev => prev.map((option, i) => {
      if (i === optionIndex) {
        const newValues = option.values.map((val, j) => {
          if (j === valueIndex) {
            return { ...val, [field]: field === 'additionalPrice' ? Number(value) : value };
          }
          return val;
        });
        return { ...option, values: newValues };
      }
      return option;
    }));
  };

  const addOptionValue = (optionIndex) => {
    setProductOptions(prev => prev.map((option, i) => {
      if (i === optionIndex) {
        const newValue = {
          label: `Valor ${option.values.length + 1}`,
          value: `value${option.values.length + 1}`,
          additionalPrice: 0,
          inStock: true
        };
        return { ...option, values: [...option.values, newValue] };
      }
      return option;
    }));
  };

  const removeOptionValue = (optionIndex, valueIndex) => {
    setProductOptions(prev => prev.map((option, i) => {
      if (i === optionIndex && option.values.length > 1) {
        return { ...option, values: option.values.filter((_, j) => j !== valueIndex) };
      }
      return option;
    }));
  };

  // ==================== VALIDACIÓN Y ENVÍO ====================

  const validateForm = () => {
    const newErrors = {};

    // Validación básica
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }

    if (!formData.basePrice || isNaN(formData.basePrice) || parseFloat(formData.basePrice) <= 0) {
      newErrors.basePrice = 'Ingrese un precio válido mayor a 0';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Debe seleccionar una categoría';
    }

    if (!mainImage && !editMode) {
      newErrors.image = 'Debe seleccionar una imagen principal';
    }

    // Validación de áreas
    if (customizationAreas.length === 0) {
      newErrors.customizationAreas = 'Debe definir al menos un área de personalización';
    }

    customizationAreas.forEach((area, index) => {
      if (!area.name.trim()) {
        newErrors[`area_${index}_name`] = `Área ${index + 1}: El nombre es obligatorio`;
      }
      
      if (area.position.width <= 0 || area.position.height <= 0) {
        newErrors[`area_${index}_dimensions`] = `Área ${index + 1}: Las dimensiones deben ser mayores a 0`;
      }
    });

    // Validación de opciones
    productOptions.forEach((option, optionIndex) => {
      if (!option.name.trim()) {
        newErrors[`option_${optionIndex}_name`] = `Opción ${optionIndex + 1}: El nombre es obligatorio`;
      }
      
      option.values.forEach((value, valueIndex) => {
        if (!value.label.trim() || !value.value.trim()) {
          newErrors[`option_${optionIndex}_value_${valueIndex}`] = `Opción ${optionIndex + 1}, Valor ${valueIndex + 1}: Etiqueta y valor son obligatorios`;
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const errorList = Object.values(errors).join('\n• ');
      await Swal.fire({
        title: 'Errores en el formulario',
        text: `Por favor corrige los siguientes errores:\n\n• ${errorList}`,
        icon: 'error',
        confirmButtonText: 'Revisar',
        confirmButtonColor: '#040DBF'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const productData = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        productionTime: parseInt(formData.productionTime),
        customizationAreas,
        options: productOptions,
        mainImage,
        additionalImages,
        metadata: {
          featured: formData.featured,
          searchTags: formData.searchTags,
          stats: editMode ? undefined : { views: 0, designs: 0, orders: 0 }
        }
      };

      if (editMode) {
        await onCreateProduct(productData, 'edit');
      } else {
        await onCreateProduct(productData);
      }
      
      resetForm();
      onClose();

    } catch (error) {
      console.error('Error procesando producto:', error);
      setErrors({ submit: 'Error al procesar el producto. Inténtelo de nuevo.' });
      
      await Swal.fire({
        title: 'Error',
        text: 'Ocurrió un error inesperado. Por favor inténtelo de nuevo.',
        icon: 'error',
        confirmButtonText: 'Intentar de nuevo',
        confirmButtonColor: '#040DBF'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewProduct = () => {
    if (!validateForm()) {
      Swal.fire({
        title: 'Completar información',
        text: 'Complete la información requerida para ver la vista previa',
        icon: 'info',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#1F64BF'
      });
      return;
    }

    // Aquí se mostraría la vista previa del producto
    Swal.fire({
      title: 'Vista Previa',
      html: `
        <div style="text-align: left;">
          <p><strong>Producto:</strong> ${formData.name}</p>
          <p><strong>Precio:</strong> $${formData.basePrice}</p>
          <p><strong>Áreas:</strong> ${customizationAreas.length}</p>
          <p><strong>Opciones:</strong> ${productOptions.length}</p>
        </div>
      `,
      imageUrl: imagePreview,
      imageWidth: 300,
      imageHeight: 200,
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#1F64BF'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="create-modal-overlay" onClick={onClose}>
      <div className="create-modal-container create-modal-large" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="create-modal-header">
          <div className="create-modal-title-wrapper">
            <PackageIcon />
            <h2 className="create-modal-title">
              {editMode ? 'Editar Producto' : 'Crear Nuevo Producto'}
            </h2>
          </div>
          <div className="create-modal-header-actions">
            <button 
              type="button"
              onClick={previewProduct}
              className="create-preview-btn"
              disabled={isSubmitting}
            >
              <EyeIcon />
              <span>Vista Previa</span>
            </button>
            <button 
              className="create-modal-close-btn"
              onClick={onClose}
              type="button"
            >
              <XIcon />
            </button>
          </div>
        </div>

        {/* Navegación por tabs */}
        <div className="create-modal-tabs">
          <button 
            className={`create-tab-btn ${activeTab === 'basic' ? 'active' : ''}`}
            onClick={() => setActiveTab('basic')}
            type="button"
          >
            Información Básica
          </button>
          <button 
            className={`create-tab-btn ${activeTab === 'images' ? 'active' : ''}`}
            onClick={() => setActiveTab('images')}
            type="button"
          >
            Imágenes
          </button>
          <button 
            className={`create-tab-btn ${activeTab === 'areas' ? 'active' : ''}`}
            onClick={() => setActiveTab('areas')}
            type="button"
          >
            Áreas de Personalización
          </button>
          <button 
            className={`create-tab-btn ${activeTab === 'options' ? 'active' : ''}`}
            onClick={() => setActiveTab('options')}
            type="button"
          >
            Opciones del Producto
          </button>
        </div>

        {/* Content */}
        <div className="create-modal-content">
          <form onSubmit={handleSubmit} className="create-product-form">
            
            {/* TAB: INFORMACIÓN BÁSICA */}
            {activeTab === 'basic' && (
              <div className="create-tab-content">
                <div className="create-form-section">
                  <h3 className="create-form-section-title">Información General</h3>
                  
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
                        Categoría *
                      </label>
                      <select
                        name="categoryId"
                        value={formData.categoryId}
                        onChange={handleInputChange}
                        className={`create-form-select ${errors.categoryId ? 'create-input-error' : ''}`}
                        disabled={loadingCategories}
                      >
                        <option value="">Seleccionar categoría</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {errors.categoryId && (
                        <span className="create-form-error">{errors.categoryId}</span>
                      )}
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
                      rows="4"
                    />
                  </div>

                  <div className="create-form-row">
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

                    <div className="create-form-group">
                      <label className="create-form-checkbox-wrapper">
                        <input
                          type="checkbox"
                          name="featured"
                          checked={formData.featured}
                          onChange={handleInputChange}
                          className="create-form-checkbox"
                        />
                        <span className="create-form-checkbox-label">Producto destacado</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: IMÁGENES */}
            {activeTab === 'images' && (
              <div className="create-tab-content">
                <div className="create-form-section">
                  <h3 className="create-form-section-title">Imagen Principal</h3>
                  
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
                              setCurrentImageForEditor(null);
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
                              Haz clic para subir imagen principal
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

                <div className="create-form-section">
                  <h3 className="create-form-section-title">Imágenes Adicionales</h3>
                  
                  <div className="create-image-upload-container">
                    <label className="create-image-upload-area create-additional-upload">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleAdditionalImagesChange}
                        className="create-image-upload-input"
                      />
                      <div className="create-upload-placeholder">
                        <PlusIcon />
                        <span className="create-upload-text">
                          Agregar imágenes adicionales
                        </span>
                        <span className="create-upload-hint">
                          Máximo 5 imágenes
                        </span>
                      </div>
                    </label>
                    
                    {additionalImages.length > 0 && (
                      <div className="create-additional-previews">
                        {Array.from(additionalImages).map((file, index) => (
                          <div key={index} className="create-additional-preview">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`Preview ${index + 1}`}
                              className="create-additional-image"
                            />
                            <button
                              type="button"
                              className="create-image-remove-btn"
                              onClick={() => {
                                setAdditionalImages(prev => 
                                  Array.from(prev).filter((_, i) => i !== index)
                                );
                              }}
                            >
                              <XIcon />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {errors.additionalImages && (
                      <span className="create-form-error">{errors.additionalImages}</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ÁREAS DE PERSONALIZACIÓN */}
            {activeTab === 'areas' && (
              <div className="create-tab-content">
                <div className="create-form-section">
                  <div className="create-section-header">
                    <h3 className="create-form-section-title">Áreas de Personalización</h3>
                    <div className="create-area-actions">
                      <button
                        type="button"
                        onClick={openKonvaEditor}
                        className="create-konva-btn"
                        disabled={!imagePreview}
                      >
                        <EditIcon />
                        <span>Editor Visual</span>
                      </button>
                      <button
                        type="button"
                        onClick={addCustomizationArea}
                        className="create-add-area-btn"
                      >
                        <PlusIcon />
                        <span>Agregar Área</span>
                      </button>
                    </div>
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
                        <div className="create-form-row">
                          <div className="create-form-group">
                            <label className="create-form-label">Nombre del Área</label>
                            <input
                              type="text"
                              value={area.name}
                              onChange={(e) => handleAreaChange(index, 'name', e.target.value)}
                              className="create-form-input"
                              placeholder="Nombre del área personalizable"
                            />
                          </div>
                          <div className="create-form-group">
                            <label className="create-form-label">Nombre Visible</label>
                            <input
                              type="text"
                              value={area.displayName}
                              onChange={(e) => handleAreaChange(index, 'displayName', e.target.value)}
                              className="create-form-input"
                              placeholder="Nombre que verá el cliente"
                            />
                          </div>
                        </div>

                        <div className="create-area-dimensions">
                          <div className="create-form-group">
                            <label className="create-form-label">X</label>
                            <input
                              type="number"
                              value={area.position.x}
                              onChange={(e) => handleAreaChange(index, 'position.x', e.target.value)}
                              className="create-form-input create-dimension-input"
                              min="0"
                            />
                          </div>
                          <div className="create-form-group">
                            <label className="create-form-label">Y</label>
                            <input
                              type="number"
                              value={area.position.y}
                              onChange={(e) => handleAreaChange(index, 'position.y', e.target.value)}
                              className="create-form-input create-dimension-input"
                              min="0"
                            />
                          </div>
                          <div className="create-form-group">
                            <label className="create-form-label">Ancho</label>
                            <input
                              type="number"
                              value={area.position.width}
                              onChange={(e) => handleAreaChange(index, 'position.width', e.target.value)}
                              className="create-form-input create-dimension-input"
                              min="1"
                            />
                          </div>
                          <div className="create-form-group">
                            <label className="create-form-label">Alto</label>
                            <input
                              type="number"
                              value={area.position.height}
                              onChange={(e) => handleAreaChange(index, 'position.height', e.target.value)}
                              className="create-form-input create-dimension-input"
                              min="1"
                            />
                          </div>
                          <div className="create-form-group">
                            <label className="create-form-label">Rotación</label>
                            <input
                              type="number"
                              value={area.position.rotationDegree || 0}
                              onChange={(e) => handleAreaChange(index, 'position.rotationDegree', e.target.value)}
                              className="create-form-input create-dimension-input"
                              min="-360"
                              max="360"
                            />
                          </div>
                          <div className="create-form-group">
                            <label className="create-form-label">Max Elementos</label>
                            <input
                              type="number"
                              value={area.maxElements}
                              onChange={(e) => handleAreaChange(index, 'maxElements', e.target.value)}
                              className="create-form-input create-dimension-input"
                              min="1"
                              max="20"
                            />
                          </div>
                        </div>

                        <div className="create-form-row">
                          <div className="create-form-group">
                            <label className="create-form-label">Acepta Elementos</label>
                            <div className="create-checkbox-group">
                              <label className="create-form-checkbox-wrapper">
                                <input
                                  type="checkbox"
                                  checked={area.accepts.text}
                                  onChange={(e) => handleAreaChange(index, 'accepts.text', e.target.checked)}
                                  className="create-form-checkbox"
                                />
                                <span className="create-form-checkbox-label">Texto</span>
                              </label>
                              <label className="create-form-checkbox-wrapper">
                                <input
                                  type="checkbox"
                                  checked={area.accepts.image}
                                  onChange={(e) => handleAreaChange(index, 'accepts.image', e.target.checked)}
                                  className="create-form-checkbox"
                                />
                                <span className="create-form-checkbox-label">Imágenes</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>

                      {errors[`area_${index}_name`] && (
                        <span className="create-form-error">{errors[`area_${index}_name`]}</span>
                      )}
                      {errors[`area_${index}_dimensions`] && (
                        <span className="create-form-error">{errors[`area_${index}_dimensions`]}</span>
                      )}
                    </div>
                  ))}

                  {errors.customizationAreas && (
                    <span className="create-form-error">{errors.customizationAreas}</span>
                  )}
                </div>
              </div>
            )}

            {/* TAB: OPCIONES DEL PRODUCTO */}
            {activeTab === 'options' && (
              <div className="create-tab-content">
                <div className="create-form-section">
                  <div className="create-section-header">
                    <h3 className="create-form-section-title">Opciones del Producto</h3>
                    <button
                      type="button"
                      onClick={addProductOption}
                      className="create-add-area-btn"
                    >
                      <PlusIcon />
                      <span>Agregar Opción</span>
                    </button>
                  </div>

                  {productOptions.length === 0 ? (
                    <div className="create-empty-options">
                      <p>No hay opciones configuradas. Las opciones permiten al cliente personalizar aspectos como talla, color, material, etc.</p>
                    </div>
                  ) : (
                    productOptions.map((option, optionIndex) => (
                      <div key={optionIndex} className="create-product-option">
                        <div className="create-option-header">
                          <span className="create-option-number">Opción {optionIndex + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeProductOption(optionIndex)}
                            className="create-remove-area-btn"
                          >
                            <XIcon />
                          </button>
                        </div>

                        <div className="create-option-fields">
                          <div className="create-form-row">
                            <div className="create-form-group">
                              <label className="create-form-label">Nombre de la Opción</label>
                              <input
                                type="text"
                                value={option.name}
                                onChange={(e) => handleOptionChange(optionIndex, 'name', e.target.value)}
                                className="create-form-input"
                                placeholder="Ej: Talla, Color, Material"
                              />
                            </div>
                            <div className="create-form-group">
                              <label className="create-form-label">Etiqueta Visible</label>
                              <input
                                type="text"
                                value={option.label}
                                onChange={(e) => handleOptionChange(optionIndex, 'label', e.target.value)}
                                className="create-form-input"
                                placeholder="Texto que verá el cliente"
                              />
                            </div>
                          </div>

                          <div className="create-form-row">
                            <div className="create-form-group">
                              <label className="create-form-label">Tipo de Control</label>
                              <select
                                value={option.type}
                                onChange={(e) => handleOptionChange(optionIndex, 'type', e.target.value)}
                                className="create-form-select"
                              >
                                <option value="dropdown">Lista desplegable</option>
                                <option value="buttons">Botones</option>
                                <option value="color-picker">Selector de color</option>
                                <option value="slider">Control deslizante</option>
                              </select>
                            </div>
                            <div className="create-form-group">
                              <label className="create-form-checkbox-wrapper">
                                <input
                                  type="checkbox"
                                  checked={option.required}
                                  onChange={(e) => handleOptionChange(optionIndex, 'required', e.target.checked)}
                                  className="create-form-checkbox"
                                />
                                <span className="create-form-checkbox-label">Opción requerida</span>
                              </label>
                            </div>
                          </div>

                          {/* Valores de la opción */}
                          <div className="create-option-values">
                            <div className="create-values-header">
                              <label className="create-form-label">Valores Disponibles</label>
                              <button
                                type="button"
                                onClick={() => addOptionValue(optionIndex)}
                                className="create-add-value-btn"
                              >
                                <PlusIcon />
                                <span>Agregar Valor</span>
                              </button>
                            </div>

                            {option.values.map((value, valueIndex) => (
                              <div key={valueIndex} className="create-option-value">
                                <div className="create-value-fields">
                                  <div className="create-form-group">
                                    <label className="create-form-label">Etiqueta</label>
                                    <input
                                      type="text"
                                      value={value.label}
                                      onChange={(e) => handleOptionValueChange(optionIndex, valueIndex, 'label', e.target.value)}
                                      className="create-form-input"
                                      placeholder="Ej: Grande, Rojo, Algodón"
                                    />
                                  </div>
                                  <div className="create-form-group">
                                    <label className="create-form-label">Valor</label>
                                    <input
                                      type="text"
                                      value={value.value}
                                      onChange={(e) => handleOptionValueChange(optionIndex, valueIndex, 'value', e.target.value)}
                                      className="create-form-input"
                                      placeholder="Ej: lg, red, cotton"
                                    />
                                  </div>
                                  <div className="create-form-group">
                                    <label className="create-form-label">Precio Adicional ($)</label>
                                    <input
                                      type="number"
                                      value={value.additionalPrice}
                                      onChange={(e) => handleOptionValueChange(optionIndex, valueIndex, 'additionalPrice', e.target.value)}
                                      className="create-form-input"
                                      min="0"
                                      step="0.01"
                                    />
                                  </div>
                                  <div className="create-form-group">
                                    <label className="create-form-checkbox-wrapper">
                                      <input
                                        type="checkbox"
                                        checked={value.inStock}
                                        onChange={(e) => handleOptionValueChange(optionIndex, valueIndex, 'inStock', e.target.checked)}
                                        className="create-form-checkbox"
                                      />
                                      <span className="create-form-checkbox-label">En stock</span>
                                    </label>
                                  </div>
                                  <div className="create-form-group">
                                    {option.values.length > 1 && (
                                      <button
                                        type="button"
                                        onClick={() => removeOptionValue(optionIndex, valueIndex)}
                                        className="create-remove-value-btn"
                                      >
                                        <XIcon />
                                      </button>
                                    )}
                                  </div>
                                </div>
                                {errors[`option_${optionIndex}_value_${valueIndex}`] && (
                                  <span className="create-form-error">{errors[`option_${optionIndex}_value_${valueIndex}`]}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {errors[`option_${optionIndex}_name`] && (
                          <span className="create-form-error">{errors[`option_${optionIndex}_name`]}</span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

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
                <span>{editMode ? 'Actualizando...' : 'Creando...'}</span>
              </>
            ) : (
              <>
                <SaveIcon />
                <span>{editMode ? 'Actualizar Producto' : 'Crear Producto'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor Konva Modal */}
      {showKonvaEditor && (
        <KonvaAreaEditor
          isOpen={showKonvaEditor}
          onClose={() => setShowKonvaEditor(false)}
          productImage={currentImageForEditor}
          initialAreas={customizationAreas}
          onSaveAreas={handleAreasFromKonva}
        />
      )}
    </div>
  );
};

export default CreateProductModal;