// hooks/useKonvaHistory.js - HISTORY MANAGEMENT HOOK (CSS VERSION)
import { useState, useCallback, useRef } from 'react';
import { PERFORMANCE_CONFIG } from '../utils/canvasConfig';
import { deepClone } from '../utils/helpers';

export const useKonvaHistory = (initialElements = []) => {
  // ==================== STATE ====================
  const [currentIndex, setCurrentIndex] = useState(-1);
  const historyRef = useRef([]);
  const isUndoRedoRef = useRef(false);
  
  // ==================== HISTORY MANAGEMENT ====================
  const addToHistory = useCallback((elements, action = 'update') => {
    // Don't add to history if we're in the middle of undo/redo
    if (isUndoRedoRef.current) return;
    
    const snapshot = {
      elements: deepClone(elements),
      timestamp: Date.now(),
      action
    };
    
    // Remove any history after current index (when adding new action after undo)
    const newHistory = historyRef.current.slice(0, currentIndex + 1);
    newHistory.push(snapshot);
    
    // Limit history size for performance
    if (newHistory.length > PERFORMANCE_CONFIG.features.historyLimit) {
      newHistory.shift();
    } else {
      setCurrentIndex(prev => prev + 1);
    }
    
    historyRef.current = newHistory;
  }, [currentIndex]);
  
  const undo = useCallback(() => {
    if (currentIndex <= 0) return null;
    
    isUndoRedoRef.current = true;
    const newIndex = currentIndex - 1;
    setCurrentIndex(newIndex);
    
    const snapshot = historyRef.current[newIndex];
    
    // Reset flag after state update
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 0);
    
    return snapshot ? deepClone(snapshot.elements) : null;
  }, [currentIndex]);
  
  const redo = useCallback(() => {
    if (currentIndex >= historyRef.current.length - 1) return null;
    
    isUndoRedoRef.current = true;
    const newIndex = currentIndex + 1;
    setCurrentIndex(newIndex);
    
    const snapshot = historyRef.current[newIndex];
    
    // Reset flag after state update
    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 0);
    
    return snapshot ? deepClone(snapshot.elements) : null;
  }, [currentIndex]);
  
  const clearHistory = useCallback(() => {
    historyRef.current = [];
    setCurrentIndex(-1);
  }, []);
  
  const initializeHistory = useCallback((elements) => {
    const snapshot = {
      elements: deepClone(elements),
      timestamp: Date.now(),
      action: 'initialize'
    };
    
    historyRef.current = [snapshot];
    setCurrentIndex(0);
  }, []);
  
  // ==================== HISTORY INFO ====================
  const canUndo = currentIndex > 0;
  const canRedo = currentIndex < historyRef.current.length - 1;
  const historyLength = historyRef.current.length;
  
  const getCurrentSnapshot = useCallback(() => {
    if (currentIndex >= 0 && currentIndex < historyRef.current.length) {
      return historyRef.current[currentIndex];
    }
    return null;
  }, [currentIndex]);
  
  const getHistoryInfo = useCallback(() => {
    return {
      currentIndex,
      totalSnapshots: historyRef.current.length,
      canUndo,
      canRedo,
      history: historyRef.current.map((snapshot, index) => ({
        index,
        action: snapshot.action,
        timestamp: snapshot.timestamp,
        isCurrent: index === currentIndex
      }))
    };
  }, [currentIndex, canUndo, canRedo]);
  
  // ==================== BATCH OPERATIONS ====================
  const startBatch = useCallback(() => {
    isUndoRedoRef.current = true;
  }, []);
  
  const endBatch = useCallback((elements, action = 'batch') => {
    isUndoRedoRef.current = false;
    addToHistory(elements, action);
  }, [addToHistory]);
  
  // ==================== RETURN OBJECT ====================
  return {
    // Actions
    addToHistory,
    undo,
    redo,
    clearHistory,
    initializeHistory,
    
    // Batch operations
    startBatch,
    endBatch,
    
    // State
    canUndo,
    canRedo,
    historyLength,
    currentIndex,
    
    // Info
    getCurrentSnapshot,
    getHistoryInfo
  };
};
