// src/hooks/useOrders.js - Custom hooks para órdenes
import { useState, useEffect, useCallback, useRef } from 'react';
import orderService from '../api/orderService';
import toast from 'react-hot-toast';

/**
 * Hook principal para gestión de órdenes
 */
export const useOrders = (initialFilters = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState(initialFilters);
  const abortControllerRef = useRef(null);

  /**
   * Obtener órdenes con filtros
   */
  const fetchOrders = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);

      // Cancelar request anterior si existe
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Crear nuevo controller
      abortControllerRef.current = new AbortController();

      const currentFilters = customFilters || filters;
      console.log('📦 [useOrders] Cargando órdenes con filtros:', currentFilters);

      const response = await orderService.getOrders({
        ...currentFilters,
        page: pagination.page,
        limit: pagination.limit
      });

      if (response.success) {
        setOrders(response.data.orders || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 0
        }));
      } else {
        throw new Error(response.message || 'Error cargando órdenes');
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🔄 [useOrders] Request cancelado');
        return;
      }
      
      console.error('❌ [useOrders] Error cargando órdenes:', error);
      setError(error.message || 'Error cargando órdenes');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  /**
   * Actualizar filtros y recargar
   */
  const updateFilters = useCallback((newFilters) => {
    console.log('🔍 [useOrders] Actualizando filtros:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset a primera página
  }, []);

  /**
   * Cambiar página
   */
  const changePage = useCallback((newPage) => {
    console.log('📄 [useOrders] Cambiando página:', newPage);
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  /**
   * Refrescar órdenes
   */
  const refreshOrders = useCallback(() => {
    console.log('🔄 [useOrders] Refrescando órdenes');
    fetchOrders();
  }, [fetchOrders]);

  // Cargar órdenes cuando cambien filtros o paginación
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    orders,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    refreshOrders,
    fetchOrders
  };
};

/**
 * Hook para orden individual
 */
export const useOrder = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [useOrder] Cargando orden:', orderId);
      const response = await orderService.getOrderById(orderId);

      if (response.success) {
        setOrder(response.data);
      } else {
        throw new Error(response.message || 'Error cargando orden');
      }

    } catch (error) {
      console.error('❌ [useOrder] Error cargando orden:', error);
      setError(error.message || 'Error cargando orden');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder
  };
};

/**
 * Hook para acciones de órdenes (cotizar, actualizar estado, etc.)
 */
export const useOrderActions = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Enviar cotización
   */
  const submitQuote = useCallback(async (orderId, quoteData) => {
    try {
      setLoading(true);
      console.log('💰 [useOrderActions] Enviando cotización:', orderId);

      const response = await orderService.submitQuote(orderId, quoteData);

      if (response.success) {
        toast.success('Cotización enviada exitosamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error enviando cotización');
      }

    } catch (error) {
      console.error('❌ [useOrderActions] Error enviando cotización:', error);
      toast.error(error.message || 'Error enviando cotización');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar estado de orden
   */
  const updateStatus = useCallback(async (orderId, newStatus, notes = '') => {
    try {
      setLoading(true);
      console.log('🔄 [useOrderActions] Actualizando estado:', orderId, newStatus);

      const response = await orderService.updateOrderStatus(orderId, newStatus, notes);

      if (response.success) {
        toast.success('Estado actualizado exitosamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error actualizando estado');
      }

    } catch (error) {
      console.error('❌ [useOrderActions] Error actualizando estado:', error);
      toast.error(error.message || 'Error actualizando estado');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cancelar orden
   */
  const cancelOrder = useCallback(async (orderId, reason = '') => {
    try {
      setLoading(true);
      console.log('❌ [useOrderActions] Cancelando orden:', orderId);

      const response = await orderService.cancelOrder(orderId, reason);

      if (response.success) {
        toast.success('Orden cancelada exitosamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error cancelando orden');
      }

    } catch (error) {
      console.error('❌ [useOrderActions] Error cancelando orden:', error);
      toast.error(error.message || 'Error cancelando orden');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Subir foto de producción
   */
  const uploadProductionPhoto = useCallback(async (orderId, photoData) => {
    try {
      setLoading(true);
      console.log('📸 [useOrderActions] Subiendo foto:', orderId);

      const response = await orderService.uploadProductionPhoto(orderId, photoData);

      if (response.success) {
        toast.success('Foto subida exitosamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error subiendo foto');
      }

    } catch (error) {
      console.error('❌ [useOrderActions] Error subiendo foto:', error);
      toast.error(error.message || 'Error subiendo foto');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar progreso de producción
   */
  const updateProductionProgress = useCallback(async (orderId, itemId, stageData) => {
    try {
      setLoading(true);
      console.log('⚙️ [useOrderActions] Actualizando progreso:', orderId, itemId);

      const response = await orderService.updateProductionProgress(orderId, itemId, stageData);

      if (response.success) {
        toast.success('Progreso actualizado exitosamente');
        return response.data;
      } else {
        throw new Error(response.message || 'Error actualizando progreso');
      }

    } catch (error) {
      console.error('❌ [useOrderActions] Error actualizando progreso:', error);
      toast.error(error.message || 'Error actualizando progreso');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    submitQuote,
    updateStatus,
    cancelOrder,
    uploadProductionPhoto,
    updateProductionProgress
  };
};

/**
 * Hook para tracking de órdenes
 */
export const useOrderTracking = (orderId) => {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTracking = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📍 [useOrderTracking] Obteniendo tracking:', orderId);
      const response = await orderService.getOrderTracking(orderId);

      if (response.success) {
        setTracking(response.data);
      } else {
        throw new Error(response.message || 'Error obteniendo tracking');
      }

    } catch (error) {
      console.error('❌ [useOrderTracking] Error obteniendo tracking:', error);
      setError(error.message || 'Error obteniendo tracking');
      setTracking(null);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchTracking();
  }, [fetchTracking]);

  return {
    tracking,
    loading,
    error,
    refetch: fetchTracking
  };
};