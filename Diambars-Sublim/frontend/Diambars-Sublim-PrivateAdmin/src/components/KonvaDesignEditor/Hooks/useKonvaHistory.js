// hooks/useKonvaHistory.js
import { useState, useCallback, useRef, useEffect } from 'react';

export const useKonvaHistory = (elements, setElements, maxHistorySize = 50) => {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isUndoRedo = useRef(false);

  // Guardar estado actual
  const saveState = useCallback((description = '') => {
    if (isUndoRedo.current) return;

    const state = {
      elements: JSON.parse(JSON.stringify(elements)),
      timestamp: Date.now(),
      description
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, currentIndex + 1);
      newHistory.push(state);
      
      // Limitar tamaño del historial
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        return newHistory;
      }
      
      return newHistory;
    });

    setCurrentIndex(prev => Math.min(prev + 1, maxHistorySize - 1));
  }, [elements, currentIndex, maxHistorySize]);

  const undo = useCallback(() => {
    if (currentIndex <= 0) return false;

    isUndoRedo.current = true;
    const previousState = history[currentIndex - 1];
    setElements(previousState.elements);
    setCurrentIndex(prev => prev - 1);
    
    setTimeout(() => {
      isUndoRedo.current = false;
    }, 100);

    return true;
  }, [history, currentIndex, setElements]);

  const redo = useCallback(() => {
    if (currentIndex >= history.length - 1) return false;

    isUndoRedo.current = true;
    const nextState = history[currentIndex + 1];
    setElements(nextState.elements);
    setCurrentIndex(prev => prev + 1);
    
    setTimeout(() => {
      isUndoRedo.current = false;
    }, 100);

    return true;
  }, [history, currentIndex, setElements]);

  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < history.length - 1;

  const getHistoryInfo = useCallback(() => ({
    currentIndex,
    historyLength: history.length,
    canUndo,
    canRedo,
    currentDescription: history[currentIndex]?.description || ''
  }), [currentIndex, history.length, canUndo, canRedo, history]);

  // Guardar estado inicial
  useEffect(() => {
    if (elements.length > 0 && history.length === 0) {
      saveState('Estado inicial');
    }
  }, [elements.length, history.length, saveState]);

  return {
    canUndo,
    canRedo,
    undo,
    redo,
    saveState,
    getHistoryInfo
  };
};
