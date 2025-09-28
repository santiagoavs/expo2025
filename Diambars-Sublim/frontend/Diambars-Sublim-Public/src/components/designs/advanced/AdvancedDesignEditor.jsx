// src/components/designs/advanced/AdvancedDesignEditor.jsx - MODERNIZED DESIGN EDITOR (CSS VERSION)
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Stage, Layer, Image as KonvaImage, Text as KonvaText, Rect as KonvaRect, Circle as KonvaCircle, Transformer } from 'react-konva';
import useImage from 'use-image';

// Import modular system
import { useKonvaCanvas } from '../../../hooks/useKonvaCanvas';
import { useKonvaHistory } from '../../../hooks/useKonvaHistory';
import { elementFactory } from '../../../services/ElementFactory';
import { validationService } from '../../../services/ValidationService';
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
  console.log('UrlImage - src:', src, 'image loaded:', !!image);
  
  if (!image) {
    console.log('UrlImage - No image loaded for src:', src);
    return null;
  }
  
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

  // Update product color when initialProductColor changes
  useEffect(() => {
    if (initialProductColor && initialProductColor !== '#ffffff') {
      console.log('AdvancedDesignEditor - Setting product color:', initialProductColor);
      setProductColorFilter(initialProductColor);
    }
  }, [initialProductColor]);

  // Debug logging for initial data
  useEffect(() => {
    console.log('AdvancedDesignEditor - Initial Elements:', initialElements);
    console.log('AdvancedDesignEditor - Initial Product Color:', initialProductColor);
    console.log('AdvancedDesignEditor - Canvas Elements:', canvasHook.elements);
  }, [initialElements, initialProductColor, canvasHook.elements]);

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
    const textElement = elementFactory.createText({
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
    historyHook.addToHistory(canvasHook.elements, 'add');
  }, [canvasHook, historyHook]);

  const addShapeElement = useCallback((shapeType, properties) => {
    const shapeElement = createShapeElement(shapeType, {
      x: 150,
      y: 150,
      ...properties
    });
    
    canvasHook.addElement(shapeElement);
    historyHook.addToHistory(canvasHook.elements, 'add');
  }, [canvasHook, historyHook]);

  const addCustomShapeElement = useCallback((points, properties) => {
    // Calculate bounding box of the custom shape to determine proper position
    const minX = Math.min(...points.filter((_, i) => i % 2 === 0));
    const minY = Math.min(...points.filter((_, i) => i % 2 === 1));
    const maxX = Math.max(...points.filter((_, i) => i % 2 === 0));
    const maxY = Math.max(...points.filter((_, i) => i % 2 === 1));
    
    // Convert absolute points to relative points (relative to element position)
    const relativePoints = points.map((point, index) => {
      if (index % 2 === 0) {
        // X coordinate - make relative to minX
        return point - minX;
      } else {
        // Y coordinate - make relative to minY
        return point - minY;
      }
    });
    
    const customShapeElement = createShapeElement('custom', {
      points: relativePoints,
      x: minX, // Use actual position from bounding box
      y: minY, // Use actual position from bounding box
      width: maxX - minX,
      height: maxY - minY,
      ...properties
    });
    
    console.log('🎯 Creating custom shape with:', {
      originalPoints: points,
      relativePoints: relativePoints,
      position: { x: minX, y: minY },
      dimensions: { width: maxX - minX, height: maxY - minY }
    });
    
    canvasHook.addElement(customShapeElement);
    historyHook.addToHistory(canvasHook.elements, 'add');
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
          setActiveTool('select');
        };
        reader.readAsDataURL(file);
      }
    };
    
    input.click();
  }, [customizationAreas, canvasHook, historyHook]);


  // ==================== EVENT HANDLERS ====================
  const handleCanvasClick = useCallback((e) => {
    // Only clear selection if clicking on the stage itself (empty area)
    if (e.target === e.target.getStage() || e.target.getClassName() === 'Layer') {
      console.log('🖱️ Canvas clicked - clearing selection');
      canvasHook.clearSelection();
    }
  }, [canvasHook]);

  const handleStageDragStart = useCallback((e) => {
    // Only allow panning when clicking on empty space (not on elements)
    if (e.target === e.target.getStage()) {
      canvasHook.setIsDragging(true);
    }
  }, [canvasHook]);

  const handleStageDragEnd = useCallback(() => {
    canvasHook.setIsDragging(false);
  }, [canvasHook]);

  const handleStageMouseMove = useCallback((e) => {
    if (!canvasHook.isDragging) return;
    
    const stage = e.target.getStage();
    const newPos = {
      x: stage.x(),
      y: stage.y()
    };
    
    canvasHook.setCanvasPosition(newPos);
  }, [canvasHook]);

  const handleElementClick = useCallback((elementId, e) => {
    e.cancelBubble = true;
    e.evt.stopPropagation();
    console.log('🖱️ Element clicked:', elementId);
    canvasHook.selectElement(elementId, e.evt.ctrlKey || e.evt.metaKey);
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
    
    // Get the element to determine its type
    const element = canvasHook.elements.find(el => el.id === elementId);
    if (!element) return;
    
    let newAttrs = {
      x: Math.round(node.x()),
      y: Math.round(node.y()),
      rotation: Math.round(node.rotation())
    };
    
    // Handle different element types differently
    if (element.type === 'shape' && (element.shapeType === 'custom' || element.shapeType === 'line')) {
      // For custom shapes (Line components with points), scale the points array
      if (element.points && Array.isArray(element.points)) {
        const scaledPoints = element.points.map((point, index) => {
          if (index % 2 === 0) {
            // X coordinate - scale relative to element position
            return point * scaleX;
          } else {
            // Y coordinate - scale relative to element position
            return point * scaleY;
          }
        });
        newAttrs.points = scaledPoints;
        
        // Update element dimensions based on scaled points
        const minX = Math.min(...scaledPoints.filter((_, i) => i % 2 === 0));
        const minY = Math.min(...scaledPoints.filter((_, i) => i % 2 === 1));
        const maxX = Math.max(...scaledPoints.filter((_, i) => i % 2 === 0));
        const maxY = Math.max(...scaledPoints.filter((_, i) => i % 2 === 1));
        
        newAttrs.width = maxX - minX;
        newAttrs.height = maxY - minY;
      }
      
      // Reset the node's scale to prevent accumulation
      node.scaleX(1);
      node.scaleY(1);
    } else if (element.type === 'shape' || element.type === 'rect' || element.type === 'circle') {
      // For regular shapes, update width/height and reset scale
      newAttrs.width = Math.max(10, Math.round((node.width() || element.width || 100) * scaleX));
      newAttrs.height = Math.max(10, Math.round((node.height() || element.height || 100) * scaleY));
      
      // Reset the node's scale to prevent accumulation
      node.scaleX(1);
      node.scaleY(1);
    } else if (element.type === 'text') {
      // For text, update fontSize instead of width/height
      const newFontSize = Math.max(8, Math.round((element.fontSize || 24) * Math.max(scaleX, scaleY)));
      newAttrs.fontSize = newFontSize;
      
      // Reset scale
      node.scaleX(1);
      node.scaleY(1);
    } else if (element.type === 'image') {
      // For images, update width/height
      newAttrs.width = Math.max(10, Math.round((element.width || 100) * scaleX));
      newAttrs.height = Math.max(10, Math.round((element.height || 100) * scaleY));
      
      // Reset scale
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
    
    // Clamp zoom to min/max values
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
        
        // For custom shapes, ensure points and position are properly saved
        if (type === 'shape' && shapeType === 'custom' && el.points) {
          konvaAttrs.points = [...el.points]; // Ensure points array is preserved
          konvaAttrs.x = el.x || 0;
          konvaAttrs.y = el.y || 0;
          konvaAttrs.width = el.width;
          konvaAttrs.height = el.height;
          
          console.log('💾 Saving custom shape:', {
            id: el.id,
            points: el.points,
            position: { x: el.x, y: el.y },
            dimensions: { width: el.width, height: el.height }
          });
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
              onDragEnd={handleStageDragEnd}
              onDragMove={handleStageMouseMove}
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

                {/* Canvas Elements */}
                {canvasHook.elements.map((element) => {
                  console.log('Rendering element:', element);
                  
                  // Extract properties from konvaAttrs if they exist
                  const konvaAttrs = element.konvaAttrs || {};
                  const metadata = element.metadata || {};
                  
                  const commonProps = {
                    id: element.id,
                    name: element.id,
                    x: konvaAttrs.x || element.x || 0,
                    y: konvaAttrs.y || element.y || 0,
                    rotation: konvaAttrs.rotation || element.rotation || 0,
                    opacity: konvaAttrs.opacity || element.opacity || 1,
                    visible: element.visible !== false,
                    draggable: element.draggable !== false,
                    listening: true,
                    onClick: (e) => handleElementClick(element.id, e),
                    onTap: (e) => handleElementClick(element.id, e),
                    onDragEnd: (e) => handleDragEnd(element.id, e),
                    onTransformEnd: (e) => handleTransformEnd(element.id, e.target)
                  };
                  
                  if (element.type === 'image') {
                    console.log('Rendering image element:', element.id);
                    console.log('Full image element:', JSON.stringify(element, null, 2));
                    console.log('konvaAttrs:', JSON.stringify(konvaAttrs, null, 2));
                    console.log('metadata:', JSON.stringify(metadata, null, 2));
                    
                    // Try multiple possible locations for image URL including fill pattern
                    const imageUrl = metadata.imageUrl || 
                                     metadata.src || 
                                     konvaAttrs.src || 
                                     konvaAttrs.imageUrl ||
                                     konvaAttrs.fillPatternImage ||
                                     konvaAttrs.image ||
                                     element.imageUrl || 
                                     element.src ||
                                     element.url ||
                                     element.image;
                    
                    console.log('Image URL extracted:', imageUrl);
                    console.log('All possible URL fields:', {
                      'metadata.imageUrl': metadata.imageUrl,
                      'metadata.src': metadata.src,
                      'konvaAttrs.src': konvaAttrs.src,
                      'konvaAttrs.imageUrl': konvaAttrs.imageUrl,
                      'konvaAttrs.fillPatternImage': konvaAttrs.fillPatternImage,
                      'konvaAttrs.image': konvaAttrs.image,
                      'element.imageUrl': element.imageUrl,
                      'element.src': element.src,
                      'element.url': element.url,
                      'element.image': element.image
                    });
                    
                    // Log all konvaAttrs keys to see what properties are available
                    console.log('konvaAttrs keys:', Object.keys(konvaAttrs));
                    console.log('element keys:', Object.keys(element));
                    
                    return (
                      <UrlImage
                        key={element.id}
                        id={element.id}
                        src={imageUrl}
                        width={konvaAttrs.width || element.width || 200}
                        height={konvaAttrs.height || element.height || 150}
                        {...commonProps}
                      />
                    );
                  } else if (element.type === 'shape') {
                    console.log('Rendering shape element:', element.id, element);
                    // Create a normalized element for ShapeRenderer
                    const normalizedElement = {
                      ...element,
                      ...konvaAttrs,
                      shapeType: metadata.shapeType || element.shapeType || 'custom',
                      // Merge konvaAttrs into the element for ShapeRenderer
                      x: konvaAttrs.x || element.x || 0,
                      y: konvaAttrs.y || element.y || 0,
                      width: konvaAttrs.width || element.width,
                      height: konvaAttrs.height || element.height,
                      points: konvaAttrs.points || element.points,
                      fill: konvaAttrs.fill || element.fill,
                      stroke: konvaAttrs.stroke || element.stroke,
                      strokeWidth: konvaAttrs.strokeWidth || element.strokeWidth
                    };
                    console.log('Normalized shape element:', normalizedElement);
                    return (
                      <ShapeRenderer
                        key={element.id}
                        element={normalizedElement}
                        isSelected={canvasHook.selectedElementId === element.id}
                        onSelect={(e) => handleElementClick(element.id, e)}
                        onTransform={(e) => handleTransformEnd(element.id, e.target)}
                      />
                    );
                  } else if (element.type === 'text') {
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
                  }
                  console.log('Unknown element type:', element.type, element);
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
