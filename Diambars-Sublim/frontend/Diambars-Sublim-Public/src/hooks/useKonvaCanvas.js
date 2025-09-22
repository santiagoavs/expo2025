// hooks/useKonvaCanvas.js - CANVAS STATE MANAGEMENT HOOK (CSS VERSION)
import { useState, useRef, useCallback, useEffect } from 'react';
import { CANVAS_CONFIG, CanvasUtils } from '../utils/canvasConfig';
import { debounce } from '../utils/helpers';

export const useKonvaCanvas = (initialElements = [], customizationAreas = []) => {
  // ==================== STATE ====================
  const [elements, setElements] = useState(initialElements);
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
    if (transformerRef.current && stageRef.current) {
      console.log('Updating transformer for selected elements:', selectedElementIds);
      
      if (selectedElementIds.length === 0) {
        // Clear transformer if no elements selected
        transformerRef.current.nodes([]);
        transformerRef.current.getLayer()?.batchDraw();
        return;
      }
      
      // Find selected nodes using both id and name attributes
      const selectedNodes = selectedElementIds
        .map(id => {
          // Try finding by name first (more reliable), then by id
          let node = stageRef.current.findOne(node => node.name() === id);
          if (!node) {
            node = stageRef.current.findOne(`#${id}`);
          }
          console.log(`Finding element ${id}:`, node ? 'found' : 'not found');
          return node;
        })
        .filter(Boolean);
      
      console.log('Selected nodes for transformer:', selectedNodes.length);
      
      if (selectedNodes.length > 0) {
        transformerRef.current.nodes(selectedNodes);
        transformerRef.current.getLayer()?.batchDraw();
        
        // Force transformer to update its position
        transformerRef.current.forceUpdate();
      }
    }
  }, [selectedElementIds]);

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
