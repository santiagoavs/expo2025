// src/hooks/usePayments.js - Custom hooks para pagos
import { useState, useEffect, useCallback } from 'react';
import paymentService from '../api/PaymentService';
import toast from 'react-hot-toast';

/**
 * Hook para configuración de pagos
 */
export const usePaymentConfig = () => {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('⚙️ [usePaymentConfig] Obteniendo configuración');

      const [configResponse, statusResponse] = await Promise.all([
        paymentService.getPaymentConfig(),
        paymentService.getPaymentStatus()
      ]);

      if (configResponse.success) {
        setConfig(configResponse.data);
      }

      if (statusResponse.success) {
        setStatus(statusResponse.data);
      }

    } catch (error) {
      console.error('❌ [usePaymentConfig] Error:', error);
      setError(error.message || 'Error obteniendo configuración');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  return {
    config,
    status,
    loading,
    error,
    refetch: fetchConfig
  };
};

/**
 * Hook para estadísticas de pagos
 */
export const usePaymentStats = (initialFilters = {}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchStats = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);

      const currentFilters = customFilters || filters;
      console.log('📊 [usePaymentStats] Obteniendo estadísticas:', currentFilters);

      const response = await paymentService.getBasicStats(currentFilters);

      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error(response.message || 'Error obteniendo estadísticas');
      }

    } catch (error) {
      console.error('❌ [usePaymentStats] Error:', error);
      setError(error.message || 'Error obteniendo estadísticas');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters) => {
    console.log('🔍 [usePaymentStats] Actualizando filtros:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchStats
  };
};

/**
 * Hook para acciones de pago
 */
export const usePaymentActions = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Procesar pago digital
   */
  const processDigitalPayment = useCallback(async (orderId, customerData = {}) => {
    try {
      setLoading(true);
      console.log('💳 [usePaymentActions] Procesando pago digital:', orderId);

      const response = await paymentService.processDigitalPayment(orderId, customerData);

      if (response.success) {
        toast.success('Link de pago generado exitosamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error procesando pago');
      }

    } catch (error) {
      console.error('❌ [usePaymentActions] Error procesando pago:', error);
      toast.error(error.message || 'Error procesando pago');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Registrar pago en efectivo
   */
  const registerCashPayment = useCallback(async (orderId, cashData) => {
    try {
      setLoading(true);
      console.log('💰 [usePaymentActions] Registrando pago efectivo:', orderId);

      const response = await paymentService.registerCashPayment(orderId, cashData);

      if (response.success) {
        toast.success('Pago en efectivo registrado exitosamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error registrando pago');
      }

    } catch (error) {
      console.error('❌ [usePaymentActions] Error registrando pago:', error);
      toast.error(error.message || 'Error registrando pago');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Confirmar pago manualmente
   */
  const confirmManualPayment = useCallback(async (orderId, paymentData) => {
    try {
      setLoading(true);
      console.log('✅ [usePaymentActions] Confirmando pago manual:', orderId);

      const response = await paymentService.confirmManualPayment(orderId, paymentData);

      if (response.success) {
        toast.success('Pago confirmado exitosamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error confirmando pago');
      }

    } catch (error) {
      console.error('❌ [usePaymentActions] Error confirmando pago:', error);
      toast.error(error.message || 'Error confirmando pago');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Simular pago (desarrollo)
   */
  const simulatePayment = useCallback(async (orderId, status = 'approved') => {
    try {
      setLoading(true);
      console.log('🧪 [usePaymentActions] Simulando pago:', orderId, status);

      const response = await paymentService.simulatePayment(orderId, status);

      if (response.success) {
        toast.success(`Pago simulado como ${status === 'approved' ? 'aprobado' : 'rechazado'}`);
        return response.data;
      } else {
        throw new Error(response.message || 'Error simulando pago');
      }

    } catch (error) {
      console.error('❌ [usePaymentActions] Error simulando pago:', error);
      toast.error(error.message || 'Error simulando pago');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    processDigitalPayment,
    registerCashPayment,
    confirmManualPayment,
    simulatePayment
  };
};

/**
 * Hook para métodos de pago guardados
 */
export const usePaymentMethods = (userId) => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMethods = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('💳 [usePaymentMethods] Obteniendo métodos:', userId);
      const response = await paymentService.getPaymentMethods(userId);

      if (response.success) {
        setMethods(response.paymentMethods || []);
      } else {
        throw new Error(response.message || 'Error obteniendo métodos');
      }

    } catch (error) {
      console.error('❌ [usePaymentMethods] Error:', error);
      setError(error.message || 'Error obteniendo métodos');
      setMethods([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMethods();
  }, [fetchMethods]);

  return {
    methods,
    loading,
    error,
    refetch: fetchMethods
  };
};

/**
 * Hook para acciones de métodos de pago
 */
export const usePaymentMethodActions = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Crear método de pago
   */
  const createMethod = useCallback(async (methodData) => {
    try {
      setLoading(true);
      console.log('➕ [usePaymentMethodActions] Creando método');

      const response = await paymentService.createPaymentMethod(methodData);

      if (response.success) {
        toast.success('Método de pago agregado exitosamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error creando método');
      }

    } catch (error) {
      console.error('❌ [usePaymentMethodActions] Error creando:', error);
      toast.error(error.message || 'Error creando método');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar método de pago
   */
  const updateMethod = useCallback(async (methodId, updateData) => {
    try {
      setLoading(true);
      console.log('✏️ [usePaymentMethodActions] Actualizando método:', methodId);

      const response = await paymentService.updatePaymentMethod(methodId, updateData);

      if (response.success) {
        toast.success('Método actualizado exitosamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error actualizando método');
      }

    } catch (error) {
      console.error('❌ [usePaymentMethodActions] Error actualizando:', error);
      toast.error(error.message || 'Error actualizando método');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar método de pago
   */
  const deleteMethod = useCallback(async (methodId) => {
    try {
      setLoading(true);
      console.log('🗑️ [usePaymentMethodActions] Eliminando método:', methodId);

      const response = await paymentService.deletePaymentMethod(methodId);

      if (response.success) {
        toast.success('Método eliminado exitosamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error eliminando método');
      }

    } catch (error) {
      console.error('❌ [usePaymentMethodActions] Error eliminando:', error);
      toast.error(error.message || 'Error eliminando método');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Activar/desactivar método
   */
  const toggleMethod = useCallback(async (methodId, active) => {
    try {
      setLoading(true);
      console.log('🔄 [usePaymentMethodActions] Cambiando estado:', methodId, active);

      const response = await paymentService.togglePaymentMethod(methodId, active);

      if (response.success) {
        toast.success(`Método ${active ? 'activado' : 'desactivado'} exitosamente`);
        return response.data;
      } else {
        throw new Error(response.message || 'Error cambiando estado');
      }

    } catch (error) {
      console.error('❌ [usePaymentMethodActions] Error cambiando estado:', error);
      toast.error(error.message || 'Error cambiando estado');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    createMethod,
    updateMethod,
    deleteMethod,
    toggleMethod
  };
};