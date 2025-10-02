// src/hooks/usePaymentMethods.js - Hook para gestión de métodos de pago en la app móvil
import { useState, useEffect, useCallback } from 'react';
import paymentMethodService from '../api/paymentMethodService';

export const usePaymentMethods = () => {
  // Estados principales
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Estados de filtros y búsqueda
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [filterEnabled, setFilterEnabled] = useState(true);

  // ==================== FUNCIONES DE FETCH ====================

  /**
   * Cargar métodos de pago disponibles
   */
  const loadPaymentMethods = useCallback(async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      setError(null);

      console.log('🔄 [usePaymentMethods] Cargando métodos de pago...');
      
      const response = await paymentMethodService.getAvailablePaymentMethods();
      
      if (response.success) {
        const methods = response.methods || [];
        
        // Filtrar solo métodos habilitados si el filtro está activo
        const filteredMethods = filterEnabled 
          ? methods.filter(method => method.enabled) 
          : methods;

        setPaymentMethods(filteredMethods);
        console.log(`✅ [usePaymentMethods] ${filteredMethods.length} métodos cargados`);
      } else {
        throw new Error(response.message || 'Error cargando métodos de pago');
      }
    } catch (err) {
      console.error('❌ [usePaymentMethods] Error cargando métodos:', err);
      setError(err.message || 'Error cargando métodos de pago');
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  }, [filterEnabled]);

  /**
   * Refrescar métodos de pago (pull to refresh)
   */
  const refreshPaymentMethods = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      console.log('🔄 [usePaymentMethods] Refrescando métodos de pago...');
      
      const response = await paymentMethodService.getAvailablePaymentMethods();
      
      if (response.success) {
        const methods = response.methods || [];
        
        // Filtrar solo métodos habilitados si el filtro está activo
        const filteredMethods = filterEnabled 
          ? methods.filter(method => method.enabled) 
          : methods;

        setPaymentMethods(filteredMethods);
        console.log(`✅ [usePaymentMethods] ${filteredMethods.length} métodos refrescados`);
      } else {
        throw new Error(response.message || 'Error refrescando métodos de pago');
      }
    } catch (err) {
      console.error('❌ [usePaymentMethods] Error refrescando métodos:', err);
      setError(err.message || 'Error refrescando métodos de pago');
    } finally {
      setRefreshing(false);
    }
  }, [filterEnabled]);

  /**
   * Obtener método de pago por tipo
   */
  const getPaymentMethodByType = useCallback(async (type) => {
    try {
      console.log(`🔍 [usePaymentMethods] Obteniendo método: ${type}`);
      
      const response = await paymentMethodService.getPaymentMethodByType(type);
      
      if (response.success) {
        return response.config;
      } else {
        throw new Error(response.message || 'Error obteniendo método de pago');
      }
    } catch (err) {
      console.error(`❌ [usePaymentMethods] Error obteniendo método ${type}:`, err);
      throw err;
    }
  }, []);

  // ==================== FUNCIONES DE UTILIDAD ====================

  /**
   * Seleccionar método de pago
   */
  const selectPaymentMethod = useCallback((method) => {
    console.log('🎯 [usePaymentMethods] Seleccionando método:', method?.type);
    setSelectedMethod(method);
  }, []);

  /**
   * Limpiar selección
   */
  const clearSelection = useCallback(() => {
    console.log('🧹 [usePaymentMethods] Limpiando selección');
    setSelectedMethod(null);
  }, []);

  /**
   * Limpiar error
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Cambiar filtro de métodos habilitados
   */
  const toggleEnabledFilter = useCallback(() => {
    setFilterEnabled(prev => !prev);
  }, []);

  /**
   * Obtener método por tipo desde la lista cargada
   */
  const getMethodByType = useCallback((type) => {
    return paymentMethods.find(method => method.type === type);
  }, [paymentMethods]);

  /**
   * Verificar si un método está disponible
   */
  const isMethodAvailable = useCallback((type) => {
    const method = getMethodByType(type);
    return method && method.enabled;
  }, [getMethodByType]);

  // ==================== EFECTOS ====================

  // Cargar métodos al montar el componente
  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  // Recargar cuando cambie el filtro
  useEffect(() => {
    if (paymentMethods.length > 0) {
      loadPaymentMethods(false);
    }
  }, [filterEnabled]);

  // ==================== RETORNO ====================

  return {
    // Estados principales
    paymentMethods,
    loading,
    error,
    refreshing,
    selectedMethod,

    // Estados de filtros
    filterEnabled,

    // Funciones de fetch
    loadPaymentMethods,
    refreshPaymentMethods,
    getPaymentMethodByType,

    // Funciones de utilidad
    selectPaymentMethod,
    clearSelection,
    clearError,
    toggleEnabledFilter,
    getMethodByType,
    isMethodAvailable,

    // Estados computados
    hasMethods: paymentMethods.length > 0,
    hasError: !!error,
    isLoading: loading || refreshing
  };
};

export default usePaymentMethods;


