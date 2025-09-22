// src/components/designs/advanced/AdvancedDesignEditor.jsx - MODERN DESIGN EDITOR FOR PUBLIC
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Rect as KonvaRect, Circle as KonvaCircle, Transformer, Group } from 'react-konva';
import useImage from 'use-image';
import './AdvancedDesignEditor.css';

// Canvas configuration
const CANVAS_CONFIG = {
  width: 800,
  height: 600,
  backgroundColor: '#ffffff',
  productScale: 0.8,
  grid: {
    enabled: false,
    size: 20,
    color: '#e5e7eb'
  },
  snap: {
    enabled: true,
    threshold: 5
  }
};

// Utility functions
const calculateScaledDimensions = (width, height, scale) => {
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;
  return {
    width: scaledWidth,
    height: scaledHeight,
    x: (CANVAS_CONFIG.width - scaledWidth) / 2,
    y: (CANVAS_CONFIG.height - scaledHeight) / 2
  };
};

// Image component with proper loading
const UrlImage = ({ id, src, width, height, onClick, onTap, onDragEnd, onTransformEnd, x = 0, y = 0, rotation = 0, draggable = true, visible = true }) => {
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

const AdvancedDesignEditor = ({
  isOpen,
  onClose,
  onSave,
  product,
  initialElements = [],
  initialProductColor = '#ffffff'
}) => {
  // ==================== REFS ====================
  const stageRef = useRef(null);
  const transformerRef = useRef(null);
  const layerRef = useRef(null);
  const fileInputRef = useRef(null);

  // ==================== STATE ====================
  const [elements, setElements] = useState(initialElements);
  const [selectedElementId, setSelectedElementId] = useState(null);
  const [productColorFilter, setProductColorFilter] = useState(initialProductColor);
  const [activeTool, setActiveTool] = useState('select');
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [zoom, setZoom] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

  // ==================== PRODUCT IMAGE ====================
  const [productImage] = useImage(product?.mainImage || product?.image, 'anonymous');
  
  const productImageConfig = useMemo(() => {
    if (!productImage) return null;
    
    const scaleX = CANVAS_CONFIG.width / productImage.width;
    const scaleY = CANVAS_CONFIG.height / productImage.height;
    const scale = Math.min(scaleX, scaleY) * CANVAS_CONFIG.productScale;
    
    return calculateScaledDimensions(productImage.width, productImage.height, scale);
  }, [productImage]);

  // ==================== CUSTOMIZATION AREAS ====================
  const customizationAreas = useMemo(() => {
    if (!product?.customizationAreas || !productImageConfig) return [];
    
    return product.customizationAreas.map(area => ({
      ...area,
      scaledPosition: {
        x: productImageConfig.x + (area.position?.x || 0) * (productImageConfig.width / (productImage?.width || 1)),
        y: productImageConfig.y + (area.position?.y || 0) * (productImageConfig.height / (productImage?.height || 1)),
        width: (area.position?.width || 200) * (productImageConfig.width / (productImage?.width || 1)),
        height: (area.position?.height || 100) * (productImageConfig.height / (productImage?.height || 1))
      }
    }));
  }, [product?.customizationAreas, productImageConfig, productImage]);

  // ==================== HISTORY MANAGEMENT ====================
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(JSON.parse(JSON.stringify(elements)));
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
  }, [elements, history, historyStep]);

  const undo = useCallback(() => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setElements(history[historyStep - 1]);
      setSelectedElementId(null);
    }
  }, [history, historyStep]);

  const redo = useCallback(() => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setElements(history[historyStep + 1]);
      setSelectedElementId(null);
    }
  }, [history, historyStep]);

  // ==================== ELEMENT MANAGEMENT ====================
  const addTextElement = useCallback(() => {
    const area = customizationAreas[0];
    const newElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      areaId: area?._id || area?.id || 'area-1',
      konvaAttrs: {
        x: area?.scaledPosition?.x + 20 || 50,
        y: area?.scaledPosition?.y + 20 || 50,
        text: 'Nuevo texto',
        fontSize: 24,
        fontFamily: 'Arial',
        fill: '#000000',
        align: 'left'
      }
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
    setActiveTool('select');
    saveToHistory();
  }, [customizationAreas, saveToHistory]);

  const addImageElement = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const area = customizationAreas[0];
          const newElement = {
            id: `image-${Date.now()}`,
            type: 'image',
            areaId: area?._id || area?.id || 'area-1',
            konvaAttrs: {
              x: area?.scaledPosition?.x + 20 || 50,
              y: area?.scaledPosition?.y + 20 || 50,
              width: 200,
              height: 150,
              image: event.target.result
            }
          };
          
          setElements(prev => [...prev, newElement]);
          setSelectedElementId(newElement.id);
          setActiveTool('select');
          saveToHistory();
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  }, [customizationAreas, saveToHistory]);

  const addShapeElement = useCallback((shapeType = 'rect') => {
    const area = customizationAreas[0];
    const baseAttrs = {
      x: area?.scaledPosition?.x + 20 || 50,
      y: area?.scaledPosition?.y + 20 || 50,
      fill: '#3F2724',
      stroke: '#000000',
      strokeWidth: 0
    };

    const specificAttrs = shapeType === 'circle' 
      ? { radius: 50 }
      : { width: 100, height: 100 };

    const newElement = {
      id: `${shapeType}-${Date.now()}`,
      type: 'shape',
      shapeType,
      areaId: area?._id || area?.id || 'area-1',
      konvaAttrs: { ...baseAttrs, ...specificAttrs }
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElementId(newElement.id);
    setActiveTool('select');
    saveToHistory();
  }, [customizationAreas, saveToHistory]);

  // ==================== EVENT HANDLERS ====================
  const handleCanvasClick = useCallback((e) => {
    if (e.target === e.target.getStage()) {
      setSelectedElementId(null);
      if (transformerRef.current) {
        transformerRef.current.nodes([]);
      }
    }
  }, []);

  const handleElementClick = useCallback((elementId) => {
    setSelectedElementId(elementId);
  }, []);

  const handleDragEnd = useCallback((elementId, e) => {
    const x = Math.round(e.target.x());
    const y = Math.round(e.target.y());
    
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, konvaAttrs: { ...el.konvaAttrs, x, y } }
        : el
    ));
    saveToHistory();
  }, [saveToHistory]);

  const handleTransformEnd = useCallback((elementId, node) => {
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
    
    setElements(prev => prev.map(el => 
      el.id === elementId 
        ? { ...el, konvaAttrs: { ...el.konvaAttrs, ...updates } }
        : el
    ));
    saveToHistory();
  }, [saveToHistory]);

  const deleteSelectedElement = useCallback(() => {
    if (!selectedElementId) return;
    
    setElements(prev => prev.filter(el => el.id !== selectedElementId));
    setSelectedElementId(null);
    saveToHistory();
  }, [selectedElementId, saveToHistory]);

  // ==================== TRANSFORMER EFFECT ====================
  useEffect(() => {
    if (!stageRef.current || !transformerRef.current) return;
    
    if (!selectedElementId) {
      transformerRef.current.nodes([]);
      return;
    }
    
    const node = stageRef.current.findOne(`#${selectedElementId}`);
    if (node) {
      transformerRef.current.nodes([node]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedElementId]);

  // ==================== KEYBOARD SHORTCUTS ====================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
        }
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelectedElement();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, undo, redo, deleteSelectedElement]);

  // ==================== SAVE HANDLER ====================
  const handleSave = useCallback(() => {
    const designData = {
      elements: elements.map(el => ({
        type: el.type,
        areaId: el.areaId,
        shapeType: el.shapeType,
        konvaAttrs: { ...el.konvaAttrs }
      })),
      productColorFilter: productColorFilter !== '#ffffff' ? productColorFilter : null
    };
    
    onSave(designData);
  }, [elements, productColorFilter, onSave]);

  if (!isOpen) return null;

  return (
    <div className="advanced-design-editor-overlay">
      <div className="advanced-design-editor">
        {/* Header */}
        <div className="editor-header">
          <div className="editor-title">
            <h2>Editor de Diseños Avanzado</h2>
            <p>{product?.name}</p>
          </div>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>

        {/* Toolbar */}
        <div className="editor-toolbar">
          <div className="toolbar-section">
            <button 
              className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`}
              onClick={() => setActiveTool('select')}
              title="Seleccionar"
            >
              🔍
            </button>
            <button 
              className="tool-btn"
              onClick={addTextElement}
              title="Agregar texto"
            >
              📝
            </button>
            <button 
              className="tool-btn"
              onClick={addImageElement}
              title="Agregar imagen"
            >
              🖼️
            </button>
            <button 
              className="tool-btn"
              onClick={() => addShapeElement('rect')}
              title="Rectángulo"
            >
              ⬜
            </button>
            <button 
              className="tool-btn"
              onClick={() => addShapeElement('circle')}
              title="Círculo"
            >
              ⭕
            </button>
          </div>

          <div className="toolbar-section">
            <button 
              className="tool-btn"
              onClick={undo}
              disabled={historyStep <= 0}
              title="Deshacer (Ctrl+Z)"
            >
              ↶
            </button>
            <button 
              className="tool-btn"
              onClick={redo}
              disabled={historyStep >= history.length - 1}
              title="Rehacer (Ctrl+Shift+Z)"
            >
              ↷
            </button>
            <button 
              className="tool-btn"
              onClick={deleteSelectedElement}
              disabled={!selectedElementId}
              title="Eliminar (Delete)"
            >
              🗑️
            </button>
          </div>

          <div className="toolbar-section">
            <label className="color-picker-label">
              Color del producto:
              <input
                type="color"
                value={productColorFilter}
                onChange={(e) => setProductColorFilter(e.target.value)}
                className="color-picker"
              />
            </label>
          </div>

          <div className="toolbar-section">
            <button onClick={handleSave} className="save-btn">
              Guardar Diseño
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="canvas-container">
          <Stage
            ref={stageRef}
            width={CANVAS_CONFIG.width}
            height={CANVAS_CONFIG.height}
            scaleX={zoom}
            scaleY={zoom}
            x={stagePosition.x}
            y={stagePosition.y}
            onMouseDown={handleCanvasClick}
            onTouchStart={handleCanvasClick}
          >
            <Layer ref={layerRef}>
              {/* Product background */}
              {productImage && productImageConfig && (
                <KonvaImage
                  image={productImage}
                  x={productImageConfig.x}
                  y={productImageConfig.y}
                  width={productImageConfig.width}
                  height={productImageConfig.height}
                  opacity={0.8}
                  listening={false}
                />
              )}

              {/* Product color filter */}
              {productColorFilter && productColorFilter !== '#ffffff' && productImageConfig && (
                <KonvaRect
                  x={productImageConfig.x}
                  y={productImageConfig.y}
                  width={productImageConfig.width}
                  height={productImageConfig.height}
                  fill={productColorFilter}
                  globalCompositeOperation="multiply"
                  opacity={0.3}
                  listening={false}
                />
              )}

              {/* Customization areas */}
              {customizationAreas.map((area, idx) => (
                <Group key={area._id || area.id || idx} listening={false}>
                  <KonvaRect
                    x={area.scaledPosition.x}
                    y={area.scaledPosition.y}
                    width={area.scaledPosition.width}
                    height={area.scaledPosition.height}
                    stroke="#10B981"
                    dash={[5, 5]}
                    strokeWidth={2}
                    opacity={0.6}
                  />
                </Group>
              ))}

              {/* Design elements */}
              {elements.map((element) => {
                if (!element || !element.konvaAttrs) return null;
                
                const commonProps = {
                  id: element.id,
                  x: element.konvaAttrs.x || 0,
                  y: element.konvaAttrs.y || 0,
                  rotation: element.konvaAttrs.rotation || 0,
                  visible: element.visible !== false,
                  draggable: true,
                  onClick: () => handleElementClick(element.id),
                  onTap: () => handleElementClick(element.id),
                  onDragEnd: (e) => handleDragEnd(element.id, e),
                  onTransformEnd: (e) => handleTransformEnd(element.id, e.target)
                };

                if (element.type === 'text') {
                  return (
                    <KonvaText
                      key={element.id}
                      {...commonProps}
                      text={element.konvaAttrs.text || ''}
                      fontSize={element.konvaAttrs.fontSize || 24}
                      fontFamily={element.konvaAttrs.fontFamily || 'Arial'}
                      fill={element.konvaAttrs.fill || '#000000'}
                      align={element.konvaAttrs.align || 'left'}
                      width={element.konvaAttrs.width}
                      height={element.konvaAttrs.height}
                    />
                  );
                } else if (element.type === 'image') {
                  return (
                    <UrlImage
                      key={element.id}
                      id={element.id}
                      src={element.konvaAttrs.image}
                      width={element.konvaAttrs.width || 200}
                      height={element.konvaAttrs.height || 150}
                      {...commonProps}
                    />
                  );
                } else if (element.type === 'shape') {
                  if (element.shapeType === 'circle') {
                    return (
                      <KonvaCircle
                        key={element.id}
                        {...commonProps}
                        radius={element.konvaAttrs.radius || 50}
                        fill={element.konvaAttrs.fill || '#3F2724'}
                        stroke={element.konvaAttrs.stroke}
                        strokeWidth={element.konvaAttrs.strokeWidth || 0}
                      />
                    );
                  }
                  return (
                    <KonvaRect
                      key={element.id}
                      {...commonProps}
                      width={element.konvaAttrs.width || 100}
                      height={element.konvaAttrs.height || 100}
                      fill={element.konvaAttrs.fill || '#3F2724'}
                      stroke={element.konvaAttrs.stroke}
                      strokeWidth={element.konvaAttrs.strokeWidth || 0}
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
  );
};

export default AdvancedDesignEditor;
