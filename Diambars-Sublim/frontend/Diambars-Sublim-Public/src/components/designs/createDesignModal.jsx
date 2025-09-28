// src/components/designs/CreateDesignModal.jsx - MODAL DE CREACIÓN PARA USUARIOS PÚBLICOS
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import EnhancedDesignEditorModal from './EnhancedDesignEditorModal';
import './createDesignModal.css';


const CreateDesignModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialProduct = null,
  searchProducts
}) => {
  // ==================== ESTADOS ====================
  const [step, setStep] = useState(1); // 1: Producto, 2: Diseño, 3: Revisión
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Estados del diseño
  const [designData, setDesignData] = useState({
    productId: '',
    name: '',
    elements: [],
    productOptions: [],
    clientNotes: '',
    productColorFilter: null
  });

  // Estados para búsqueda de productos
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Estados del editor
  const [showEditor, setShowEditor] = useState(false);
  const [designElements, setDesignElements] = useState([]);

  // Referencias
  const searchTimeoutRef = useRef(null);

  // ==================== EFECTOS ====================

  // Configurar producto inicial
  useEffect(() => {
    if (isOpen && initialProduct) {
      setSelectedProduct(initialProduct);
      setDesignData(prev => ({
        ...prev,
        productId: initialProduct.id,
        name: `Mi diseño - ${initialProduct.name}`
      }));
      setStep(2); // Saltar a diseño si viene con producto
    } else if (isOpen) {
      resetModal();
    }
  }, [isOpen, initialProduct]);

  // Búsqueda de productos con debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.trim().length >= 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          setSearchLoading(true);
          const results = await searchProducts(searchTerm, 10);
          setSearchResults(results);
        } catch (error) {
          console.error('Error buscando productos:', error);
          setSearchResults([]);
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    } else {
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm, searchProducts]);

  // ==================== FUNCIONES AUXILIARES ====================

  const resetModal = useCallback(() => {
    setStep(1);
    setDesignData({
      productId: '',
      name: '',
      elements: [],
      productOptions: [],
      clientNotes: '',
      productColorFilter: null
    });
    setDesignElements([]);
    setSelectedProduct(null);
    setSearchTerm('');
    setSearchResults([]);
    setErrors({});
    setShowEditor(false);
  }, []);

  const validateStep = useCallback((currentStep) => {
    const newErrors = {};
    
    switch (currentStep) {
      case 1:
        if (!selectedProduct) {
          newErrors.product = 'Debes seleccionar un producto';
        }
        if (!designData.name.trim()) {
          newErrors.name = 'Debes escribir un nombre para el diseño';
        }
        break;
      
      case 2:
        if (!designElements || designElements.length === 0) {
          newErrors.elements = 'Debes crear al menos un elemento en el diseño';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [selectedProduct, designData.name, designElements]);

  // ==================== MANEJADORES ====================

  const handleProductSelect = useCallback((product) => {
    if (!product.canCustomize) {
      setErrors({ product: 'Este producto no se puede personalizar' });
      return;
    }

    setSelectedProduct(product);
    setDesignData(prev => ({
      ...prev,
      productId: product.id,
      name: prev.name || `Mi diseño - ${product.name}`
    }));
    setErrors(prev => ({ ...prev, product: undefined }));
  }, []);

  const handleInputChange = useCallback((field, value) => {
    setDesignData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  }, [errors]);

  const handleNext = useCallback(() => {
    if (validateStep(step)) {
      if (step === 1) {
        // Ir al editor de diseño
        setShowEditor(true);
      } else {
        setStep(step + 1);
      }
    }
  }, [step, validateStep]);

  const handleBack = useCallback(() => {
    if (step > 1) {
      setStep(step - 1);
    }
  }, [step]);

  const handleEditorSave = useCallback((designData) => {
    console.log('💾 Guardando elementos del editor:', designData);
    
    if (!designData.elements || designData.elements.length === 0) {
      setErrors({ elements: 'Debes crear al menos un elemento en el diseño' });
      return;
    }

    setDesignElements(designData.elements);
    setDesignData(prev => ({
      ...prev,
      elements: designData.elements,
      productColorFilter: designData.productColorFilter || null
    }));
    
    setShowEditor(false);
    setStep(3); // Ir a revisión
    setErrors(prev => ({ ...prev, elements: undefined }));
  }, []);

  const handleEditorClose = useCallback(() => {
    setShowEditor(false);
  }, []);


  const handleSubmit = useCallback(async () => {
    if (!validateStep(3)) return;
    
    try {
      setLoading(true);
      
      // Preparar datos finales
      const finalDesignData = {
        productId: selectedProduct.id,
        name: designData.name,
        elements: designElements,
        productOptions: designData.productOptions,
        clientNotes: designData.clientNotes,
        productColorFilter: designData.productColorFilter
      };
      
      console.log('📝 CreateDesignModal - Final design data being submitted:', finalDesignData);
      console.log('📝 Design name being sent:', designData.name);
      
      await onSubmit(finalDesignData);
    } catch (error) {
      console.error('Error enviando diseño:', error);
      setErrors({ submit: error.message || 'Error al crear el diseño' });
    } finally {
      setLoading(false);
    }
  }, [selectedProduct, designData, designElements, onSubmit, validateStep]);

  const handleClose = useCallback(() => {
    if (!loading) {
      onClose();
    }
  }, [loading, onClose]);

  // ==================== COMPONENTES DE RENDER ====================

  const renderProductSelection = () => (
    <div className="modal-step">
      <h3>Selecciona un producto para personalizar</h3>
      
      <div className="product-search">
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        {searchLoading && (
          <div className="search-loading">Buscando...</div>
        )}
      </div>

      {searchResults.length > 0 && (
        <div className="product-results">
          {searchResults.map(product => (
            <div
              key={product.id}
              className={`product-item-design ${selectedProduct?.id === product.id ? 'selected' : ''}`}
              onClick={() => handleProductSelect(product)}
            >
              <div className="product-image">
                <img 
                  src={product.mainImage || '/placeholder-product.jpg'} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = '/placeholder-product.jpg';
                  }}
                />
              </div>
              <div className="product-info">
                <h4>{product.name}</h4>
                <p className="product-price">{product.formattedPrice}</p>
                <p className="product-category">{product.categoryName}</p>
                {!product.canCustomize && (
                  <span className="not-customizable">No personalizable</span>
                )}
              </div>
              {selectedProduct?.id === product.id && (
                <div className="selected-indicator">✓</div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedProduct && (
        <div className="selected-product-info">
          <h4>Producto seleccionado:</h4>
          <div className="selected-product">
            <img 
              src={selectedProduct.mainImage || '/placeholder-product.jpg'} 
              alt={selectedProduct.name}
            />
            <div>
              <h5>{selectedProduct.name}</h5>
              <p>{selectedProduct.formattedPrice}</p>
            </div>
          </div>
        </div>
      )}

      <div className="design-name-input">
        <label htmlFor="designName">Nombre del diseño:</label>
        <input
          id="designName"
          type="text"
          value={designData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="Ej: Mi camiseta personalizada"
          className={errors.name ? 'error' : ''}
        />
        {errors.name && <span className="error-text">{errors.name}</span>}
      </div>

      {errors.product && <div className="error-message">{errors.product}</div>}
    </div>
  );

  const renderDesignStep = () => (
    <div className="modal-step">
      <h3>Crear tu diseño</h3>
      
      {selectedProduct && (
        <div className="product-preview">
          <img 
            src={selectedProduct.mainImage} 
            alt={selectedProduct.name}
          />
          <div>
            <h4>{selectedProduct.name}</h4>
            <p>Áreas de personalización: {selectedProduct.customizationAreas?.length || 0}</p>
          </div>
        </div>
      )}

      {designElements.length > 0 ? (
        <div className="design-preview">
          <div className="design-preview-header">
            <span className="preview-icon">🎨</span>
            <div>
              <h4>Diseño creado</h4>
              <p>{designElements.length} elemento{designElements.length !== 1 ? 's' : ''} agregado{designElements.length !== 1 ? 's' : ''}</p>
            </div>
            <button 
              onClick={() => setShowEditor(true)}
              className="btn btn-edit"
            >
              Editar
            </button>
          </div>
        </div>
      ) : (
        <div className="design-placeholder">
          <div className="placeholder-content">
            <span className="placeholder-icon">🎨</span>
            <h4>Crea tu diseño personalizado</h4>
            <p>Usa nuestro editor visual para agregar texto, imágenes y formas</p>
            <button 
              onClick={() => setShowEditor(true)}
              className="btn btn-primary"
            >
              Abrir Editor
            </button>
          </div>
        </div>
      )}

      {errors.elements && <div className="error-message">{errors.elements}</div>}
    </div>
  );

  const renderReviewStep = () => (
    <div className="modal-step">
      <h3>Revisar y enviar</h3>
      
      <div className="design-summary">
        <div className="summary-section">
          <h4>Producto</h4>
          <div className="summary-product">
            <img src={selectedProduct?.mainImage} alt={selectedProduct?.name} />
            <div>
              <h5>{selectedProduct?.name}</h5>
              <p>{selectedProduct?.formattedPrice}</p>
            </div>
          </div>
        </div>

        <div className="summary-section">
          <h4>Diseño</h4>
          <div className="summary-design">
            <h5>{designData.name}</h5>
            <p>{designElements.length} elemento{designElements.length !== 1 ? 's' : ''} personalizado{designElements.length !== 1 ? 's' : ''}</p>
            {designData.productColorFilter && (
              <div className="color-filter">
                <span>Color del producto: </span>
                <div 
                  className="color-preview" 
                  style={{ backgroundColor: designData.productColorFilter }}
                ></div>
              </div>
            )}
          </div>
        </div>

        <div className="summary-section">
          <h4>Notas adicionales (opcional)</h4>
          <textarea
            value={designData.clientNotes}
            onChange={(e) => handleInputChange('clientNotes', e.target.value)}
            placeholder="Instrucciones especiales, preferencias de colores, etc."
            maxLength={1000}
            className="notes-textarea"
          />
          <div className="char-count">
            {designData.clientNotes.length}/1000 caracteres
          </div>
        </div>
      </div>

      {errors.submit && <div className="error-message">{errors.submit}</div>}
    </div>
  );

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = '0';
      document.body.style.left = '0';
      document.body.style.right = '0';
    } else {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
    };
  }, [isOpen]);

  // ==================== RENDER PRINCIPAL ====================

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={handleClose}>
        <div className="create-design-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <div className="modal-title">
              <span className="modal-icon">🎨</span>
              <div>
                <h2>Crear diseño personalizado</h2>
                <p>Paso {step} de 3</p>
              </div>
            </div>
            <button onClick={handleClose} className="close-btn-design" disabled={loading}>
              ✕
            </button>
          </div>

          {/* Progress bar */}
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>

          {/* Content */}
          <div className="modal-content-design">
            {step === 1 && renderProductSelection()}
            {step === 2 && renderDesignStep()}
            {step === 3 && renderReviewStep()}
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button 
              onClick={handleClose} 
              className="btn btn-cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            
            <div className="footer-actions">
              {step > 1 && (
                <button 
                  onClick={handleBack}
                  className="btn btn-back"
                  disabled={loading}
                >
                  ← Anterior
                </button>
              )}
              
              {step < 3 ? (
                <button 
                  onClick={handleNext}
                  className="btn btn-next"
                  disabled={loading}
                >
                  Siguiente →
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  className="btn btn-submit"
                  disabled={loading}
                >
                  {loading ? 'Creando...' : 'Crear Diseño'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Design Editor Modal */}
      {showEditor && selectedProduct && (
        <EnhancedDesignEditorModal
          isOpen={showEditor}
          onClose={handleEditorClose}
          onSave={handleEditorSave}
          product={selectedProduct}
          design={{
            elements: designElements,
            productColorFilter: designData.productColorFilter,
            name: designData.name
          }}
        />
      )}
    </>
  );
};

export default CreateDesignModal;