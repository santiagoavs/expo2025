// src/components/designs/advanced/AdvancedDesignEditor.jsx - MODERNIZED DESIGN EDITOR (CSS VERSION)
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Rect as KonvaRect, Circle as KonvaCircle, Transformer } from 'react-konva';
import useImage from 'use-image';

// Import modular system
import { useKonvaCanvas } from '../../../hooks/useKonvaCanvas';
import { useKonvaHistory } from '../../../hooks/useKonvaHistory';
import { ElementFactory } from '../../../services/ElementFactory';
import { ValidationService } from '../../../services/validationService';
import { CANVAS_CONFIG, DEFAULT_CUSTOMIZATION_AREAS } from '../../../utils/canvasConfig';
import { debounce } from '../../../utils/helpers';
import EditorToolbar from '../../EditorToolbar/EditorToolbar';
import UnifiedPanel from '../../UnifiedPanel/UnifiedPanel';
import ShapeCreatorModal from './ShapeCreatorModal';
import { ShapeRenderer, createShapeElement } from './Shapes';
import './AdvancedDesignEditor.css';

// Utility functions
const calculateScaledDimensions = (width, height, scale = 0.8) => {
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
  // ==================== MODULAR HOOKS ====================
  const canvasHook = useKonvaCanvas(initialElements, DEFAULT_CUSTOMIZATION_AREAS);
  const historyHook = useKonvaHistory(initialElements);
  
  const [showUnifiedPanel, setShowUnifiedPanel] = useState(false);
  const [productColorFilter, setProductColorFilter] = useState(initialProductColor);
  const [showShapeCreator, setShowShapeCreator] = useState(false);
  const [activeTool, setActiveTool] = useState('select');

  // ==================== PRODUCT IMAGE ====================
  const productImageUrl = product?.mainImage || product?.image || product?.images?.[0];
  const [productImage] = useImage(productImageUrl, 'anonymous');
  
  // Create color mask for product
  const [colorMaskImage, setColorMaskImage] = useState(null);
  
  useEffect(() => {
    if (productImage && productColorFilter && productColorFilter !== '#ffffff') {
      // Create a canvas to generate the color mask
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = productImage.width;
      canvas.height = productImage.height;
      
      // Draw the original image
      ctx.drawImage(productImage, 0, 0);
      
      // Get image data to detect transparent pixels
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Create mask: fill non-transparent pixels with the selected color
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = productColorFilter;
      
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 0) { // Non-transparent pixel
          const x = (i / 4) % canvas.width;
          const y = Math.floor((i / 4) / canvas.width);
          ctx.fillRect(x, y, 1, 1);
        }
      }
      
      // Convert canvas to image
      const maskImg = new Image();
      maskImg.onload = () => setColorMaskImage(maskImg);
      maskImg.src = canvas.toDataURL();
    } else {
      setColorMaskImage(null);
    }
  }, [productImage, productColorFilter]);
  
  // Debug logging
  useEffect(() => {
    console.log('Product:', product);
    console.log('Product Image URL:', productImageUrl);
    console.log('Product Image loaded:', !!productImage);
    if (productImage) {
      console.log('Product Image dimensions:', productImage.width, 'x', productImage.height);
    }
  }, [product, productImageUrl, productImage]);
  
  const productImageConfig = useMemo(() => {
    if (!productImage) return null;
    
    const scaleX = CANVAS_CONFIG.width / productImage.width;
    const scaleY = CANVAS_CONFIG.height / productImage.height;
    const scale = Math.min(scaleX, scaleY) * CANVAS_CONFIG.productScale;
    
    const scaledWidth = productImage.width * scale;
    const scaledHeight = productImage.height * scale;
    
    return {
      width: scaledWidth,
      height: scaledHeight,
      x: (CANVAS_CONFIG.width - scaledWidth) / 2,
      y: (CANVAS_CONFIG.height - scaledHeight) / 2
    };
  }, [productImage]);

  // ==================== CUSTOMIZATION AREAS ====================
  const customizationAreas = useMemo(() => {
    if (!product?.customizationAreas) return DEFAULT_CUSTOMIZATION_AREAS;
    
    return product.customizationAreas.map((area, index) => {
      // Use original coordinates directly - no additional scaling
      const x = area.position?.x || area.x || 0;
      const y = area.position?.y || area.y || 0;
      const width = area.position?.width || area.width || 200;
      const height = area.position?.height || area.height || 100;
      
      console.log('🎯 Customization area processed:', {
        id: area._id || area.id || `area-${index}`,
        name: area.name,
        original: area.position || { x: area.x, y: area.y, width: area.width, height: area.height },
        final: { x, y, width, height }
      });
      
      return {
        ...area,
        id: area._id || area.id || `area-${index}`,
        scaledPosition: { x, y, width, height }
      };
    });
  }, [product?.customizationAreas]);

  // ==================== ELEMENT HANDLERS ====================
  const addTextElement = useCallback(() => {
    const textElement = ElementFactory.createTextElement({
      text: 'Nuevo Texto',
      x: 100,
      y: 100,
      fontSize: 24,
      fill: '#000000',
      fontFamily: 'Arial',
      listening: true,
      name: `text_${Date.now()}`
    });
    
    canvasHook.addElement(textElement);
    historyHook.saveState();
  }, [canvasHook, historyHook]);

  const addShapeElement = useCallback((shapeType, properties) => {
    const shapeElement = createShapeElement(shapeType, {
      x: 150,
      y: 150,
      ...properties
    });
    
    canvasHook.addElement(shapeElement);
    historyHook.saveState();
  }, [canvasHook, historyHook]);

  const addCustomShapeElement = useCallback((points, properties) => {
    const customShapeElement = createShapeElement('custom', {
      points,
      x: 0,
      y: 0,
      ...properties
    });
    
    canvasHook.addElement(customShapeElement);
    historyHook.saveState();
  }, [canvasHook, historyHook]);

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
          const newElement = ElementFactory.createImageElement({
            x: area?.scaledPosition?.x + 20 || 50,
            y: area?.scaledPosition?.y + 20 || 50,
            width: 200,
            height: 150,
            imageUrl: event.target.result,
            areaId: area?._id || area?.id || 'default-area'
          });
          
          canvasHook.addElement(newElement);
          canvasHook.selectElement(newElement.id);
          historyHook.addToHistory(canvasHook.elements, 'add_image');
          setActiveTool('select');
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  }, [customizationAreas, canvasHook, historyHook]);


  // ==================== EVENT HANDLERS ====================
  const handleCanvasClick = useCallback((e) => {
    // Don't interfere with transformer interactions
    if (e.target.getClassName() === 'Transformer' || 
        e.target.getParent()?.getClassName() === 'Transformer') {
      return;
    }
    
    // Check if we clicked on the stage background or layer (not on an element)
    const clickedOnEmpty = e.target === e.target.getStage() || 
                          e.target.getClassName() === 'Layer' ||
                          e.target.attrs.listening === false;
    
    if (clickedOnEmpty) {
      canvasHook.clearSelection();
    }
  }, [canvasHook]);

  const handleElementClick = useCallback((elementId, e) => {
    if (e) {
      e.cancelBubble = true; // Prevent event bubbling
    }
    console.log('🎯 Element clicked:', elementId);
    console.log('🎯 Event target:', e?.target?.getClassName());
    canvasHook.selectElement(elementId);
  }, [canvasHook]);

  const handleDragEnd = useCallback((elementId, e) => {
    const x = Math.round(e.target.x());
    const y = Math.round(e.target.y());
    
    canvasHook.updateElement(elementId, { x, y });
    historyHook.addToHistory(canvasHook.elements, 'move');
  }, [canvasHook, historyHook]);

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
      updates.width = Math.round(node.width() * scaleX);
      updates.height = Math.round(node.height() * scaleY);
      updates.rotation = Math.round(node.rotation());
    }
    
    canvasHook.updateElement(elementId, updates);
    historyHook.addToHistory(canvasHook.elements, 'transform');
  }, [canvasHook, historyHook]);

  const deleteSelectedElement = useCallback(() => {
    if (canvasHook.selectedElementIds.length > 0) {
      canvasHook.removeSelectedElements();
      historyHook.addToHistory(canvasHook.elements, 'delete');
    }
  }, [canvasHook, historyHook]);

  const duplicateSelectedElement = useCallback(() => {
    if (canvasHook.selectedElementIds.length === 1) {
      const duplicatedId = canvasHook.duplicateElement(canvasHook.selectedElementIds[0]);
      if (duplicatedId) {
        historyHook.addToHistory(canvasHook.elements, 'duplicate');
      }
    }
  }, [canvasHook, historyHook]);

  // ==================== KEYBOARD SHORTCUTS ====================
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' && !e.shiftKey) {
          e.preventDefault();
          const undoElements = historyHook.undo();
          if (undoElements) {
            canvasHook.setElements(undoElements);
          }
        } else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') {
          e.preventDefault();
          const redoElements = historyHook.redo();
          if (redoElements) {
            canvasHook.setElements(redoElements);
          }
        } else if (e.key === 'd') {
          e.preventDefault();
          duplicateSelectedElement();
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
  }, [isOpen, historyHook, canvasHook, deleteSelectedElement, duplicateSelectedElement]);

  // ==================== SAVE HANDLER ====================
  const handleSave = useCallback(() => {
    const designData = {
      elements: canvasHook.elements.map(el => {
        // Extract element properties excluding React/internal properties
        const { id, type, areaId, shapeType, imageUrl, ...elementProps } = el;
        
        const konvaAttrs = {
          id,
          ...elementProps
        };
        
        // For image elements, map imageUrl to image (backend expects 'image' property)
        if (type === 'image' && imageUrl) {
          konvaAttrs.image = imageUrl;
        }
        
        return {
          type,
          areaId,
          shapeType,
          konvaAttrs
        };
      }),
      productColorFilter: productColorFilter !== '#ffffff' ? productColorFilter : null
    };
    
    console.log('💾 Saving design data:', designData);
    onSave(designData);
  }, [canvasHook.elements, productColorFilter, onSave]);

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

        {/* Modern Toolbar */}
        <EditorToolbar
          onAddText={addTextElement}
          onAddImage={addImageElement}
          onAddShape={() => setShowShapeCreator(true)}
          onUndo={() => {
            const undoElements = historyHook.undo();
            if (undoElements) canvasHook.setElements(undoElements);
          }}
          onRedo={() => {
            const redoElements = historyHook.redo();
            if (redoElements) canvasHook.setElements(redoElements);
          }}
          onZoomIn={canvasHook.zoomIn}
          onZoomOut={canvasHook.zoomOut}
          onZoomToFit={canvasHook.zoomToFit}
          onResetZoom={canvasHook.resetZoom}
          onDeleteSelected={deleteSelectedElement}
          onDuplicateSelected={duplicateSelectedElement}
          onBringToFront={() => {
            if (canvasHook.selectedElementIds.length === 1) {
              canvasHook.bringToFront(canvasHook.selectedElementIds[0]);
            }
          }}
          onSendToBack={() => {
            if (canvasHook.selectedElementIds.length === 1) {
              canvasHook.sendToBack(canvasHook.selectedElementIds[0]);
            }
          }}
          canUndo={historyHook.canUndo}
          canRedo={historyHook.canRedo}
          hasSelection={canvasHook.selectedElementIds.length > 0}
          zoom={canvasHook.zoom}
        />

        {/* Main Content */}
        <div className="editor-content">
          {/* Canvas */}
          <div className="canvas-container" ref={canvasHook.containerRef}>
            <Stage
              ref={canvasHook.stageRef}
              width={CANVAS_CONFIG.width}
              height={CANVAS_CONFIG.height}
              scaleX={1}
              scaleY={1}
              x={0}
              y={0}
              onMouseDown={handleCanvasClick}
              onTouchStart={handleCanvasClick}
              style={{ display: 'block' }}
            >
              <Layer ref={canvasHook.layerRef}>
                {/* Product background */}
                {productImage && productImageConfig && (
                  <KonvaImage
                    image={productImage}
                    x={productImageConfig.x}
                    y={productImageConfig.y}
                    width={productImageConfig.width}
                    height={productImageConfig.height}
                    opacity={0.9}
                    listening={false}
                  />
                )}
                
                {/* Fallback background when no product image */}
                {!productImage && (
                  <KonvaRect
                    x={50}
                    y={50}
                    width={CANVAS_CONFIG.width - 100}
                    height={CANVAS_CONFIG.height - 100}
                    fill="rgba(255, 255, 255, 0.1)"
                    stroke="rgba(255, 255, 255, 0.3)"
                    strokeWidth={2}
                    dash={[10, 10]}
                    listening={false}
                  />
                )}

                {/* Product color mask - only affects non-transparent pixels */}
                {colorMaskImage && productImageConfig && (
                  <KonvaImage
                    image={colorMaskImage}
                    x={productImageConfig.x}
                    y={productImageConfig.y}
                    width={productImageConfig.width}
                    height={productImageConfig.height}
                    globalCompositeOperation="multiply"
                    opacity={0.8}
                    listening={false}
                  />
                )}

                {/* Customization areas */}
                {customizationAreas.map((area, idx) => (
                  <KonvaRect
                    key={area._id || area.id || idx}
                    x={area.scaledPosition?.x || 0}
                    y={area.scaledPosition?.y || 0}
                    width={area.scaledPosition?.width || 200}
                    height={area.scaledPosition?.height || 100}
                    stroke="#10B981"
                    strokeWidth={2}
                    dash={[5, 5]}
                    opacity={0.5}
                    listening={false}
                  />
                ))}

                {/* Design elements */}
                {canvasHook.elements.map((element) => {
                  const commonProps = {
                    id: element.id,
                    name: element.id, // Important: Konva uses name for findOne
                    x: element.x || 0,
                    y: element.y || 0,
                    rotation: element.rotation || 0,
                    opacity: element.opacity || 1,
                    visible: element.visible !== false,
                    draggable: element.draggable !== false,
                    listening: true, // Critical: Enable event listening
                    onClick: (e) => handleElementClick(element.id, e),
                    onTap: (e) => handleElementClick(element.id, e),
                    onDragEnd: (e) => handleDragEnd(element.id, e),
                    onTransformEnd: (e) => handleTransformEnd(element.id, e.target)
                  };

                  if (element.type === 'text') {
                    return (
                      <KonvaText
                        key={element.id}
                        {...commonProps}
                        text={element.text || ''}
                        fontSize={element.fontSize || 24}
                        fontFamily={element.fontFamily || 'Arial'}
                        fill={element.fill || '#000000'}
                        align={element.align || 'left'}
                        width={element.width}
                        height={element.height}
                      />
                    );
                  } else if (element.type === 'image') {
                    return (
                      <UrlImage
                        key={element.id}
                        id={element.id}
                        src={element.imageUrl}
                        width={element.width || 200}
                        height={element.height || 150}
                        {...commonProps}
                      />
                    );
                  } else if (element.type === 'shape') {
                    return (
                      <ShapeRenderer
                        key={element.id}
                        element={element}
                        isSelected={canvasHook.selectedElementId === element.id}
                        onSelect={(e) => handleElementClick(element.id, e)}
                        onTransform={(e) => handleTransformEnd(element.id, e.target)}
                      />
                    );
                  }
                  return null;
                })}

                {/* Transformer for selected elements */}
                <Transformer
                  ref={canvasHook.transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    // Limit minimum size
                    if (newBox.width < 10 || newBox.height < 10) {
                      return oldBox;
                    }
                    return newBox;
                  }}
                  rotateEnabled={true}
                  resizeEnabled={true}
                  borderEnabled={true}
                  anchorSize={12}
                  anchorStroke="#00D4FF"
                  anchorFill="white"
                  anchorStrokeWidth={2}
                  borderStroke="#00D4FF"
                  borderStrokeWidth={2}
                  keepRatio={false}
                  enabledAnchors={[
                    'top-left',
                    'top-center', 
                    'top-right',
                    'middle-right',
                    'bottom-right',
                    'bottom-center',
                    'bottom-left',
                    'middle-left'
                  ]}
                  ignoreStroke={true}
                  padding={2}
                  shouldOverdrawWholeArea={true}
                  listening={true}
                  onMouseDown={(e) => {
                    // Prevent canvas click handler from interfering
                    e.cancelBubble = true;
                  }}
                  onTouchStart={(e) => {
                    // Prevent canvas click handler from interfering
                    e.cancelBubble = true;
                  }}
                />
              </Layer>
            </Stage>
          </div>

          {/* Properties Panel */}
          <UnifiedPanel
            selectedElements={canvasHook.selectedElementIds.map(id => 
              canvasHook.elements.find(el => el.id === id)
            ).filter(Boolean)}
            onUpdateElement={(elementId, updates) => {
              canvasHook.updateElement(elementId, updates);
              historyHook.addToHistory(canvasHook.elements, 'update_properties');
            }}
            customizationAreas={customizationAreas}
          />
        </div>

        {/* Save Section */}
        <div className="editor-footer">
          <div className="product-color-section">
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
          <button onClick={handleSave} className="save-btn">
            Guardar Diseño
          </button>
        </div>

        {/* Shape Creator Modal */}
        <ShapeCreatorModal
          isOpen={showShapeCreator}
          onClose={() => setShowShapeCreator(false)}
          onAddShape={addShapeElement}
          onAddCustomShape={addCustomShapeElement}
        />
      </div>
    </div>
  );
};

export default AdvancedDesignEditor;
