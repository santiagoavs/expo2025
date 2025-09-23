// src/hooks/usePaymentConfig.jsx - Custom hooks para configuración de métodos de pago
import { useState, useEffect, useCallback } from 'react';
import paymentConfigService from '../api/PaymentConfigService';
import toast from 'react-hot-toast';

/**
 * Hook para obtener configuraciones de métodos de pago
 */
export const usePaymentConfigs = () => {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('⚙️ [usePaymentConfigs] Obteniendo configuraciones');

      const response = await paymentConfigService.getPaymentConfigs();

      if (response.success) {
        setConfigs(response.configs || []);
      } else {
        throw new Error(response.message || 'Error obteniendo configuraciones');
      }

    } catch (error) {
      console.error('❌ [usePaymentConfigs] Error:', error);
      setError(error.message || 'Error obteniendo configuraciones');
      setConfigs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConfigs();
  }, [fetchConfigs]);

  // Función para verificar si ya existe un método del mismo tipo
  const checkMethodExists = useCallback((type) => {
    return configs.some(config => config.type === type && config.enabled);
  }, [configs]);

  return {
    configs,
    loading,
    error,
    refetch: fetchConfigs,
    checkMethodExists
  };
};

/**
 * Hook para obtener configuración pública
 */
export const usePublicPaymentConfig = () => {
  const [publicConfig, setPublicConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPublicConfig = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🌐 [usePublicPaymentConfig] Obteniendo configuración pública');

      const response = await paymentConfigService.getPublicPaymentConfig();

      if (response.success) {
        setPublicConfig(response.config);
      } else {
        throw new Error(response.message || 'Error obteniendo configuración pública');
      }

    } catch (error) {
      console.error('❌ [usePublicPaymentConfig] Error:', error);
      setError(error.message || 'Error obteniendo configuración pública');
      setPublicConfig(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicConfig();
  }, [fetchPublicConfig]);

  return {
    publicConfig,
    loading,
    error,
    refetch: fetchPublicConfig
  };
};

/**
 * Hook para estadísticas de métodos de pago
 */
export const usePaymentConfigStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📊 [usePaymentConfigStats] Obteniendo estadísticas');

      const response = await paymentConfigService.getPaymentStats();

      if (response.success) {
        setStats(response.stats);
      } else {
        throw new Error(response.message || 'Error obteniendo estadísticas');
      }

    } catch (error) {
      console.error('❌ [usePaymentConfigStats] Error:', error);
      setError(error.message || 'Error obteniendo estadísticas');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats
  };
};

/**
 * Hook para acciones de configuración de métodos de pago
 */
export const usePaymentConfigActions = (refetchConfigs, refetchStats) => {
  const [loading, setLoading] = useState(false);

  /**
   * Crear o actualizar configuración de método de pago
   */
  const upsertConfig = useCallback(async (configData) => {
    try {
      setLoading(true);
      console.log('➕ [usePaymentConfigActions] Creando/actualizando configuración');

      const response = await paymentConfigService.upsertPaymentConfig(configData);

      if (response.success) {
        // Refrescar datos automáticamente
        if (refetchConfigs) await refetchConfigs();
        if (refetchStats) await refetchStats();
        return response.config;
      } else {
        throw new Error(response.message || 'Error guardando configuración');
      }

    } catch (error) {
      console.error('❌ [usePaymentConfigActions] Error guardando:', error);
      toast.error(error.message || 'Error guardando configuración');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar configuración existente
   */
  const updateConfig = useCallback(async (type, configData) => {
    try {
      setLoading(true);
      console.log('✏️ [usePaymentConfigActions] Actualizando configuración:', type);

      const response = await paymentConfigService.updatePaymentConfig(type, configData);

      if (response.success) {
        // Refrescar datos automáticamente
        if (refetchConfigs) await refetchConfigs();
        if (refetchStats) await refetchStats();
        return response.config;
      } else {
        throw new Error(response.message || 'Error actualizando configuración');
      }

    } catch (error) {
      console.error('❌ [usePaymentConfigActions] Error actualizando:', error);
      toast.error(error.message || 'Error actualizando configuración');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Eliminar configuración
   */
  const deleteConfig = useCallback(async (type) => {
    try {
      setLoading(true);
      console.log('🗑️ [usePaymentConfigActions] Eliminando configuración:', type);

      const response = await paymentConfigService.deletePaymentConfig(type);

      if (response.success) {
        // Refrescar datos automáticamente
        if (refetchConfigs) await refetchConfigs();
        if (refetchStats) await refetchStats();
        return response;
      } else {
        throw new Error(response.message || 'Error eliminando configuración');
      }

    } catch (error) {
      console.error('❌ [usePaymentConfigActions] Error eliminando:', error);
      toast.error(error.message || 'Error eliminando configuración');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    upsertConfig,
    updateConfig,
    deleteConfig
  };
};

/**
 * Hook para tipos de métodos soportados
 */
export const useSupportedPaymentTypes = () => {
  const [supportedTypes, setSupportedTypes] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSupportedTypes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📋 [useSupportedPaymentTypes] Obteniendo tipos soportados');

      const response = await paymentConfigService.getSupportedTypes();

      if (response.success) {
        setSupportedTypes(response.supportedTypes);
      } else {
        throw new Error(response.message || 'Error obteniendo tipos soportados');
      }

    } catch (error) {
      console.error('❌ [useSupportedPaymentTypes] Error:', error);
      setError(error.message || 'Error obteniendo tipos soportados');
      setSupportedTypes(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSupportedTypes();
  }, [fetchSupportedTypes]);

  return {
    supportedTypes,
    loading,
    error,
    refetch: fetchSupportedTypes
  };
};

/**
 * Hook combinado para configuración de métodos de pago
 */
export const usePaymentConfigManagement = () => {
  const { configs, loading: configsLoading, error: configsError, refetch: refetchConfigs, checkMethodExists } = usePaymentConfigs();
  const { stats, loading: statsLoading, error: statsError, refetch: refetchStats } = usePaymentConfigStats();
  const { loading: actionsLoading, upsertConfig, updateConfig, deleteConfig } = usePaymentConfigActions(refetchConfigs, refetchStats);

  const handleUpsertConfig = useCallback(async (configData) => {
    try {
      const result = await upsertConfig(configData);
      await refetchConfigs();
      await refetchStats();
      return result;
    } catch (error) {
      throw error;
    }
  }, [upsertConfig, refetchConfigs, refetchStats]);

  const handleUpdateConfig = useCallback(async (type, configData) => {
    try {
      const result = await updateConfig(type, configData);
      await refetchConfigs();
      await refetchStats();
      return result;
    } catch (error) {
      throw error;
    }
  }, [updateConfig, refetchConfigs, refetchStats]);

  const handleDeleteConfig = useCallback(async (type) => {
    try {
      const result = await deleteConfig(type);
      await refetchConfigs();
      await refetchStats();
      return result;
    } catch (error) {
      throw error;
    }
  }, [deleteConfig, refetchConfigs, refetchStats]);

  return {
    // Datos
    configs,
    stats,
    
    // Estados de carga
    loading: configsLoading || statsLoading || actionsLoading,
    configsLoading,
    statsLoading,
    actionsLoading,
    
    // Errores
    error: configsError || statsError,
    configsError,
    statsError,
    
    // Acciones
    upsertConfig: handleUpsertConfig,
    updateConfig: handleUpdateConfig,
    deleteConfig: handleDeleteConfig,
    
    // Refetch
    refetch: () => {
      refetchConfigs();
      refetchStats();
    },
    
    // Funciones de validación
    checkMethodExists
  };
};
