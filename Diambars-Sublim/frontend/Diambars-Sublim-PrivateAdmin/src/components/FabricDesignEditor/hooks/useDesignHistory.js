// src/components/FabricDesignEditor/hooks/useDesignHistory.js
import { useState, useCallback, useRef } from 'react';

export const useDesignHistory = (maxStates = 50) => {
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isUndoRedoRef = useRef(false);

  // ================ GUARDAR ESTADO ================
  const saveState = useCallback((canvas, description = 'Cambio') => {
    if (isUndoRedoRef.current) {
      isUndoRedoRef.current = false;
      return;
    }

    try {
      if (!canvas) {
        console.warn('Canvas no disponible para guardar estado');
        return;
      }

      // Serializar el estado del canvas
      const canvasState = canvas.toJSON(['data']);
      const timestamp = new Date().toISOString();
      
      const newState = {
        id: `state_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        canvasState,
        timestamp,
        description,
        elementsCount: canvas.getObjects().length,
        selectedObjects: canvas.getActiveObjects().length
      };

      // Remover estados futuros si estamos en medio del historial
      const newHistory = history.slice(0, currentIndex + 1);
      
      // Agregar nuevo estado
      newHistory.push(newState);
      
      // Limitar el número de estados
      if (newHistory.length > maxStates) {
        newHistory.shift();
      }

      setHistory(newHistory);
      setCurrentIndex(newHistory.length - 1);

      console.log(`💾 Estado guardado: ${description}`, {
        totalStates: newHistory.length,
        currentIndex: newHistory.length - 1,
        elementsCount: newState.elementsCount
      });

    } catch (error) {
      console.error('Error guardando estado del canvas:', error);
    }
  }, [history, currentIndex, maxStates]);

  // ================ DESHACER ================
  const undo = useCallback((canvas) => {
    if (!canvas || currentIndex <= 0) {
      console.log('No se puede deshacer');
      return false;
    }

    try {
      isUndoRedoRef.current = true;
      
      const previousState = history[currentIndex - 1];
      if (!previousState) {
        console.warn('Estado anterior no encontrado');
        return false;
      }

      // Restaurar estado anterior
      canvas.loadFromJSON(previousState.canvasState, () => {
        canvas.requestRenderAll();
        setCurrentIndex(currentIndex - 1);
        
        console.log(`↶ Deshecho: ${previousState.description}`, {
          currentIndex: currentIndex - 1,
          timestamp: previousState.timestamp
        });
      });

      return true;
    } catch (error) {
      console.error('Error deshaciendo:', error);
      return false;
    }
  }, [canvas, currentIndex, history]);

  // ================ REHACER ================
  const redo = useCallback((canvas) => {
    if (!canvas || currentIndex >= history.length - 1) {
      console.log('No se puede rehacer');
      return false;
    }

    try {
      isUndoRedoRef.current = true;
      
      const nextState = history[currentIndex + 1];
      if (!nextState) {
        console.warn('Estado siguiente no encontrado');
        return false;
      }

      // Restaurar estado siguiente
      canvas.loadFromJSON(nextState.canvasState, () => {
        canvas.requestRenderAll();
        setCurrentIndex(currentIndex + 1);
        
        console.log(`↷ Rehecho: ${nextState.description}`, {
          currentIndex: currentIndex + 1,
          timestamp: nextState.timestamp
        });
      });

      return true;
    } catch (error) {
      console.error('Error rehaciendo:', error);
      return false;
    }
  }, [canvas, currentIndex, history]);

  // ================ IR A ESTADO ESPECÍFICO ================
  const goToState = useCallback((canvas, stateIndex) => {
    if (!canvas || stateIndex < 0 || stateIndex >= history.length) {
      console.warn('Índice de estado inválido:', stateIndex);
      return false;
    }

    try {
      isUndoRedoRef.current = true;
      
      const targetState = history[stateIndex];
      if (!targetState) {
        console.warn('Estado objetivo no encontrado');
        return false;
      }

      // Restaurar estado objetivo
      canvas.loadFromJSON(targetState.canvasState, () => {
        canvas.requestRenderAll();
        setCurrentIndex(stateIndex);
        
        console.log(`🎯 Estado restaurado: ${targetState.description}`, {
          targetIndex: stateIndex,
          timestamp: targetState.timestamp
        });
      });

      return true;
    } catch (error) {
      console.error('Error yendo a estado específico:', error);
      return false;
    }
  }, [canvas, history]);

  // ================ LIMPIAR HISTORIAL ================
  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
    console.log('🧹 Historial limpiado');
  }, []);

  // ================ OBTENER ESTADÍSTICAS ================
  const getHistoryStats = useCallback(() => {
    return {
      totalStates: history.length,
      currentIndex,
      canUndo: currentIndex > 0,
      canRedo: currentIndex < history.length - 1,
      firstState: history[0],
      lastState: history[history.length - 1],
      currentState: history[currentIndex]
    };
  }, [history, currentIndex]);

  // ================ BUSCAR EN HISTORIAL ================
  const searchHistory = useCallback((searchTerm) => {
    if (!searchTerm) return history;
    
    return history.filter(state => 
      state.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      state.id.includes(searchTerm)
    );
  }, [history]);

  // ================ FILTRAR HISTORIAL POR FECHA ================
  const filterHistoryByDate = useCallback((startDate, endDate) => {
    return history.filter(state => {
      const stateDate = new Date(state.timestamp);
      return stateDate >= startDate && stateDate <= endDate;
    });
  }, [history]);

  // ================ EXPORTAR HISTORIAL ================
  const exportHistory = useCallback(() => {
    try {
      const exportData = {
        history: history.map(state => ({
          id: state.id,
          description: state.description,
          timestamp: state.timestamp,
          elementsCount: state.elementsCount,
          selectedObjects: state.selectedObjects
        })),
        exportInfo: {
          exportedAt: new Date().toISOString(),
          totalStates: history.length,
          currentIndex,
          version: '1.0.0'
        }
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `design-history-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      
      URL.revokeObjectURL(url);
      console.log('📤 Historial exportado');
      
      return true;
    } catch (error) {
      console.error('Error exportando historial:', error);
      return false;
    }
  }, [history, currentIndex]);

  // ================ IMPORTAR HISTORIAL ================
  const importHistory = useCallback(async (historyFile) => {
    if (!historyFile) {
      throw new Error('No se proporcionó archivo de historial');
    }

    try {
      const historyText = await historyFile.text();
      const importData = JSON.parse(historyText);
      
      // Validar formato
      if (!importData.history || !Array.isArray(importData.history)) {
        throw new Error('Formato de historial inválido');
      }

      // Convertir estados importados al formato interno
      const importedHistory = importData.history.map(state => ({
        ...state,
        canvasState: null, // Los estados del canvas no se pueden importar por seguridad
        id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }));

      setHistory(importedHistory);
      setCurrentIndex(importedHistory.length - 1);
      
      console.log('📥 Historial importado:', importedHistory.length);
      return true;
    } catch (error) {
      console.error('Error importando historial:', error);
      throw error;
    }
  }, []);

  // ================ COMPRIMIR HISTORIAL ================
  const compressHistory = useCallback(() => {
    if (history.length <= 10) {
      console.log('Historial demasiado pequeño para comprimir');
      return false;
    }

    try {
      // Mantener solo estados importantes (cada 5 estados)
      const compressedHistory = history.filter((_, index) => 
        index % 5 === 0 || index === history.length - 1
      );

      setHistory(compressedHistory);
      setCurrentIndex(compressedHistory.length - 1);
      
      console.log('🗜️ Historial comprimido:', {
        original: history.length,
        compressed: compressedHistory.length,
        reduction: Math.round((1 - compressedHistory.length / history.length) * 100) + '%'
      });
      
      return true;
    } catch (error) {
      console.error('Error comprimiendo historial:', error);
      return false;
    }
  }, [history]);

  // ================ VALIDAR ESTADO ================
  const validateState = useCallback((state) => {
    if (!state) return false;
    
    const requiredFields = ['id', 'timestamp', 'description'];
    const hasRequiredFields = requiredFields.every(field => state.hasOwnProperty(field));
    
    if (!hasRequiredFields) return false;
    
    // Validar timestamp
    const timestamp = new Date(state.timestamp);
    if (isNaN(timestamp.getTime())) return false;
    
    // Validar que no sea muy antiguo (más de 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (timestamp < thirtyDaysAgo) {
      console.warn('Estado muy antiguo detectado:', state.timestamp);
    }
    
    return true;
  }, []);

  // ================ LIMPIAR ESTADOS INVALIDOS ================
  const cleanInvalidStates = useCallback(() => {
    const validStates = history.filter(validateState);
    
    if (validStates.length !== history.length) {
      setHistory(validStates);
      setCurrentIndex(Math.min(currentIndex, validStates.length - 1));
      
      console.log('🧹 Estados inválidos removidos:', {
        original: history.length,
        valid: validStates.length,
        removed: history.length - validStates.length
      });
      
      return true;
    }
    
    return false;
  }, [history, currentIndex, validateState]);

  return {
    // Estado
    history,
    currentIndex,
    
    // Acciones principales
    saveState,
    undo,
    redo,
    goToState,
    clearHistory,
    
    // Utilidades
    getHistoryStats,
    searchHistory,
    filterHistoryByDate,
    
    // Importar/Exportar
    exportHistory,
    importHistory,
    
    // Mantenimiento
    compressHistory,
    cleanInvalidStates,
    validateState,
    
    // Computed properties
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    totalStates: history.length,
    isEmpty: history.length === 0
  };
};

