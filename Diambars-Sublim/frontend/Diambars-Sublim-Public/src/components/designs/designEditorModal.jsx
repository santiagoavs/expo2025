// src/components/designs/DesignEditorModal.jsx - MODAL DEL EDITOR DE DISEÑOS
import React, { useState, useEffect, useCallback, useRef } from 'react';
import './designEditorModal.css';

const DesignEditorModal = ({
  isOpen,
  onClose,
  designData,
  onSave
}) => {
  // ==================== ESTADOS ====================
  const [activeTab, setActiveTab] = useState('tools'); // tools, layers
  const [activeTool, setActiveTool] = useState('select'); // select, text, image, shape
  const [selectedElement, setSelectedElement] = useState(null);
  const [elements, setElements] = useState([]);
  const [designName, setDesignName] = useState('');
  const [productColorFilter, setProductColorFilter] = useState('#ffffff');
  const [zoom, setZoom] = useState(100);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // saved, saving, error
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Referencias
  const autoSaveTimeoutRef = useRef(null);

  // ==================== EFECTOS ====================

  // Cargar datos del diseño cuando se abre el modal
  useEffect(() => {
    if (isOpen && designData) {
      console.log('🎨 [DesignEditor] Cargando diseño:', designData);
      
      const design = designData.design;
      setDesignName(design.name || 'Diseño sin nombre');
      setElements(design.elements || []);
      setProductColorFilter(design.productColorFilter || '#ffffff');
      setSelectedElement(null);
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      setZoom(100);
      setActiveTool('select');
      setActiveTab('tools');
    }
  }, [isOpen, designData]);

  // Auto-guardado cada 30 segundos si hay cambios
  useEffect(() => {
    if (hasUnsavedChanges && isOpen) {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
      
      autoSaveTimeoutRef.current = setTimeout(() => {
        handleAutoSave();
      }, 30000); // 30 segundos
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasUnsavedChanges, isOpen]);

  // Limpiar timeout cuando se cierra el modal
  useEffect(() => {
    if (!isOpen && autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
  }, [isOpen]);

  // ==================== FUNCIONES AUXILIARES ====================

  const markAsUnsaved = useCallback(() => {
    setHasUnsavedChanges(true);
    setSaveStatus('saved');
  }, []);

  // ==================== MANEJO DE ELEMENTOS ====================

  const addTextElement = useCallback(() => {
    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      areaId: designData?.design?.product?.customizationAreas?.[0]?.id || 'area-1',
      konvaAttrs: {
        x: 50,
        y: 50,
        text: 'Nuevo texto',
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#000000',
        align: 'left'
      }
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
    setActiveTool('select');
    markAsUnsaved();
    
    console.log('📝 [DesignEditor] Elemento de texto agregado:', newElement);
  }, [designData, markAsUnsaved]);

  const addImageElement = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newElement = {
            id: `image-${Date.now()}`,
            type: 'image',
            areaId: designData?.design?.product?.customizationAreas?.[0]?.id || 'area-1',
            konvaAttrs: {
              x: 50,
              y: 50,
              width: 100,
              height: 100,
              image: event.target.result
            }
          };
          
          setElements(prev => [...prev, newElement]);
          setSelectedElement(newElement);
          setActiveTool('select');
          markAsUnsaved();
          
          console.log('🖼️ [DesignEditor] Elemento de imagen agregado:', newElement);
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  }, [designData, markAsUnsaved]);

  const addShapeElement = useCallback((shapeType = 'rect') => {
    const baseAttrs = {
      x: 50,
      y: 50,
      fill: '#3F2724',
      stroke: '#000000',
      strokeWidth: 0
    };

    let specificAttrs = {};
    switch (shapeType) {
      case 'circle':
        specificAttrs = { radius: 50 };
        break;
      case 'rect':
      default:
        specificAttrs = { width: 100, height: 100 };
        break;
    }

    const newElement = {
      id: `${shapeType}-${Date.now()}`,
      type: 'shape',
      shapeType,
      areaId: designData?.design?.product?.customizationAreas?.[0]?.id || 'area-1',
      konvaAttrs: {
        ...baseAttrs,
        ...specificAttrs
      }
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
    setActiveTool('select');
    markAsUnsaved();
    
    console.log(`🔷 [DesignEditor] Elemento de forma (${shapeType}) agregado:`, newElement);
  }, [designData, markAsUnsaved]);

  const updateSelectedElement = useCallback((updates) => {
    if (!selectedElement) return;

    setElements(prev => prev.map(el => 
      el.id === selectedElement.id 
        ? { ...el, konvaAttrs: { ...el.konvaAttrs, ...updates } }
        : el
    ));

    setSelectedElement(prev => prev ? {
      ...prev,
      konvaAttrs: { ...prev.konvaAttrs, ...updates }
    } : null);

    markAsUnsaved();
  }, [selectedElement, markAsUnsaved]);

  const deleteSelectedElement = useCallback(() => {
    if (!selectedElement) return;

    setElements(prev => prev.filter(el => el.id !== selectedElement.id));
    setSelectedElement(null);
    markAsUnsaved();

    console.log('🗑️ [DesignEditor] Elemento eliminado:', selectedElement.id);
  }, [selectedElement, markAsUnsaved]);

  const selectElement = useCallback((element) => {
    setSelectedElement(element);
    setActiveTool('select');
  }, []);

  // ==================== MANEJO DE CAPAS ====================

  const moveElementUp = useCallback(() => {
    if (!selectedElement) return;

    setElements(prev => {
      const index = prev.findIndex(el => el.id === selectedElement.id);
      if (index < prev.length - 1) {
        const newElements = [...prev];
        [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
        markAsUnsaved();
        return newElements;
      }
      return prev;
    });
  }, [selectedElement, markAsUnsaved]);

  const moveElementDown = useCallback(() => {
    if (!selectedElement) return;

    setElements(prev => {
      const index = prev.findIndex(el => el.id === selectedElement.id);
      if (index > 0) {
        const newElements = [...prev];
        [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
        markAsUnsaved();
        return newElements;
      }
      return prev;
    });
  }, [selectedElement, markAsUnsaved]);

  const toggleElementVisibility = useCallback((elementId) => {
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, visible: el.visible !== false ? false : true }
        : el
    ));
    markAsUnsaved();
  }, [markAsUnsaved]);

  // ==================== GUARDADO ====================

  const handleAutoSave = useCallback(async () => {
    if (!hasUnsavedChanges || !designData?.design?.id) return;

    try {
      setSaving(true);
      setSaveStatus('saving');

      const designUpdates = {
        name: designName,
        elements,
        productColorFilter: productColorFilter !== '#ffffff' ? productColorFilter : null
      };

      await onSave(designData.design.id, designUpdates);
      
      setHasUnsavedChanges(false);
      setSaveStatus('saved');
      console.log('💾 [DesignEditor] Auto-guardado exitoso');
    } catch (error) {
      console.error('❌ [DesignEditor] Error en auto-guardado:', error);
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  }, [hasUnsavedChanges, designData, designName, elements, productColorFilter, onSave]);

  const handleSaveAndClose = useCallback(async () => {
    try {
      setSaving(true);
      setSaveStatus('saving');

      const designUpdates = {
        name: designName,
        elements,
        productColorFilter: productColorFilter !== '#ffffff' ? productColorFilter : null
      };

      await onSave(designData.design.id, designUpdates);
      
      console.log('✅ [DesignEditor] Diseño guardado y cerrado');
      onClose();
    } catch (error) {
      console.error('❌ [DesignEditor] Error guardando:', error);
      setSaveStatus('error');
      throw error; // Re-lanzar para mostrar error en la UI
    } finally {
      setSaving(false);
    }
  }, [designData, designName, elements, productColorFilter, onSave, onClose]);

  const handleClose = useCallback(() => {
    if (hasUnsavedChanges) {
      const confirmClose = window.confirm(
        '¿Deseas cerrar sin guardar? Se perderán los cambios no guardados.'
      );
      if (!confirmClose) return;
    }
    
    onClose();
  }, [hasUnsavedChanges, onClose]);

  // ==================== COMPONENTES DE UI ====================

  // Renderizar herramientas
  const renderToolsPanel = () => (
    <div className="tools-panel">
      <div className="tool-group">
        <div className="tool-group-header">Elementos</div>
        <div className="tool-group-content">
          <div 
            className={`tool-item ${activeTool === 'text' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('text');
              addTextElement();
            }}
          >
            <div className="tool-icon">📝</div>
            <span>Texto</span>
          </div>
          <div 
            className={`tool-item ${activeTool === 'image' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('image');
              addImageElement();
            }}
          >
            <div className="tool-icon">🖼️</div>
            <span>Imagen</span>
          </div>
          <div 
            className={`tool-item ${activeTool === 'rect' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('rect');
              addShapeElement('rect');
            }}
          >
            <div className="tool-icon">⬜</div>
            <span>Rectángulo</span>
          </div>
          <div 
            className={`tool-item ${activeTool === 'circle' ? 'active' : ''}`}
            onClick={() => {
              setActiveTool('circle');
              addShapeElement('circle');
            }}
          >
            <div className="tool-icon">⭕</div>
            <span>Círculo</span>
          </div>
        </div>
      </div>

      <div className="tool-group">
        <div className="tool-group-header">Producto</div>
        <div className="tool-group-content">
          <div className="property-field">
            <label className="property-label">Color del producto:</label>
            <input
              type="color"
              value={productColorFilter}
              onChange={(e) => {
                setProductColorFilter(e.target.value);
                markAsUnsaved();
              }}
              className="property-input"
            />
          </div>
        </div>
      </div>
    </div>
  );

  // Renderizar capas
  const renderLayersPanel = () => (
    <div className="layers-panel">
      {elements.length === 0 ? (
        <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: '0.85rem', padding: '20px' }}>
          No hay elementos en el diseño
        </div>
      ) : (
        elements.map((element, index) => (
          <div
            key={element.id}
            className={`layer-item ${selectedElement?.id === element.id ? 'active' : ''}`}
            onClick={() => selectElement(element)}
          >
            <button
              className="layer-visibility"
              onClick={(e) => {
                e.stopPropagation();
                toggleElementVisibility(element.id);
              }}
            >
              {element.visible !== false ? '👁️' : '🚫'}
            </button>
            <span className="layer-name">
              {element.type === 'text' ? element.konvaAttrs?.text?.substring(0, 20) || 'Texto' :
               element.type === 'image' ? 'Imagen' :
               element.type === 'shape' ? element.shapeType || 'Forma' : 'Elemento'}
            </span>
            <span className="layer-type">{element.type}</span>
          </div>
        ))
      )}
    </div>
  );

  // Renderizar propiedades del elemento seleccionado
  const renderElementProperties = () => {
    if (!selectedElement) {
      return (
        <div style={{ textAlign: 'center', color: '#9ca3af', padding: '20px' }}>
          Selecciona un elemento para editar sus propiedades
        </div>
      );
    }

    const attrs = selectedElement.konvaAttrs;

    return (
      <div>
        {/* Propiedades de posición y tamaño */}
        <div className="property-section">
          <div className="property-title">Posición y Tamaño</div>
          <div className="property-grid">
            <div className="property-field">
              <label className="property-label">X</label>
              <input
                type="number"
                value={Math.round(attrs.x || 0)}
                onChange={(e) => updateSelectedElement({ x: parseInt(e.target.value) || 0 })}
                className="property-input"
              />
            </div>
            <div className="property-field">
              <label className="property-label">Y</label>
              <input
                type="number"
                value={Math.round(attrs.y || 0)}
                onChange={(e) => updateSelectedElement({ y: parseInt(e.target.value) || 0 })}
                className="property-input"
              />
            </div>
            {(selectedElement.type === 'image' || selectedElement.type === 'shape') && (
              <>
                <div className="property-field">
                  <label className="property-label">Ancho</label>
                  <input
                    type="number"
                    value={Math.round(attrs.width || attrs.radius * 2 || 0)}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (selectedElement.shapeType === 'circle') {
                        updateSelectedElement({ radius: value / 2 });
                      } else {
                        updateSelectedElement({ width: value });
                      }
                    }}
                    className="property-input"
                  />
                </div>
                <div className="property-field">
                  <label className="property-label">Alto</label>
                  <input
                    type="number"
                    value={Math.round(attrs.height || attrs.radius * 2 || 0)}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 0;
                      if (selectedElement.shapeType === 'circle') {
                        updateSelectedElement({ radius: value / 2 });
                      } else {
                        updateSelectedElement({ height: value });
                      }
                    }}
                    className="property-input"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Propiedades de texto */}
        {selectedElement.type === 'text' && (
          <div className="property-section">
            <div className="property-title">Texto</div>
            <div className="property-field full-width">
              <label className="property-label">Contenido</label>
              <input
                type="text"
                value={attrs.text || ''}
                onChange={(e) => updateSelectedElement({ text: e.target.value })}
                className="property-input"
                placeholder="Escribe aquí..."
              />
            </div>
            <div className="property-grid">
              <div className="property-field">
                <label className="property-label">Tamaño</label>
                <input
                  type="number"
                  value={attrs.fontSize || 24}
                  onChange={(e) => updateSelectedElement({ fontSize: parseInt(e.target.value) || 24 })}
                  className="property-input"
                  min="8"
                  max="200"
                />
              </div>
              <div className="property-field">
                <label className="property-label">Color</label>
                <input
                  type="color"
                  value={attrs.fill || '#000000'}
                  onChange={(e) => updateSelectedElement({ fill: e.target.value })}
                  className="property-input"
                />
              </div>
            </div>
            <div className="property-field full-width">
              <label className="property-label">Fuente</label>
              <select
                value={attrs.fontFamily || 'Arial'}
                onChange={(e) => updateSelectedElement({ fontFamily: e.target.value })}
                className="font-family-select"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Verdana">Verdana</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Impact">Impact</option>
              </select>
            </div>
            <div className="property-field full-width">
              <label className="property-label">Alineación</label>
              <div className="text-align-buttons">
                <button
                  className={`text-align-btn ${attrs.align === 'left' ? 'active' : ''}`}
                  onClick={() => updateSelectedElement({ align: 'left' })}
                >
                  ⬅️
                </button>
                <button
                  className={`text-align-btn ${attrs.align === 'center' ? 'active' : ''}`}
                  onClick={() => updateSelectedElement({ align: 'center' })}
                >
                  ↔️
                </button>
                <button
                  className={`text-align-btn ${attrs.align === 'right' ? 'active' : ''}`}
                  onClick={() => updateSelectedElement({ align: 'right' })}
                >
                  ➡️
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Propiedades de forma */}
        {selectedElement.type === 'shape' && (
          <div className="property-section">
            <div className="property-title">Apariencia</div>
            <div className="property-grid">
              <div className="property-field">
                <label className="property-label">Color de relleno</label>
                <input
                  type="color"
                  value={attrs.fill || '#3F2724'}
                  onChange={(e) => updateSelectedElement({ fill: e.target.value })}
                  className="property-input"
                />
              </div>
              <div className="property-field">
                <label className="property-label">Color de borde</label>
                <input
                  type="color"
                  value={attrs.stroke || '#000000'}
                  onChange={(e) => updateSelectedElement({ stroke: e.target.value })}
                  className="property-input"
                />
              </div>
              <div className="property-field full-width">
                <label className="property-label">Grosor de borde: {attrs.strokeWidth || 0}px</label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={attrs.strokeWidth || 0}
                  onChange={(e) => updateSelectedElement({ strokeWidth: parseInt(e.target.value) })}
                  className="property-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* Acciones del elemento */}
        <div className="property-section">
          <div className="property-title">Acciones</div>
          <div className="property-grid">
            <button
              onClick={moveElementUp}
              className="property-input"
              style={{ background: '#f3f4f6', cursor: 'pointer', border: '1px solid #d1d5db' }}
            >
              ⬆️ Subir
            </button>
            <button
              onClick={moveElementDown}
              className="property-input"
              style={{ background: '#f3f4f6', cursor: 'pointer', border: '1px solid #d1d5db' }}
            >
              ⬇️ Bajar
            </button>
            <button
              onClick={deleteSelectedElement}
              className="property-input full-width"
              style={{ background: '#fee2e2', color: '#dc2626', cursor: 'pointer', border: '1px solid #fca5a5' }}
            >
              🗑️ Eliminar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ==================== RENDERIZADO PRINCIPAL ====================

  if (!isOpen || !designData) return null;

  const design = designData.design;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="design-editor-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <span className="modal-icon">✏️</span>
            <div>
              <h2>Editor de Diseños</h2>
              <p>{design?.product?.name}</p>
            </div>
          </div>
          <button 
            onClick={handleClose} 
            className="close-btn" 
            disabled={saving}
          >
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div className="editor-toolbar">
          <div className="toolbar-left">
            <div className="toolbar-group">
              <button 
                className={`toolbar-btn ${activeTool === 'select' ? 'active' : ''}`}
                onClick={() => setActiveTool('select')}
                title="Seleccionar"
              >
                🔍
              </button>
              <button 
                className="toolbar-btn"
                onClick={() => {
                  setActiveTool('text');
                  addTextElement();
                }}
                title="Agregar texto"
              >
                📝
              </button>
              <button 
                className="toolbar-btn"
                onClick={() => {
                  setActiveTool('image');
                  addImageElement();
                }}
                title="Agregar imagen"
              >
                🖼️
              </button>
            </div>

            <div className="toolbar-separator"></div>

            <div className="toolbar-group">
              <button 
                className="toolbar-btn"
                onClick={moveElementUp}
                disabled={!selectedElement}
                title="Subir elemento"
              >
                ⬆️
              </button>
              <button 
                className="toolbar-btn"
                onClick={moveElementDown}
                disabled={!selectedElement}
                title="Bajar elemento"
              >
                ⬇️
              </button>
              <button 
                className="toolbar-btn"
                onClick={deleteSelectedElement}
                disabled={!selectedElement}
                title="Eliminar elemento"
              >
                🗑️
              </button>
            </div>

            <div className="design-name-display">
              {designName}
            </div>
          </div>

          <div className="toolbar-right">
            <div className={`save-status ${saveStatus}`}>
              {saveStatus === 'saving' ? (
                <>
                  <span>⏳</span>
                  <span>Guardando...</span>
                </>
              ) : saveStatus === 'saved' ? (
                <>
                  <span>✅</span>
                  <span>Guardado</span>
                </>
              ) : saveStatus === 'error' ? (
                <>
                  <span>❌</span>
                  <span>Error al guardar</span>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="editor-content">
          {/* Sidebar izquierda */}
          <div className="editor-sidebar">
            <div className="sidebar-tabs">
              <button 
                className={`sidebar-tab ${activeTab === 'tools' ? 'active' : ''}`}
                onClick={() => setActiveTab('tools')}
              >
                Herramientas
              </button>
              <button 
                className={`sidebar-tab ${activeTab === 'layers' ? 'active' : ''}`}
                onClick={() => setActiveTab('layers')}
              >
                Capas
              </button>
            </div>
            
            <div className="sidebar-content">
              {activeTab === 'tools' ? renderToolsPanel() : renderLayersPanel()}
            </div>
          </div>

          {/* Área del canvas */}
          <div className="canvas-area">
            <div className="canvas-container">
              <div className="canvas-wrapper">
                <div className="canvas-mock">
                  {design?.product?.mainImage && (
                    <img 
                      src={design.product.mainImage} 
                      alt={design.product.name}
                      className="product-background"
                      style={{ 
                        filter: productColorFilter !== '#ffffff' 
                          ? `sepia(1) saturate(3) hue-rotate(${productColorFilter})` 
                          : 'none' 
                      }}
                    />
                  )}
                  <div className="canvas-overlay">
                    <div>Canvas del Editor Konva</div>
                    <div style={{ fontSize: '0.8rem', marginTop: '8px', opacity: 0.7 }}>
                      {elements.length} elemento{elements.length !== 1 ? 's' : ''}
                      {selectedElement && ` • ${selectedElement.type} seleccionado`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controles de zoom */}
            <div className="canvas-zoom-controls">
              <button 
                className="zoom-btn"
                onClick={() => setZoom(prev => Math.max(25, prev - 25))}
                title="Alejar"
              >
                🔍➖
              </button>
              <div className="zoom-level">{zoom}%</div>
              <button 
                className="zoom-btn"
                onClick={() => setZoom(prev => Math.min(400, prev + 25))}
                title="Acercar"
              >
                🔍➕
              </button>
            </div>
          </div>

          {/* Sidebar derecha - Propiedades */}
          <div className="properties-sidebar">
            <div className="properties-header">
              <h3>Propiedades</h3>
            </div>
            <div className="properties-content">
              {renderElementProperties()}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="footer-info">
            <div className="element-count">
              <span>📐</span>
              <span>{elements.length} elemento{elements.length !== 1 ? 's' : ''}</span>
            </div>
            <div>
              <span>🎨</span>
              <span>{design?.product?.customizationAreas?.length || 0} área{design?.product?.customizationAreas?.length !== 1 ? 's' : ''}</span>
            </div>
          </div>

          <div className="footer-actions">
            <button 
              onClick={handleClose}
              className="btn btn-cancel"
              disabled={saving}
            >
              Cancelar
            </button>
            
            <button 
              onClick={handleAutoSave}
              className="btn btn-draft"
              disabled={saving || !hasUnsavedChanges}
            >
              💾 Guardar Borrador
            </button>
            
            <button 
              onClick={handleSaveAndClose}
              className="btn btn-save"
              disabled={saving}
            >
              {saving ? 'Guardando...' : '✅ Guardar y Cerrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesignEditorModal;