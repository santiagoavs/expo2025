// hooks/useKonvaCanvas.js
import { useState, useCallback, useEffect } from 'react';
import { generateId } from '../utils/helpers';

export const useKonvaCanvas = (initialDesign, product) => {
  const [elements, setElements] = useState([]);
  const [canvasConfig, setCanvasConfig] = useState({
    width: 800,
    height: 600,
    backgroundColor: '#ffffff'
  });

  // Inicializar elementos desde el diseño inicial
  useEffect(() => {
    if (initialDesign?.elements) {
      const konvaElements = initialDesign.elements.map(el => ({
        id: el._id || generateId(),
        type: el.type,
        areaId: el.areaId,
        ...el.konvaAttrs,
        draggable: true,
        listening: true
      }));
      setElements(konvaElements);
    }
  }, [initialDesign]);

  const addElement = useCallback((elementData) => {
    const element = {
      id: generateId(),
      draggable: true,
      listening: true,
      ...elementData
    };
    setElements(prev => [...prev, element]);
    return element;
  }, []);

  const updateElement = useCallback((elementId, updates) => {
    setElements(prev => {
      const newElements = prev.map(el => {
        if (el.id === elementId) {
          return { ...el, ...updates };
        }
        return el;
      });
      return newElements;
    });
  }, []);

  const removeElement = useCallback((elementId) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
  }, []);

  const duplicateElement = useCallback((elementId) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return null;

    const duplicate = {
      ...element,
      id: generateId(),
      x: element.x + 20,
      y: element.y + 20
    };

    setElements(prev => [...prev, duplicate]);
    return duplicate;
  }, [elements]);

  const updateCanvasConfig = useCallback((config) => {
    setCanvasConfig(prev => ({ ...prev, ...config }));
  }, []);

  return {
    elements,
    setElements,
    addElement,
    updateElement,
    removeElement,
    duplicateElement,
    canvasConfig,
    updateCanvasConfig
  };
};
