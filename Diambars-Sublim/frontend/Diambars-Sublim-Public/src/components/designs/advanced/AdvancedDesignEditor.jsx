// src/components/designs/advanced/AdvancedDesignEditor.jsx - VERSIÓN OPTIMIZADA FINAL
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Rect as KonvaRect, Circle as KonvaCircle, Line, RegularPolygon, Transformer } from 'react-konva';
import useImage from 'use-image';

// Import modular system
import { useKonvaCanvas } from '../../../hooks/useKonvaCanvas';
import { useKonvaHistory } from '../../../hooks/useKonvaHistory';
import { elementFactory } from '../../../services/ElementFactory';
import { CANVAS_CONFIG, DEFAULT_CUSTOMIZATION_AREAS } from '../../../utils/canvasConfig';
import EditorToolbar from '../../EditorToolbar/EditorToolbar';
import UnifiedPanel from '../../UnifiedPanel/UnifiedPanel';
import ShapeCreatorModal from './ShapeCreatorModal';
// ✅ REMOVED: No longer using Shapes.jsx - using direct private admin approach
import './AdvancedDesignEditor.css';

// Image component with proper loading and transformation - ADAPTED FROM PRIVATE ADMIN
const UrlImage = ({ id, name, src, width, height, onClick, onTap, onDragEnd, onTransformEnd, onDragStart, x = 0, y = 0, rotation = 0, draggable = true, visible = true, opacity = 1 }) => {
  const [image] = useImage(src || '', 'anonymous');
  
  // ✅ DEBUGGING: Log image loading like private admin
  console.log('🖼️ [UrlImage] Loading image:', {
    id,
    name,
    src: src?.substring(0, 50) + '...',
    hasImage: !!image,
    width,
    height
  });
  
  if (!image) {
    // ✅ CRITICAL FIX: Use different id/name for placeholder to avoid double grid
    console.log('🖼️ [UrlImage] Image not loaded, showing placeholder for:', id);
    return (
      <KonvaRect
        id={`${id}-placeholder`}
        name={`${name}-placeholder`}
        x={x}
        y={y}
        width={width || 100}
        height={height || 100}
        fill="#f0f0f0"
        stroke="#ccc"
        strokeWidth={1}
        dash={[5, 5]}
        draggable={false}
        visible={visible}
        opacity={opacity}
        listening={false}
      />
    );
  }
  
  return (
    <KonvaImage
      id={id}
      name={name}
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      rotation={rotation}
      draggable={draggable}
      visible={visible}
      opacity={opacity}
      listening={true}
      onClick={onClick}
      onTap={onTap}
      onDragEnd={onDragEnd}
      onTransformEnd={onTransformEnd}
      onDragStart={onDragStart}
    />
  );
};

