// hooks/useKonvaCanvas.js - CANVAS STATE MANAGEMENT HOOK (CSS VERSION)
import { useState, useRef, useCallback, useEffect } from 'react';
import { CANVAS_CONFIG, CanvasUtils } from '../utils/canvasConfig';
import { debounce } from '../utils/helpers';

export const useKonvaCanvas = (initialElements = [], customizationAreas = []) => {
  // ==================== STATE ====================
  const [elements, setElements] = useState([]);
  const [selectedElementIds, setSelectedElementIds] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransforming, setIsTransforming] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: CANVAS_CONFIG.width, height: CANVAS_CONFIG.height });
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(CANVAS_CONFIG.defaultZoom);
  
  // ==================== REFS ====================
  const stageRef = useRef(null);
  const layerRef = useRef(null);
  const containerRef = useRef(null);
  const transformerRef = useRef(null);
  
  // ==================== INITIALIZATION FROM DESIGN DATA ====================
  // ✅ CRITICAL FIX: Process backend format elements like private admin
  useEffect(() => {
    console.log('🔄 [useKonvaCanvas] Processing initial elements:', initialElements);
    
    if (initialElements && initialElements.length > 0) {
      const processedElements = initialElements.map(el => {
        // Handle both backend format (with konvaAttrs) and direct format
        if (el.konvaAttrs) {
          // Backend format - extract konvaAttrs like private admin
          console.log('🔄 [useKonvaCanvas] Processing backend format element:', {
            id: el._id || el.id,
            type: el.type,
            areaId: el.areaId,
            konvaAttrsKeys: Object.keys(el.konvaAttrs)
          });
          
          return {
            id: el._id || el.id || `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: el.type,
            areaId: el.areaId,
            ...el.konvaAttrs, // ✅ CRITICAL: Extract all properties from konvaAttrs
            draggable: true,
            listening: true
          };
        } else {
          // Direct format - already processed
          console.log('🔄 [useKonvaCanvas] Processing direct format element:', {
            id: el.id,
            type: el.type,
            hasPoints: !!el.points
          });
          
          return {
            ...el,
            id: el.id || `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            draggable: true,
            listening: true
          };
        }
      });
      
      console.log('🔄 [useKonvaCanvas] Final processed elements:', processedElements.map(el => ({
        id: el.id,
        type: el.type,
        x: el.x,
        y: el.y,
        hasPoints: !!el.points,
        pointsLength: el.points?.length
      })));
      
      setElements(processedElements);
    } else {
      console.log('🔄 [useKonvaCanvas] No initial elements to process');
      setElements([]);
    }
  }, [initialElements]);
  
  // ==================== ELEMENT MANAGEMENT ====================
  const addElement = useCallback((element) => {
    setElements(prev => [...prev, element]);
  }, []);
  
  const updateElement = useCallback((elementId, updates) => {
    setElements(prev => 
      prev.map(el => 
        el.id === elementId ? { ...el, ...updates } : el
      )
    );
  }, []);
  
  const removeElement = useCallback((elementId) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    setSelectedElementIds(prev => prev.filter(id => id !== elementId));
  }, []);
  
  const removeSelectedElements = useCallback(() => {
    setElements(prev => prev.filter(el => !selectedElementIds.includes(el.id)));
    setSelectedElementIds([]);
  }, [selectedElementIds]);
  
  const duplicateElement = useCallback((elementId) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      const duplicated = {
        ...element,
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        x: (element.x || 0) + 20,
        y: (element.y || 0) + 20
      };
      addElement(duplicated);
      return duplicated.id;
    }
  }, [elements, addElement]);
  
  // ==================== SELECTION MANAGEMENT ====================
  const selectElement = useCallback((elementId, multiSelect = false) => {
    if (multiSelect) {
      setSelectedElementIds(prev => 
        prev.includes(elementId) 
          ? prev.filter(id => id !== elementId)
          : [...prev, elementId]
      );
    } else {
      setSelectedElementIds([elementId]);
    }
  }, []);
  
  const selectMultipleElements = useCallback((elementIds) => {
    setSelectedElementIds(elementIds);
  }, []);
  
  const clearSelection = useCallback(() => {
    setSelectedElementIds([]);
  }, []);
  
  const selectAll = useCallback(() => {
    setSelectedElementIds(elements.map(el => el.id));
  }, [elements]);
  
  // ==================== ZOOM & PAN ====================
  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, CANVAS_CONFIG.maxZoom));
  }, []);
  
  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, CANVAS_CONFIG.minZoom));
  }, []);
  
  const zoomToFit = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    const newZoom = CanvasUtils.calculateZoomToFit(
      canvasSize.width,
      canvasSize.height,
      containerWidth - 40, // Padding
      containerHeight - 40
    );
    
    setZoom(newZoom);
    
    // Center the canvas
    const newPosition = CanvasUtils.centerCanvas(
      canvasSize.width,
      canvasSize.height,
      containerWidth,
      containerHeight,
      newZoom
    );
    
    setCanvasPosition(newPosition);
  }, [canvasSize]);
  
  const resetZoom = useCallback(() => {
    setZoom(CANVAS_CONFIG.defaultZoom);
    setCanvasPosition({ x: 0, y: 0 });
  }, []);
  
  // ==================== CANVAS UTILITIES ====================
  const getStagePointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    
    return stage.getPointerPosition();
  }, []);
  
  const getRelativePointerPosition = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return { x: 0, y: 0 };
    
    const transform = stage.getAbsoluteTransform().copy();
    transform.invert();
    
    const pos = stage.getPointerPosition();
    return transform.point(pos);
  }, []);
  
  // ==================== RESPONSIVE HANDLING ====================
  const updateCanvasSize = useCallback(() => {
    if (!containerRef.current) return;
    
    const container = containerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    
    const newSize = CanvasUtils.getResponsiveCanvasSize(
      containerWidth,
      containerHeight
    );
    
    setCanvasSize(newSize);
  }, []);
  
  // Debounced resize handler
  const debouncedResize = useCallback(
    debounce(updateCanvasSize, 250),
    [updateCanvasSize]
  );
  
  // ==================== ELEMENT POSITIONING ====================
  const moveElement = useCallback((elementId, newPosition) => {
    // Apply snapping if enabled
    const snappedPosition = CANVAS_CONFIG.snap.enabled 
      ? CanvasUtils.snapToGrid(newPosition.x, newPosition.y)
      : newPosition;
    
    // For custom shapes, ensure we maintain the points array integrity
    const element = elements.find(el => el.id === elementId);
    if (element && element.type === 'shape' && element.shapeType === 'custom') {
      console.log('🎯 Moving custom shape:', {
        id: elementId,
        oldPosition: { x: element.x, y: element.y },
        newPosition: snappedPosition,
        points: element.points
      });
    }
    
    updateElement(elementId, snappedPosition);
  }, [updateElement]);
  
  const moveSelectedElements = useCallback((deltaX, deltaY) => {
    selectedElementIds.forEach(elementId => {
      const element = elements.find(el => el.id === elementId);
      if (element) {
        moveElement(elementId, {
          x: (element.x || 0) + deltaX,
          y: (element.y || 0) + deltaY
        });
      }
    });
  }, [selectedElementIds, elements, moveElement]);
  
  // ==================== LAYER MANAGEMENT ====================
  const bringToFront = useCallback((elementId) => {
    setElements(prev => {
      const element = prev.find(el => el.id === elementId);
      if (!element) return prev;
      
      const others = prev.filter(el => el.id !== elementId);
      return [...others, element];
    });
  }, []);
  
  const sendToBack = useCallback((elementId) => {
    setElements(prev => {
      const element = prev.find(el => el.id === elementId);
      if (!element) return prev;
      
      const others = prev.filter(el => el.id !== elementId);
      return [element, ...others];
    });
  }, []);
  
  const moveLayer = useCallback((elementId, direction) => {
    setElements(prev => {
      const currentIndex = prev.findIndex(el => el.id === elementId);
      if (currentIndex === -1) return prev;
      
      let newIndex;
      if (direction === 'up') {
        newIndex = Math.min(currentIndex + 1, prev.length - 1);
      } else {
        newIndex = Math.max(currentIndex - 1, 0);
      }
      
      if (newIndex === currentIndex) return prev;
      
      const newElements = [...prev];
      const [element] = newElements.splice(currentIndex, 1);
      newElements.splice(newIndex, 0, element);
      
      return newElements;
    });
  }, []);
  
  // ==================== EFFECTS ====================
  useEffect(() => {
    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, [debouncedResize]);
  
  useEffect(() => {
    updateCanvasSize();
  }, [updateCanvasSize]);
  
  // Update transformer when selection changes
  useEffect(() => {
    if (transformerRef.current && stageRef.current && layerRef.current) {
      console.log('🔧 [useKonvaCanvas] Updating transformer for selected elements:', selectedElementIds);
      
      if (selectedElementIds.length === 0) {
        // Clear transformer if no elements selected
        transformerRef.current.nodes([]);
        layerRef.current.batchDraw();
        return;
      }
      
      // ✅ CRITICAL FIX: Use a more reliable node finding approach
      // Wait for next tick to ensure elements are rendered
      setTimeout(() => {
        const selectedNodes = selectedElementIds
          .map(id => {
            // Try multiple approaches to find the node
            let node = null;
            
            // Method 1: Find by name attribute
            node = stageRef.current.findOne(`.${id}`);
            if (node) {
              console.log(`🎯 Found element ${id} by class name`);
              return node;
            }
            
            // Method 2: Find by id attribute  
            node = stageRef.current.findOne(`#${id}`);
            if (node) {
              console.log(`🎯 Found element ${id} by id`);
              return node;
            }
            
            // Method 3: Find by name() method
            node = stageRef.current.findOne(node => node.name() === id);
            if (node) {
              console.log(`🎯 Found element ${id} by name() method`);
              return node;
            }
            
            // Method 4: Search through layer children directly
            const layerChildren = layerRef.current.getChildren();
            node = layerChildren.find(child => 
              child.id() === id || 
              child.name() === id ||
              child.attrs.id === id ||
              child.attrs.name === id
            );
            
            if (node) {
              console.log(`🎯 Found element ${id} by direct layer search`);
              return node;
            }
            
            console.warn(`❌ Could not find element ${id} in stage`);
            return null;
          })
          .filter(Boolean);
        
        console.log('🔧 [useKonvaCanvas] Selected nodes for transformer:', selectedNodes.length, 'out of', selectedElementIds.length);
        
        if (selectedNodes.length > 0) {
          transformerRef.current.nodes(selectedNodes);
          layerRef.current.batchDraw();
          
          // Force transformer to update its position
          transformerRef.current.forceUpdate();
        } else {
          console.warn('❌ No nodes found for transformer, clearing selection');
          transformerRef.current.nodes([]);
          layerRef.current.batchDraw();
        }
      }, 10); // Small delay to ensure rendering is complete
    }
  }, [selectedElementIds, elements.length]); // Also depend on elements.length to update when elements change

  return {
    // State
    elements,
    selectedElementIds,
    zoom,
    canvasPosition,
    canvasSize,
    isDragging,
    isTransforming,
    
    // Refs
    stageRef,
    layerRef,
    containerRef,
    transformerRef,
    
    // Element management
    addElement,
    updateElement,
    removeElement,
    removeSelectedElements,
    duplicateElement,
    setElements,
    
    // Selection
    selectElement,
    selectMultipleElements,
    clearSelection,
    selectAll,
    
    // Zoom & Pan
    zoomIn,
    zoomOut,
    zoomToFit,
    resetZoom,
    setZoom,
    setCanvasPosition,
    
    // Utilities
    getStagePointerPosition,
    getRelativePointerPosition,
    updateCanvasSize,
    
    // Positioning
    moveElement,
    moveSelectedElements,
    
    // Layers
    bringToFront,
    sendToBack,
    moveLayer,
    
    // State setters
    setIsDragging,
    setIsTransforming
  };
};