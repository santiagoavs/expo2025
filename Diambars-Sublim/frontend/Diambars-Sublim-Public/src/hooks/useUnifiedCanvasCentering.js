// hooks/useUnifiedCanvasCentering.js - UNIFIED CANVAS CENTERING HOOK (CSS VERSION)
import { useState, useEffect, useCallback, useMemo } from 'react';
import { CANVAS_CONFIG, CanvasUtils } from '../utils/canvasConfig';

/**
 * Hook unificado para centrado y escalado del canvas
 * Compatible con el sistema del admin privado pero usando CSS tradicional
 */
export const useUnifiedCanvasCentering = (productImage, containerRef) => {
  const [stageScale, setStageScale] = useState(1);
  const [stagePosition, setStagePosition] = useState({ x: 0, y: 0 });
  const [containerSize, setContainerSize] = useState({ width: 800, height: 600 });

  // Configuración del stage basada en el canvas config
  const stageConfig = useMemo(() => ({
    width: CANVAS_CONFIG.width,
    height: CANVAS_CONFIG.height,
    backgroundColor: CANVAS_CONFIG.background.color || 'transparent'
  }), []);

  // Función para obtener el tamaño del contenedor
  const updateContainerSize = useCallback(() => {
    if (!containerRef?.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    
    const newSize = {
      width: rect.width || 800,
      height: rect.height || 600
    };

    setContainerSize(newSize);
  }, [containerRef]);

  // Función para calcular la escala y posición del stage
  const calculateStageTransform = useCallback(() => {
    const { width: containerWidth, height: containerHeight } = containerSize;
    const { width: stageWidth, height: stageHeight } = stageConfig;

    // Calcular escala para que el canvas quepa en el contenedor con margen adaptativo
    const margin = Math.min(40, containerWidth * 0.05, containerHeight * 0.05); // Margen adaptativo
    const availableWidth = Math.max(containerWidth - margin * 2, 200);
    const availableHeight = Math.max(containerHeight - margin * 2, 150);

    const scaleX = availableWidth / stageWidth;
    const scaleY = availableHeight / stageHeight;
    const scale = Math.min(scaleX, scaleY, 1); // No hacer zoom mayor a 1 por defecto

    // Calcular posición para centrar el canvas
    const scaledWidth = stageWidth * scale;
    const scaledHeight = stageHeight * scale;
    
    const x = (containerWidth - scaledWidth) / 2;
    const y = (containerHeight - scaledHeight) / 2;

    return {
      scale: Math.max(scale, 0.1), // Escala mínima
      position: { x: Math.max(x, 0), y: Math.max(y, 0) }
    };
  }, [containerSize, stageConfig]);

  // Actualizar transformación cuando cambie el tamaño del contenedor
  useEffect(() => {
    const { scale, position } = calculateStageTransform();
    setStageScale(scale);
    setStagePosition(position);
  }, [calculateStageTransform]);

  // Observer para cambios de tamaño del contenedor
  useEffect(() => {
    if (!containerRef?.current) return;

    const resizeObserver = new ResizeObserver(() => {
      updateContainerSize();
    });

    resizeObserver.observe(containerRef.current);
    
    // Actualización inicial
    updateContainerSize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef, updateContainerSize]);

  // Funciones de control de zoom
  const zoomIn = useCallback(() => {
    setStageScale(prev => Math.min(prev * 1.2, CANVAS_CONFIG.maxZoom));
  }, []);

  const zoomOut = useCallback(() => {
    setStageScale(prev => Math.max(prev / 1.2, CANVAS_CONFIG.minZoom));
  }, []);

  const resetZoom = useCallback(() => {
    const { scale, position } = calculateStageTransform();
    setStageScale(scale);
    setStagePosition(position);
  }, [calculateStageTransform]);

  const fitToContainer = useCallback(() => {
    const { scale, position } = calculateStageTransform();
    setStageScale(scale);
    setStagePosition(position);
  }, [calculateStageTransform]);

  // Función para centrar el canvas manualmente
  const centerCanvas = useCallback(() => {
    const { position } = calculateStageTransform();
    setStagePosition(position);
  }, [calculateStageTransform]);

  return {
    // Estado del stage
    stageScale,
    stagePosition,
    stageConfig,
    containerSize,
    
    // Funciones de control
    zoomIn,
    zoomOut,
    resetZoom,
    fitToContainer,
    centerCanvas,
    
    // Funciones de utilidad
    setStageScale,
    setStagePosition,
    updateContainerSize
  };
};

export default useUnifiedCanvasCentering;
