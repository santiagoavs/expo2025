// hooks/useKonvaSelection.js
import { useState, useCallback, useMemo } from 'react';

export const useKonvaSelection = (elements) => {
  const [selectedIds, setSelectedIds] = useState([]);

  const selectElement = useCallback((elementId) => {
    setSelectedIds([elementId]);
  }, []);

  const selectMultiple = useCallback((elementIds) => {
    setSelectedIds(elementIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const toggleSelection = useCallback((elementId) => {
    setSelectedIds(prev => 
      prev.includes(elementId) 
        ? prev.filter(id => id !== elementId)
        : [...prev, elementId]
    );
  }, []);

  const isSelected = useCallback((elementId) => {
    return selectedIds.includes(elementId);
  }, [selectedIds]);

  const selectedElements = useMemo(() => {
    return elements.filter(el => selectedIds.includes(el.id));
  }, [elements, selectedIds]);

  const selectionBounds = useMemo(() => {
    if (selectedElements.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    selectedElements.forEach(el => {
      const x = el.x || 0;
      const y = el.y || 0;
      const width = el.width || 0;
      const height = el.height || 0;

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x + width);
      maxY = Math.max(maxY, y + height);
    });

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  }, [selectedElements]);

  return {
    selectedIds,
    selectedElements,
    selectElement,
    selectMultiple,
    clearSelection,
    toggleSelection,
    isSelected,
    selectionBounds
  };
};
