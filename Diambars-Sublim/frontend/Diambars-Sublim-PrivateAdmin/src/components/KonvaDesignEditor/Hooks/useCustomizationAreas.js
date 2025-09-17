// hooks/useCustomizationAreas.js
import { useState, useEffect, useCallback } from 'react';
import { CANVAS_CONFIG, scaleCustomizationArea } from '../constants/canvasConfig';

export const useCustomizationAreas = (product) => {
  const [customizationAreas, setCustomizationAreas] = useState([]);

  useEffect(() => {
    if (!product?.customizationAreas) return;

    const areas = product.customizationAreas.map(area => {
      // Usar la función compartida para escalar áreas
      const scaledArea = scaleCustomizationArea(area);

      return {
        id: area._id || area.id,
        name: area.name,
        displayName: area.displayName || area.name,
        ...scaledArea, // x, y, width, height escalados
        accepts: area.accepts || { text: true, image: true, shapes: true },
        maxElements: area.maxElements || 10,
        strokeColor: '#10B981',
        strokeWidth: 2,
        dash: [6, 6]
      };
    });

    setCustomizationAreas(areas);
  }, [product]);

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
    if (!area) return { valid: false, error: 'Área no encontrada' };

    // Validar tipo de elemento
    if (element.type === 'text' && !area.accepts.text) {
      return { valid: false, error: 'El área no acepta texto' };
    }
    if (element.type === 'image' && !area.accepts.image) {
      return { valid: false, error: 'El área no acepta imágenes' };
    }
    if (['rect', 'circle', 'triangle'].includes(element.type) && !area.accepts.shapes) {
      return { valid: false, error: 'El área no acepta formas' };
    }

    // Validar posición
    if (element.x < area.x || element.y < area.y ||
        element.x + (element.width || 0) > area.x + area.width ||
        element.y + (element.height || 0) > area.y + area.height) {
      return { valid: false, error: 'El elemento está fuera del área' };
    }

    return { valid: true };
  }, [customizationAreas]);

  const snapToArea = useCallback((element) => {
    const area = getAreaForPosition(element.x, element.y);
    if (!area) return element;

    // Ajustar posición si está cerca del borde
    const snapThreshold = 10;
    let newX = element.x;
    let newY = element.y;

    if (Math.abs(element.x - area.x) < snapThreshold) {
      newX = area.x;
    }
    if (Math.abs(element.y - area.y) < snapThreshold) {
      newY = area.y;
    }

    return { ...element, x: newX, y: newY };
  }, [getAreaForPosition]);

  return {
    customizationAreas,
    getAreaForPosition,
    validateElementInArea,
    snapToArea
  };
};
