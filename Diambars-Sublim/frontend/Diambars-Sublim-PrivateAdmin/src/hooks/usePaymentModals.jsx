// hooks/usePaymentModals.jsx - Hook para gestión de modales de métodos de pago
import { useState, useCallback } from 'react';

export const usePaymentModals = () => {
  // Estados de modales
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [userMethodModalOpen, setUserMethodModalOpen] = useState(false);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  
  // Estados de selección
  const [selectedConfigMethod, setSelectedConfigMethod] = useState(null);
  const [selectedUserMethod, setSelectedUserMethod] = useState(null);
  const [modalMode, setModalMode] = useState('create');

  // Abrir modal de configuración
  const openConfigModal = useCallback((method = null, mode = 'create') => {
    setSelectedConfigMethod(method);
    setModalMode(mode);
    setConfigModalOpen(true);
  }, []);

  // Cerrar modal de configuración
  const closeConfigModal = useCallback(() => {
    setConfigModalOpen(false);
    setSelectedConfigMethod(null);
    setModalMode('create');
  }, []);

  // Abrir modal de método de usuario
  const openUserMethodModal = useCallback((method = null, mode = 'create') => {
    setSelectedUserMethod(method);
    setModalMode(mode);
    setUserMethodModalOpen(true);
  }, []);

  // Cerrar modal de método de usuario
  const closeUserMethodModal = useCallback(() => {
    setUserMethodModalOpen(false);
    setSelectedUserMethod(null);
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
    setUserMethodModalOpen(false);
    setStatsModalOpen(false);
    setSelectedConfigMethod(null);
    setSelectedUserMethod(null);
    setModalMode('create');
  }, []);

  return {
    // Estados de modales
    configModalOpen,
    userMethodModalOpen,
    statsModalOpen,
    
    // Estados de selección
    selectedConfigMethod,
    selectedUserMethod,
    modalMode,
    
    // Funciones de configuración
    openConfigModal,
    closeConfigModal,
    
    // Funciones de método de usuario
    openUserMethodModal,
    closeUserMethodModal,
    
    // Funciones de estadísticas
    openStatsModal,
    closeStatsModal,
    
    // Función general
    closeAllModals
  };
};
