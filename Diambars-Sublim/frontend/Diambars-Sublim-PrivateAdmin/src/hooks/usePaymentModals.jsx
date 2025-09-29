// hooks/usePaymentModals.jsx - Hook para gestión de modales de configuración de métodos de pago
import { useState, useCallback } from 'react';

export const usePaymentModals = () => {
  // Estados de modales (solo configuración del sistema)
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  
  // Estados de selección
  const [selectedConfigMethod, setSelectedConfigMethod] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  // Abrir modal de configuración
  const openConfigModal = useCallback((method = null, mode = 'create') => {
    console.log('🔍 [usePaymentModals] openConfigModal:', { method, mode });
    setSelectedConfigMethod(method);
    setModalMode(mode);
    setConfigModalOpen(true);
  }, []);

  // Cerrar modal de configuración
  const closeConfigModal = useCallback(() => {
    console.log('🔍 [usePaymentModals] closeConfigModal');
    setConfigModalOpen(false);
    setSelectedConfigMethod(null);
    setModalMode('create');
  }, []);


  // Abrir modal de estadísticas
  const openStatsModal = useCallback(() => {
    setStatsModalOpen(true);
  }, []);

  // Cerrar modal de estadísticas
  const closeStatsModal = useCallback(() => {
    setStatsModalOpen(false);
  }, []);

  // Cerrar todos los modales
  const closeAllModals = useCallback(() => {
    setConfigModalOpen(false);
    setStatsModalOpen(false);
    setSelectedConfigMethod(null);
    setModalMode('create');
  }, []);

  return {
    // Estados de modales
    configModalOpen,
    statsModalOpen,
    
    // Estados de selección
    selectedConfigMethod,
    modalMode,
    
    // Funciones de configuración
    openConfigModal,
    closeConfigModal,
    
    // Funciones de estadísticas
    openStatsModal,
    closeStatsModal,
    
    // Función general
    closeAllModals
  };
};
