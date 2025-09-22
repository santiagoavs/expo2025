// hooks/useUnifiedCanvasCentering.js
// Hook unificado para centrado y escalado del canvas - usado por ambos editores

import { useState, useEffect, useCallback } from 'react';
import { CANVAS_CONFIG } from '../constants/canvasConfig';

export const useUnifiedCanvasCentering = (image, containerRef) => {
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });

  // ✅ LÓGICA UNIFICADA: Calcular zoom y centrado para usar toda la superficie disponible
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      // ✅ CORREGIDO: Usar todo el espacio disponible del contenedor
      const containerWidth = container.offsetWidth;
      const containerHeight = container.offsetHeight;
      
      // ✅ MEJORADO: Calcular escala para maximizar el uso del contenedor
      const scaleX = containerWidth / CANVAS_CONFIG.width;
      const scaleY = containerHeight / CANVAS_CONFIG.height;
      const initialScale = Math.min(scaleX, scaleY);
      
      // ✅ ESTRATEGIA HÍBRIDA: Diferentes escalas según el tamaño de pantalla
      // Desktop (lg+): Usar 95% del espacio (como KonvaAreaEditor que funciona bien)
      // Mobile/Tablet (md-): Usar 80% del espacio (como antes)
      const isDesktop = containerWidth >= 1200; // lg breakpoint de Material-UI
      const scaleFactor = isDesktop ? 0.95 : 0.8;
      const adjustedScale = initialScale * scaleFactor;
      
      setStageScale(adjustedScale);
      
      // ✅ CORREGIDO: Centrar perfectamente el stage en el contenedor
      // Como el contenedor ya tiene alignItems: center y justifyContent: center,
      // el stage se centrará automáticamente, pero necesitamos ajustar la posición
      const scaledWidth = CANVAS_CONFIG.width * adjustedScale;
      const scaledHeight = CANVAS_CONFIG.height * adjustedScale;
      const centerX = (containerWidth - scaledWidth) / 2;
      const centerY = (containerHeight - scaledHeight) / 2;
      
      setStagePosition({ x: centerX, y: centerY });
      
      console.log('📐 [useUnifiedCanvasCentering] Canvas con estrategia híbrida:', {
        containerSize: { width: containerWidth, height: containerHeight },
        stageSize: { width: CANVAS_CONFIG.width, height: CANVAS_CONFIG.height },
        rawScale: initialScale,
        adjustedScale: adjustedScale,
        scaledSize: { width: scaledWidth, height: scaledHeight },
        position: { x: centerX, y: centerY },
        coverage: `${Math.round((scaledWidth / containerWidth) * 100)}% x ${Math.round((scaledHeight / containerHeight) * 100)}%`,
        strategy: {
          isDesktop,
          scaleFactor,
          method: isDesktop ? 'Desktop: 95% space (KonvaAreaEditor logic)' : 'Mobile/Tablet: 80% space (original logic)'
        }
      });
    }
  }, [containerRef]);

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
