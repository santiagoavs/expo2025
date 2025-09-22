// src/components/designs/CreateDesignModal.jsx - MODAL DE CREACIÓN PARA USUARIOS PÚBLICOS
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Rect as KonvaRect, Circle as KonvaCircle, Transformer, Group } from 'react-konva';
import useImage from 'use-image';
import './createDesignModal.css';

// Componente auxiliar para cargar imagen por URL dentro del editor inline
const InlineUrlImage = ({ id, src, width, height, onClick, onTap, onDragEnd, onTransformEnd, x = 0, y = 0, rotation = 0, draggable = true, visible = true }) => {
  const [image] = useImage(src || '', 'anonymous');
  return (
    <KonvaImage
      id={id}
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      draggable={draggable}
      visible={visible}
      onClick={onClick}
      onTap={onTap}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
    />
  );
};

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
  // Estados del editor (overlay)
  const [editorElements, setEditorElements] = useState([]);
  const [editorColor, setEditorColor] = useState('#ffffff');
  const [selectedElId, setSelectedElId] = useState(null);
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [productBaseImage] = useImage(selectedProduct?.mainImage || null, 'anonymous');
  const editorStageConfig = useMemo(() => {
    const defaultWidth = 800;
    const defaultHeight = 600;
    const areas = selectedProduct?.customizationAreas || [];
    if (areas.length > 0) {
      let maxX = 0, maxY = 0;
      areas.forEach((area) => {
        const ax = area.position?.x || 0;
        const ay = area.position?.y || 0;
        const aw = area.position?.width || 200;
        const ah = area.position?.height || 100;
        maxX = Math.max(maxX, ax + aw);
        maxY = Math.max(maxY, ay + ah);
      });
      return {
        width: Math.max(defaultWidth, maxX + 100),
        height: Math.max(defaultHeight, maxY + 100)
      };
    }
    return { width: defaultWidth, height: defaultHeight };
  }, [selectedProduct]);

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
        // Inicializar editor con estado actual
        setEditorElements(designElements && designElements.length > 0 ? designElements : []);
        setEditorColor(designData.productColorFilter || '#ffffff');
        setSelectedElId(null);
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

  const handleEditorSave = useCallback((elements, productColorFilter) => {
    console.log('💾 Guardando elementos del editor:', elements);
    
    if (!elements || elements.length === 0) {
      setErrors({ elements: 'Debes crear al menos un elemento en el diseño' });
      return;
    }

    setDesignElements(elements);
    setDesignData(prev => ({
      ...prev,
      elements,
      productColorFilter: productColorFilter || null
    }));
    
    setShowEditor(false);
    setStep(3); // Ir a revisión
    setErrors(prev => ({ ...prev, elements: undefined }));
  }, []);

  const handleEditorClose = useCallback(() => {
    setShowEditor(false);
  }, []);

  // ==================== LÓGICA DEL EDITOR (KONVA) ====================
  const addTextEl = useCallback(() => {
    const area = selectedProduct?.customizationAreas?.[0];
    const newEl = {
      id: `text-${Date.now()}`,
      type: 'text',
      areaId: area?._id || area?.id || 'area-1',
      konvaAttrs: {
        x: (area?.position?.x || 0) + 20,
        y: (area?.position?.y || 0) + 20,
        text: 'Nuevo texto',
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#000000'
      }
    };
    setEditorElements(prev => [...prev, newEl]);
    setSelectedElId(newEl.id);
  }, [selectedProduct]);

  const addImageEl = useCallback(() => {
    if (!fileInputRef.current) {
      fileInputRef.current = document.createElement('input');
      fileInputRef.current.type = 'file';
      fileInputRef.current.accept = 'image/*';
      fileInputRef.current.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
          const area = selectedProduct?.customizationAreas?.[0];
          const newEl = {
            id: `image-${Date.now()}`,
            type: 'image',
            areaId: area?._id || area?.id || 'area-1',
            konvaAttrs: {
              x: (area?.position?.x || 0) + 20,
              y: (area?.position?.y || 0) + 20,
              width: Math.min(200, (area?.position?.width || 200) - 40),
              height: Math.min(150, (area?.position?.height || 150) - 40),
              image: ev.target.result
            }
          };
          setEditorElements(prev => [...prev, newEl]);
          setSelectedElId(newEl.id);
        };
        reader.readAsDataURL(file);
      };
    }
    fileInputRef.current.click();
  }, [selectedProduct]);

  const onCanvasClick = useCallback((e) => {
    if (e.target === e.target.getStage()) {
      setSelectedElId(null);
      if (transformerRef.current) transformerRef.current.nodes([]);
    }
  }, []);

  useEffect(() => {
    if (!stageRef.current || !transformerRef.current) return;
    if (!selectedElId) {
      transformerRef.current.nodes([]);
      return;
    }
    const node = stageRef.current.findOne(`#${selectedElId}`);
    if (node) {
      transformerRef.current.nodes([node]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedElId]);

  const handleDragEnd = useCallback((id, e) => {
    const x = Math.round(e.target.x());
    const y = Math.round(e.target.y());
    setEditorElements(prev => prev.map(el => el.id === id ? { ...el, konvaAttrs: { ...el.konvaAttrs, x, y } } : el));
  }, []);

  const handleTransformEnd = useCallback((id, node) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    node.scaleX(1);
    node.scaleY(1);
    const updates = {
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      rotation: Math.round(node.rotation()),
    };
    if (node.className === 'Text' || node.className === 'Image' || node.className === 'Rect') {
      updates.width = Math.round((node.width() || 0) * scaleX);
      updates.height = Math.round((node.height() || 0) * scaleY);
    }
    setEditorElements(prev => prev.map(el => el.id === id ? { ...el, konvaAttrs: { ...el.konvaAttrs, ...updates } } : el));
  }, []);

  const removeSelected = useCallback(() => {
    if (!selectedElId) return;
    setEditorElements(prev => prev.filter(el => el.id !== selectedElId));
    setSelectedElId(null);
  }, [selectedElId]);

  const normalizedToSubmit = useCallback(() => {
    // Limpiar props innecesarias en konvaAttrs
    return editorElements.map(el => ({
      type: el.type,
      areaId: el.areaId,
      konvaAttrs: { ...el.konvaAttrs }
    }));
  }, [editorElements]);

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
              className={`product-item ${selectedProduct?.id === product.id ? 'selected' : ''}`}
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
                <h2>Crear Diseño Personalizado</h2>
                <p>Paso {step} de 3</p>
              </div>
            </div>
            <button onClick={handleClose} className="close-btn" disabled={loading}>
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
          <div className="modal-content">
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

      {/* Editor Modal */}
      {showEditor && selectedProduct && (
        <div className="editor-overlay">
          <div className="editor-container">
            <div className="editor-toolbar">
              <div className="editor-tools">
                <button className="tool-btn" onClick={addTextEl}>📝 Texto</button>
                <button className="tool-btn" onClick={addImageEl}>🖼️ Imagen</button>
                <label className="tool-color">
                  🎨 Color
                  <input type="color" value={editorColor} onChange={(e) => setEditorColor(e.target.value)} />
                </label>
                <button className="tool-btn" onClick={removeSelected} disabled={!selectedElId}>🗑️ Eliminar</button>
              </div>
              <div className="editor-actions">
                <button onClick={handleEditorClose} className="btn btn-cancel">Cerrar sin guardar</button>
                <button onClick={() => handleEditorSave(normalizedToSubmit(), editorColor)} className="btn btn-primary">Guardar Diseño</button>
              </div>
            </div>

            <div className="editor-canvas">
              <Stage
                ref={stageRef}
                width={editorStageConfig.width}
                height={editorStageConfig.height}
                onMouseDown={onCanvasClick}
                onTouchStart={onCanvasClick}
              >
                <Layer>
                  {productBaseImage && (
                    <KonvaImage
                      image={productBaseImage}
                      x={0}
                      y={0}
                      width={editorStageConfig.width}
                      height={editorStageConfig.height}
                      opacity={0.3}
                      listening={false}
                    />
                  )}
                  {editorColor && editorColor !== '#ffffff' && (
                    <KonvaRect
                      x={0}
                      y={0}
                      width={editorStageConfig.width}
                      height={editorStageConfig.height}
                      fill={editorColor}
                      globalCompositeOperation="multiply"
                      opacity={0.3}
                      listening={false}
                    />
                  )}
                  {(selectedProduct?.customizationAreas || []).map((area, idx) => (
                    <Group key={area._id || area.id || idx} listening={false}>
                      <KonvaRect
                        x={area.position?.x || 0}
                        y={area.position?.y || 0}
                        width={area.position?.width || 200}
                        height={area.position?.height || 100}
                        stroke="#10B981"
                        dash={[5, 5]}
                        strokeWidth={2}
                        opacity={0.6}
                      />
                    </Group>
                  ))}
                  {editorElements.map((el) => {
                    if (!el || !el.konvaAttrs) return null;
                    const commonProps = {
                      id: el.id,
                      x: el.konvaAttrs.x || 0,
                      y: el.konvaAttrs.y || 0,
                      rotation: el.konvaAttrs.rotation || 0,
                      visible: el.visible !== false,
                      draggable: true,
                      onClick: () => setSelectedElId(el.id),
                      onTap: () => setSelectedElId(el.id),
                      onDragEnd: (e) => handleDragEnd(el.id, e),
                      onTransformEnd: (e) => handleTransformEnd(el.id, e.target)
                    };
                    if (el.type === 'text') {
                      return (
                        <KonvaText
                          key={el.id}
                          {...commonProps}
                          text={el.konvaAttrs.text || ''}
                          fontSize={el.konvaAttrs.fontSize || 24}
                          fontFamily={el.konvaAttrs.fontFamily || 'Arial'}
                          fill={el.konvaAttrs.fill || '#000000'}
                          width={el.konvaAttrs.width}
                          height={el.konvaAttrs.height}
                        />
                      );
                    } else if (el.type === 'image') {
                      return (
                        <InlineUrlImage
                          key={el.id}
                          id={el.id}
                          src={el.konvaAttrs.image}
                          width={el.konvaAttrs.width || 200}
                          height={el.konvaAttrs.height || 150}
                          {...commonProps}
                        />
                      );
                    } else if (el.type === 'shape') {
                      if (el.shapeType === 'circle') {
                        const radius = el.konvaAttrs.radius || Math.min((el.konvaAttrs.width || 100) / 2, (el.konvaAttrs.height || 100) / 2);
                        return (
                          <KonvaCircle
                            key={el.id}
                            {...commonProps}
                            radius={radius}
                            fill={el.konvaAttrs.fill || '#3F2724'}
                            stroke={el.konvaAttrs.stroke || undefined}
                            strokeWidth={el.konvaAttrs.strokeWidth || 0}
                          />
                        );
                      }
                      return (
                        <KonvaRect
                          key={el.id}
                          {...commonProps}
                          width={el.konvaAttrs.width || 100}
                          height={el.konvaAttrs.height || 100}
                          fill={el.konvaAttrs.fill || '#3F2724'}
                          stroke={el.konvaAttrs.stroke || undefined}
                          strokeWidth={el.konvaAttrs.strokeWidth || 0}
                        />
                      );
                    }
                    return null;
                  })}
                  <Transformer ref={transformerRef} rotateEnabled={true} />
                </Layer>
              </Stage>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateDesignModal;