// hooks/useCustomizationAreas.js - HOOK MEJORADO PARA ÁREAS DE PERSONALIZACIÓN
import { useState, useEffect, useCallback } from 'react';
import { CANVAS_CONFIG, scaleCustomizationArea } from '../constants/canvasConfig';

export const useCustomizationAreas = (product, canvasDimensions = null) => {
  const [customizationAreas, setCustomizationAreas] = useState([]);

  useEffect(() => {
    if (!product?.customizationAreas) {
      setCustomizationAreas([]);
      return;
    }

    console.log('🎯 [useCustomizationAreas] Procesando áreas de personalización:', product.customizationAreas.length);

    const areas = product.customizationAreas.map((area, index) => {
      // ✅ CORREGIDO: No aplicar escalado adicional - mantener coordenadas originales
      const scaledArea = scaleCustomizationArea(area, 1);

      const processedArea = {
        id: area._id || area.id || `area-${index}`,
        name: area.name || `Área ${index + 1}`,
        displayName: area.displayName || area.name || `Área ${index + 1}`,
        description: area.description || '',
        
        // Coordenadas escaladas
        x: scaledArea.x,
        y: scaledArea.y,
        width: scaledArea.width,
        height: scaledArea.height,
        
        // Configuración de la zona
        accepts: area.accepts || { 
          text: true, 
          image: true, 
          shapes: true,
          triangle: true,
          star: true,
          customShape: true,
          line: true
        },
        maxElements: area.maxElements || 10,
        minElements: area.minElements || 0,
        
        // Estilo visual
        strokeColor: area.strokeColor || '#10B981',
        fillColor: area.fillColor || 'rgba(16, 185, 129, 0.1)',
        strokeWidth: 2,
        dash: [6, 6],
        
        // Metadatos
        originalData: area,
        debug: scaledArea._debug
      };

      console.log('🎯 [useCustomizationAreas] Área procesada:', {
        id: processedArea.id,
        name: processedArea.name,
        position: { x: processedArea.x, y: processedArea.y, width: processedArea.width, height: processedArea.height },
        accepts: processedArea.accepts
      });

      return processedArea;
    });

    setCustomizationAreas(areas);
  }, [product, canvasDimensions]);

  const getAreaForPosition = useCallback((x, y) => {
    return customizationAreas.find(area => 
      x >= area.x && 
      x <= area.x + area.width && 
      y >= area.y && 
      y <= area.y + area.height
    );
  }, [customizationAreas]);

  const validateElementInArea = useCallback((element, areaId) => {
    const area = customizationAreas.find(a => a.id === areaId);
    if (!area) return { isValid: false, error: 'Área no encontrada' };

    // Verificar que el elemento esté dentro del área
    const elementRight = element.x + (element.width || 0);
    const elementBottom = element.y + (element.height || 0);
    const areaRight = area.x + area.width;
    const areaBottom = area.y + area.height;

    if (element.x < area.x || element.y < area.y || 
        elementRight > areaRight || elementBottom > areaBottom) {
      return { 
        isValid: false, 
        error: 'Elemento fuera de los límites del área' 
      };
    }

    // Verificar tipo de elemento permitido
    if (!area.accepts[element.type]) {
      return { 
        isValid: false, 
        error: `Tipo de elemento '${element.type}' no permitido en esta área` 
      };
    }

    return { isValid: true };
  }, [customizationAreas]);

  const snapToArea = useCallback((x, y, areaId) => {
    const area = customizationAreas.find(a => a.id === areaId);
    if (!area) return { x, y };

    // Snap al borde más cercano del área
    const snapThreshold = 10;
    
    let snappedX = x;
    let snappedY = y;

    // Snap horizontal
    if (Math.abs(x - area.x) < snapThreshold) {
      snappedX = area.x;
    } else if (Math.abs(x - (area.x + area.width)) < snapThreshold) {
      snappedX = area.x + area.width;
    }

    // Snap vertical
    if (Math.abs(y - area.y) < snapThreshold) {
      snappedY = area.y;
    } else if (Math.abs(y - (area.y + area.height)) < snapThreshold) {
      snappedY = area.y + area.height;
    }

    return { x: snappedX, y: snappedY };
  }, [customizationAreas]);

  const getAreaElements = useCallback((areaId, elements) => {
    return elements.filter(element => element.areaId === areaId);
  }, []);

  const getAreaElementCount = useCallback((areaId, elements) => {
    return getAreaElements(areaId, elements).length;
  }, [getAreaElements]);

  const canAddElementToArea = useCallback((areaId, elements) => {
    const area = customizationAreas.find(a => a.id === areaId);
    if (!area) return false;

    const currentCount = getAreaElementCount(areaId, elements);
    return currentCount < area.maxElements;
  }, [customizationAreas, getAreaElementCount]);

  const getAreaInfo = useCallback((areaId) => {
    const area = customizationAreas.find(a => a.id === areaId);
    if (!area) return null;

    return {
      id: area.id,
      name: area.name,
      displayName: area.displayName,
      description: area.description,
      position: { x: area.x, y: area.y, width: area.width, height: area.height },
      accepts: area.accepts,
      maxElements: area.maxElements,
      minElements: area.minElements
    };
  }, [customizationAreas]);

  return {
    customizationAreas,
    getAreaForPosition,
    validateElementInArea,
    snapToArea,
    getAreaElements,
    getAreaElementCount,
    canAddElementToArea,
    getAreaInfo
  };
};