const AdvancedDesignEditor = ({
  isOpen,
  onClose,
  onSave,
  product,
  initialElements = [],
  initialProductColor = '#ffffff',
  initialDesignName = ''
}) => {
  // ==================== MODULAR HOOKS ====================
  // ✅ CRITICAL FIX: Pass initialElements to useKonvaCanvas for proper processing
  console.log('🎨 [AdvancedDesignEditor] Initializing with elements:', initialElements);
  const canvasHook = useKonvaCanvas(initialElements, DEFAULT_CUSTOMIZATION_AREAS);
  // ✅ FIX: Initialize history with empty array, will be populated after canvas processes elements
  const historyHook = useKonvaHistory([]);
  
  const [productColorFilter, setProductColorFilter] = useState(initialProductColor);
  const [showShapeCreator, setShowShapeCreator] = useState(false);

  // Update product color when initialProductColor changes
  useEffect(() => {
    if (initialProductColor && initialProductColor !== '#ffffff') {
      setProductColorFilter(initialProductColor);
    }
  }, [initialProductColor]);

  // ✅ CRITICAL FIX: Initialize history after canvas processes elements
  useEffect(() => {
    if (canvasHook.elements.length > 0) {
      console.log('🔄 [AdvancedDesignEditor] Initializing history with processed elements:', canvasHook.elements.length);
      historyHook.initializeHistory(canvasHook.elements);
    }
  }, [canvasHook.elements.length]); // Only trigger when elements are first loaded

  // ==================== PRODUCT IMAGE ====================
  const productImageUrl = product?.mainImage || product?.image || product?.images?.[0];
  const [productImage] = useImage(productImageUrl, 'anonymous');
  
  // Create color mask for product
  const [colorMaskImage, setColorMaskImage] = useState(null);
  
  useEffect(() => {
    if (productImage && productColorFilter && productColorFilter !== '#ffffff') {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = productImage.width;
      canvas.height = productImage.height;
      
      ctx.drawImage(productImage, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = productColorFilter;
      
      for (let i = 0; i < data.length; i += 4) {
        const alpha = data[i + 3];
        if (alpha > 0) {
          const x = (i / 4) % canvas.width;
          const y = Math.floor((i / 4) / canvas.width);
          ctx.fillRect(x, y, 1, 1);
        }
      }
      
      const maskImg = new Image();
      maskImg.onload = () => setColorMaskImage(maskImg);
      maskImg.src = canvas.toDataURL();
    } else {
      setColorMaskImage(null);
    }
  }, [productImage, productColorFilter]);
  
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
      const x = area.position?.x || area.x || 0;
      const y = area.position?.y || area.y || 0;
      const width = area.position?.width || area.width || 200;
      const height = area.position?.height || area.height || 100;
      
      return {
        ...area,
        id: area._id || area.id || `area-${index}`,
        scaledPosition: { x, y, width, height }
      };
    });
  }, [product?.customizationAreas]);

  // ==================== ELEMENT HANDLERS ====================
  const addTextElement = useCallback(() => {
    const textElement = elementFactory.createTextElement({
      text: 'Nuevo Texto',
      x: 100,
      y: 100,
      fontSize: 24,
      fill: '#000000',
      fontFamily: 'Arial',
      draggable: true,
      listening: true
    });
    
    console.log('🎨 [AdvancedDesignEditor] Adding text element:', textElement);
    canvasHook.addElement(textElement);
    canvasHook.selectElement(textElement.id);
    historyHook.addToHistory(canvasHook.elements, 'add_text');
  }, [canvasHook, historyHook]);

  const addShapeElement = useCallback((shapeType, properties) => {
    // ✅ MATCH PRIVATE ADMIN: Create shape element directly like private admin
    console.log('🎨 [AdvancedDesignEditor] Creating shape:', {
      shapeType,
      hasPoints: !!properties.points,
      pointsLength: properties.points?.length,
      customizationAreasCount: customizationAreas.length,
      firstAreaId: customizationAreas.length > 0 ? customizationAreas[0].id : null,
      properties
    });
    
    const shapeElement = {
      id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: shapeType, // ✅ CRITICAL: Use shapeType as type (like private admin)
      shapeType, // Keep for reference
      x: properties.x || 150,
      y: properties.y || 150,
      ...properties, // ✅ CRITICAL: Spread properties AFTER position (preserves points)
      areaId: customizationAreas.length > 0 ? customizationAreas[0].id : null,
      draggable: true,
      visible: true,
      listening: true
    };
    
    console.log('🎨 [AdvancedDesignEditor] Created shape element:', {
      id: shapeElement.id,
      type: shapeElement.type,
      shapeType: shapeElement.shapeType,
      x: shapeElement.x,
      y: shapeElement.y,
      hasPoints: !!shapeElement.points,
      pointsLength: shapeElement.points?.length,
      points: shapeElement.points,
      fill: shapeElement.fill,
      stroke: shapeElement.stroke,
      strokeWidth: shapeElement.strokeWidth
    });
    
    canvasHook.addElement(shapeElement);
    canvasHook.selectElement(shapeElement.id);
    historyHook.addToHistory(canvasHook.elements, 'add_shape');
  }, [canvasHook, historyHook]);

  const addCustomShapeElement = useCallback((points, properties) => {
    const minX = Math.min(...points.filter((_, i) => i % 2 === 0));
    const minY = Math.min(...points.filter((_, i) => i % 2 === 1));
    const maxX = Math.max(...points.filter((_, i) => i % 2 === 0));
    const maxY = Math.max(...points.filter((_, i) => i % 2 === 1));
    
    const relativePoints = points.map((point, index) => {
      if (index % 2 === 0) {
        return point - minX;
      } else {
        return point - minY;
      }
    });
    
    // ✅ MATCH PRIVATE ADMIN: Create custom shape directly
    const customShapeElement = {
      id: `shape-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'shape', // ✅ CRITICAL FIX: Use 'shape' as type (matches backend enum and private admin)
      shapeType: 'custom',
      points: relativePoints,
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      closed: true,
      ...properties,
      areaId: customizationAreas.length > 0 ? customizationAreas[0].id : null,
      draggable: true,
      visible: true,
      listening: true
    };
    
    canvasHook.addElement(customShapeElement);
    canvasHook.selectElement(customShapeElement.id);
    historyHook.addToHistory(canvasHook.elements, 'add_custom_shape');
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
          const newElement = elementFactory.createImageElement({
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

  const handleStageDragStart = useCallback((e) => {
    // Only allow stage panning when clicking on empty space
    const clickedOnEmpty = e.target === e.target.getStage() || 
                          e.target.getClassName() === 'Layer';
    
    if (!clickedOnEmpty) {
      // Clicked on an element, prevent stage from dragging
      e.target.getStage().stopDrag();
    }
  }, []);

  const handleElementClick = useCallback((elementId, e) => {
    if (e) {
      e.cancelBubble = true;
    }
    canvasHook.selectElement(elementId);
  }, [canvasHook]);

  const handleDragEnd = useCallback((elementId, e) => {
    const x = Math.round(e.target.x());
    const y = Math.round(e.target.y());
    
    canvasHook.updateElement(elementId, { x, y });
    historyHook.addToHistory(canvasHook.elements, 'move');
  }, [canvasHook, historyHook]);

  const duplicateSelectedElement = useCallback(() => {
    if (canvasHook.selectedElementIds.length === 1) {
      const duplicatedId = canvasHook.duplicateElement(canvasHook.selectedElementIds[0]);
      if (duplicatedId) {
        historyHook.addToHistory(canvasHook.elements, 'duplicate');
      }
    }
  }, [canvasHook, historyHook]);

  const deleteSelectedElement = useCallback(() => {
    if (canvasHook.selectedElementIds.length > 0) {
      canvasHook.removeSelectedElements();
      historyHook.addToHistory(canvasHook.elements, 'delete');
    }
  }, [canvasHook, historyHook]);

  const handleTransformEnd = useCallback((elementId, node) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    const element = canvasHook.elements.find(el => el.id === elementId);
    if (!element) return;
    
    let newAttrs = {
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      rotation: Math.round(node.rotation())
    };
    
    // ✅ REVERT TO SIMPLER APPROACH: Handle shapes with proper scaling
    if (element.type === 'shape' || ['triangle', 'pentagon', 'hexagon', 'octagon', 'star', 'heart', 'diamond', 'polygon', 'custom', 'line', 'customShape', 'path'].includes(element.type)) {
      // For shapes with points, we need to scale the points properly
      if (element.points && Array.isArray(element.points)) {
        // ✅ CRITICAL FIX: Scale the points array properly
        const scaledPoints = element.points.map((point, index) => {
          if (index % 2 === 0) {
            // X coordinates
            return point * scaleX;
          } else {
            // Y coordinates  
            return point * scaleY;
          }
        });
        newAttrs.points = scaledPoints;
        
        console.log('🔺 [AdvancedDesignEditor] Scaling shape points:', {
          elementId,
          type: element.type,
          originalPoints: element.points,
          scaledPoints,
          scaleX,
          scaleY
        });
      } else if (element.radius) {
        // For shapes with radius (like regular polygons)
        newAttrs.radius = Math.max(10, Math.round(element.radius * Math.max(scaleX, scaleY)));
      } else {
        // Fallback for other shape properties
        newAttrs.width = Math.max(10, Math.round((element.width || 100) * scaleX));
        newAttrs.height = Math.max(10, Math.round((element.height || 100) * scaleY));
      }
      
      node.scaleX(1);
      node.scaleY(1);
    } else if (element.type === 'rect' || element.type === 'square') {
      // Handle rectangles and squares
      newAttrs.width = Math.max(10, Math.round((node.width() || element.width || 100) * scaleX));
      newAttrs.height = Math.max(10, Math.round((node.height() || element.height || 100) * scaleY));
      
      node.scaleX(1);
      node.scaleY(1);
    // ✅ CIRCLES AND ELLIPSES: Now have individual transform handlers, removed from global handler
    } else if (element.type === 'text') {
      const newFontSize = Math.max(8, Math.round((element.fontSize || 24) * Math.max(scaleX, scaleY)));
      newAttrs.fontSize = newFontSize;
      
      node.scaleX(1);
      node.scaleY(1);
    } else if (element.type === 'image') {
      newAttrs.width = Math.max(10, Math.round((element.width || 100) * scaleX));
      newAttrs.height = Math.max(10, Math.round((element.height || 100) * scaleY));
      
      node.scaleX(1);
      node.scaleY(1);
    }
    
    canvasHook.updateElement(elementId, newAttrs);
    historyHook.addToHistory(canvasHook.elements, 'transform');
  }, [canvasHook, historyHook]);

  const handleWheelZoom = useCallback((e) => {
    e.evt.preventDefault();
    
    const stage = canvasHook.stageRef.current;
    if (!stage) return;
    
    const oldScale = canvasHook.zoom;
    const pointer = stage.getPointerPosition();
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    
    const direction = e.evt.deltaY > 0 ? -1 : 1;
    const scaleBy = 1.05;
    const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    
    const clampedScale = Math.max(
      CANVAS_CONFIG.minZoom,
      Math.min(CANVAS_CONFIG.maxZoom, newScale)
    );
    
    canvasHook.setZoom(clampedScale);
    
    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };
    
    canvasHook.setCanvasPosition(newPos);
  }, [canvasHook]);

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
    // ✅ MATCH PRIVATE ADMIN: Include all required fields like private admin
    const designData = {
      name: initialDesignName || `Diseño - ${product?.name || 'Sin nombre'}`, // ✅ CRITICAL: Preserve design name
      productId: product?._id || product?.id, // ✅ CRITICAL: Add productId
      elements: canvasHook.elements.map(el => {
        // ✅ MATCH PRIVATE ADMIN: Use ElementFactory.toBackendFormat()
        console.log('🔍 [AdvancedDesignEditor] Converting element:', {
          id: el.id,
          type: el.type,
          shapeType: el.shapeType,
          hasPoints: !!el.points,
          pointsLength: el.points?.length,
          allProps: Object.keys(el)
        });
        
        try {
          const convertedElement = elementFactory.toBackendFormat(el);
          console.log('🔍 [AdvancedDesignEditor] Element converted successfully:', {
            id: convertedElement.id,
            type: convertedElement.type,
            areaId: convertedElement.areaId,
            konvaAttrsKeys: Object.keys(convertedElement.konvaAttrs || {}),
            konvaAttrs: convertedElement.konvaAttrs
          });
          return convertedElement;
        } catch (error) {
          console.error('🚨 [AdvancedDesignEditor] Error converting element:', error, el);
          // Fallback to manual conversion if ElementFactory fails
          const { id, type, areaId, shapeType, imageUrl, ...elementProps } = el;
          
          const konvaAttrs = {
            id,
            ...elementProps
          };
          
          if (type === 'image' && imageUrl) {
            konvaAttrs.image = imageUrl;
          }
          
          return {
            type,
            areaId: areaId || 'default-area',
            shapeType,
            konvaAttrs
          };
        }
      }),
      canvasConfig: CANVAS_CONFIG, // ✅ CRITICAL: Add canvasConfig like private admin
      productColorFilter: productColorFilter !== '#ffffff' ? productColorFilter : null,
      productOptions: [], // ✅ CRITICAL FIX: Add required productOptions array
      // ✅ CRITICAL: Add metadata like private admin
      metadata: {
        editor: 'konva-enhanced',
        version: '2.0.0',
        totalElements: canvasHook.elements.length,
        exportedAt: new Date().toISOString()
      }
    };
    
    console.log('💾 [AdvancedDesignEditor] Final design data being saved:', designData);
    console.log('💾 [AdvancedDesignEditor] Elements summary:', designData.elements.map(el => ({
      id: el.id,
      type: el.type,
      areaId: el.areaId,
      hasKonvaAttrs: !!el.konvaAttrs,
      konvaAttrsKeys: Object.keys(el.konvaAttrs || {}),
      konvaAttrs: {
        x: el.konvaAttrs?.x,
        y: el.konvaAttrs?.y,
        hasPoints: !!el.konvaAttrs?.points,
        pointsLength: el.konvaAttrs?.points?.length,
        pointsPreview: el.konvaAttrs?.points?.slice(0, 4)
      }
    })));
    
    // ✅ SPECIFIC DEBUG: Log ALL shape coordinates
    const allShapes = designData.elements.filter(el => 
      ['triangle', 'pentagon', 'hexagon', 'octagon', 'star', 'heart', 'diamond', 'polygon', 'custom', 'line', 'shape'].includes(el.type) || (el.type === 'shape' && el.shapeType === 'custom')
    );
    if (allShapes.length > 0) {
      console.log('🔶 [SAVE DEBUG] ALL shape coordinates being saved:');
      allShapes.forEach(shape => {
        console.log(`Shape ${shape.type} (${shape.shapeType}):`, {
          type: shape.type,
          shapeType: shape.shapeType,
          position: { x: shape.konvaAttrs.x, y: shape.konvaAttrs.y },
          hasPoints: !!shape.konvaAttrs.points,
          pointsLength: shape.konvaAttrs.points?.length,
          pointsPreview: shape.konvaAttrs.points?.slice(0, 4),
          radius: shape.konvaAttrs.radius,
          sides: shape.konvaAttrs.sides
        });
      });
    }
    onSave(designData);
  }, [canvasHook.elements, productColorFilter, initialDesignName, product, onSave]);

  if (!isOpen) return null;

  return (
    <div className="advanced-design-editor-overlay">
      <div className="advanced-design-editor">
        {/* Header */}
        <div className="editor-header">
          <div className="editor-title">
            <h2>Editor de diseños</h2>
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
              scaleX={canvasHook.zoom}
              scaleY={canvasHook.zoom}
              x={canvasHook.canvasPosition.x}
              y={canvasHook.canvasPosition.y}
              draggable={true}
              onMouseDown={handleCanvasClick}
              onTouchStart={handleCanvasClick}
              onWheel={handleWheelZoom}
              onDragStart={handleStageDragStart}
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

                {/* Product color mask */}
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

                {/* Canvas Elements */}
                {/* ✅ DEBUGGING: Log all elements being rendered */}
                {console.log('🎨 [AdvancedDesignEditor] Rendering elements:', canvasHook.elements.map(el => ({ id: el.id, type: el.type, x: el.x, y: el.y, hasPoints: !!el.points })))}
                {canvasHook.elements.map((element) => {
                  // ✅ CRITICAL FIX: Ensure proper id/name assignment for transformer
                  const commonProps = {
                    id: element.id,
                    name: element.id, // This is critical for transformer to find elements
                    key: element.id,  // React key for proper re-rendering
                    x: element.x || 0,
                    y: element.y || 0,
                    rotation: element.rotation || 0,
                    opacity: element.opacity || 1,
                    visible: element.visible !== false,
                    draggable: true,
                    listening: true,
                    onClick: (e) => {
                      e.cancelBubble = true;
                      handleElementClick(element.id, e);
                    },
                    onTap: (e) => {
                      e.cancelBubble = true;
                      handleElementClick(element.id, e);
                    },
                    onDragEnd: (e) => handleDragEnd(element.id, e),
                    onTransformEnd: (e) => handleTransformEnd(element.id, e.target),
                    onDragStart: (e) => {
                      e.cancelBubble = true;
                      const stage = e.target.getStage();
                      if (stage) {
                        stage.stopDrag();
                      }
                    }
                  };
                  
                  if (element.type === 'image') {
                    // ✅ CRITICAL FIX: Use both imageUrl and image like private admin
                    const imageSource = element.imageUrl || element.image;
                    console.log('🖼️ [AdvancedDesignEditor] Rendering image element:', {
                      id: element.id,
                      hasImageUrl: !!element.imageUrl,
                      hasImage: !!element.image,
                      imageSource: imageSource?.substring(0, 50) + '...'
                    });
                    
                    return (
                      <UrlImage
                        src={imageSource}
                        width={element.width || 200}
                        height={element.height || 150}
                        {...commonProps}
                      />
                    );
                  } else if (['triangle', 'pentagon', 'hexagon', 'octagon', 'star', 'heart', 'diamond', 'polygon', 'custom', 'line', 'shape', 'customShape', 'path'].includes(element.type) || (element.type === 'shape' && element.shapeType === 'custom')) {
                    // ✅ MATCH PRIVATE ADMIN: Direct shape rendering
                    console.log(`🎨 [AdvancedDesignEditor] Rendering shape:`, {
                      type: element.type,
                      shapeType: element.shapeType,
                      hasPoints: !!element.points,
                      pointsLength: element.points?.length,
                      x: element.x,
                      y: element.y
                    });
                    
                    return (
                      <Line
                        {...commonProps}
                        points={element.points || []}
                        fill={element.fill || '#3F2724'}
                        stroke={element.stroke || '#032CA6'}
                        strokeWidth={element.strokeWidth || 2}
                        closed={element.closed !== false}
                        lineCap={element.lineCap || 'round'}
                        lineJoin={element.lineJoin || 'round'}
                        tension={element.tension || 0}
                      />
                    );
                  } else if (element.type === 'rect' || element.type === 'square') {
                    return (
                      <KonvaRect
                        {...commonProps}
                        width={element.width || 100}
                        height={element.height || 100}
                        fill={element.fill || '#3F2724'}
                        stroke={element.stroke || '#032CA6'}
                        strokeWidth={element.strokeWidth || 2}
                        cornerRadius={element.cornerRadius || 0}
                      />
                    );
                  } else if (element.type === 'ellipse') {
                    // ✅ CIRCLE (ELLIPSE): Stretchable circle with full user control
                    return (
                      <KonvaCircle
                        {...commonProps}
                        radius={element.radius || 50}
                        fill={element.fill || '#3F2724'}
                        stroke={element.stroke || '#032CA6'}
                        strokeWidth={element.strokeWidth || 2}
                        scaleX={element.scaleX || 1}
                        scaleY={element.scaleY || 1}
                        onTransformEnd={(e) => {
                          // ✅ CIRCLE FREE TRANSFORM: Apply exact user transform without compounding
                          const node = e.target;
                          const transformScaleX = node.scaleX();
                          const transformScaleY = node.scaleY();
                          const rotation = node.rotation();
                          
                          // Reset node scale immediately
                          node.scaleX(1);
                          node.scaleY(1);
                          
                          // ✅ Apply transform scales directly - user gets exactly what they drag
                          const newScaleX = transformScaleX;
                          const newScaleY = transformScaleY;
                          
                          canvasHook.updateElement(element.id, {
                            x: node.x(),
                            y: node.y(),
                            scaleX: newScaleX,
                            scaleY: newScaleY,
                            rotation: rotation
                          });
                          
                          console.log('🔵 [AdvancedDesignEditor] Circle transformed:', {
                            elementId: element.id,
                            newScaleX,
                            newScaleY,
                            isCircular: Math.abs(newScaleX - newScaleY) < 0.05,
                            userControlled: true
                          });
                          
                          historyHook.addToHistory(canvasHook.elements, 'transform');
                        }}
                      />
                    );
                  } else if (element.type === 'text') {
                    return (
                      <KonvaText
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
                  }
                  
                  // ✅ DEBUGGING: Log unsupported element types
                  console.warn(`🚨 [AdvancedDesignEditor] Unsupported element type: ${element.type}`, element);
                  return null;
                })}

                {/* Transformer for selected elements */}
                <Transformer
                  ref={canvasHook.transformerRef}
                  boundBoxFunc={(oldBox, newBox) => {
                    // ✅ CRITICAL FIX: Better bounds checking for circles
                    const selectedElement = canvasHook.elements.find(el => 
                      canvasHook.selectedElementIds.includes(el.id)
                    );
                    
                    if (selectedElement?.type === 'circle') {
                      // For circles, ensure minimum radius equivalent
                      const minSize = 20; // Minimum diameter
                      if (newBox.width < minSize || newBox.height < minSize) {
                        return oldBox;
                      }
                      // Force square bounds for circles to maintain shape
                      const size = Math.max(newBox.width, newBox.height);
                      return {
                        ...newBox,
                        width: size,
                        height: size
                      };
                    }
                    
                    // Default bounds checking
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
                    e.cancelBubble = true;
                  }}
                  onTouchStart={(e) => {
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
            Guardar diseño
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