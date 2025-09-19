// hooks/useCanvasCentering.js
// Hook compartido para centrado y escalado del canvas

import { useState, useEffect, useCallback } from 'react';
import { CANVAS_CONFIG } from '../../KonvaDesignEditor/constants/canvasConfig';

export const useCanvasCentering = (image, containerRef) => {
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

  // Calcular zoom y centrado para usar toda la superficie disponible
  useEffect(() => {
    if (image && containerRef.current) {
      const container = containerRef.current;
      // ✅ CORREGIDO: Usar todo el espacio disponible del contenedor
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      
      // ✅ MEJORADO: Calcular escala para maximizar el uso del contenedor
      const scaleX = containerWidth / CANVAS_CONFIG.width;
      const scaleY = containerHeight / CANVAS_CONFIG.height;
      const initialScale = Math.min(scaleX, scaleY);
      
      // ✅ NUEVO: Aplicar un factor de ajuste para usar más espacio
      const adjustedScale = initialScale * 0.95; // Usar 95% del espacio disponible
      
      setStageScale(adjustedScale);
      
      // Centrar perfectamente el stage en el contenedor
      const scaledWidth = CANVAS_CONFIG.width * adjustedScale;
      const scaledHeight = CANVAS_CONFIG.height * adjustedScale;
      const centerX = (containerWidth - scaledWidth) / 2;
      const centerY = (containerHeight - scaledHeight) / 2;
      
      setStagePosition({ x: centerX, y: centerY });
      
      console.log('📐 [useCanvasCentering] Canvas optimizado para máximo uso del espacio:', {
        containerSize: { width: containerWidth, height: containerHeight },
        stageSize: { width: CANVAS_CONFIG.width, height: CANVAS_CONFIG.height },
        rawScale: initialScale,
        adjustedScale: adjustedScale,
        scaledSize: { width: scaledWidth, height: scaledHeight },
        position: { x: centerX, y: centerY },
        coverage: `${Math.round((scaledWidth / containerWidth) * 100)}% x ${Math.round((scaledHeight / containerHeight) * 100)}%`
      });
    }
  }, [image, containerRef]);

  const handleWheel = useCallback((e) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    
    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(3, newScale));
    
    setStageScale(clampedScale);
    setStagePosition({
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    });
  }, []);

  const zoomIn = useCallback(() => {
    setStageScale(prev => Math.min(3, prev * 1.2));
  }, []);

  const zoomOut = useCallback(() => {
    setStageScale(prev => Math.max(0.1, prev / 1.2));
  }, []);

  const resetZoom = useCallback(() => {
    setStageScale(1);
    setStagePosition({ x: 0, y: 0 });
  }, []);

  return {
    stageScale,
    stagePosition,
    setStageScale,
    setStagePosition,
    handleWheel,
    zoomIn,
    zoomOut,
    resetZoom
  };
};
