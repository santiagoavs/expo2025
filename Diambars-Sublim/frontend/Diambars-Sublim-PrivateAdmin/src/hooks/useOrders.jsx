// src/hooks/useOrders.jsx - Hook personalizado para gestión de órdenes refactorizado
import { useState, useEffect, useCallback, useRef } from 'react';
import orderService from '../api/OrderService';
import Swal from 'sweetalert2';

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
    totalPages: 0,
    hasNext: false,
    hasPrev: false
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
          total: response.data.pagination?.total || 0,
          totalPages: response.data.pagination?.totalPages || 0,
          hasNext: response.data.pagination?.hasNext || false,
          hasPrev: response.data.pagination?.hasPrev || false
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
   * Obtener orden específica por ID
   */
  const getOrderById = useCallback(async (orderId) => {
    try {
      console.log('🔍 [useOrders] Obteniendo orden:', orderId);
      
      const response = await orderService.getOrderById(orderId);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message || 'Orden no encontrada');
      }
    } catch (error) {
      console.error('❌ [useOrders] Error obteniendo orden:', error);
      throw error;
    }
  }, []);

  /**
   * Crear nueva orden
   */
  const createOrder = useCallback(async (orderData) => {
    try {
      const validation = orderService.validateOrderData(orderData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await orderService.createOrder(orderData);
      
      if (response.success) {
        await Swal.fire({
          title: 'Orden creada',
          text: `Orden ${response.data.orderNumber || 'nueva'} creada exitosamente`,
          icon: 'success',
          confirmButtonColor: '#1F64BF'
        });
        
        // Refrescar lista de órdenes
        fetchOrders();
        
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useOrders] Error creando orden:', error);
      throw error;
    }
  }, [fetchOrders]);

  /**
   * Actualizar estado de una orden
   */
  const updateOrderStatus = useCallback(async (orderId, newStatus, notes = '') => {
    try {
      const response = await orderService.updateOrderStatus(orderId, newStatus, notes);
      
      if (response.success) {
        await Swal.fire({
          title: 'Estado actualizado',
          text: `La orden ha sido marcada como "${newStatus}"`,
          icon: 'success',
          confirmButtonColor: '#1F64BF'
        });
        
        // Actualizar orden en la lista local
        setOrders(prev => prev.map(order => 
          order._id === orderId 
            ? { 
                ...order, 
                status: newStatus, 
                statusLabel: orderService.formatOrderForDisplay({ status: newStatus }).statusLabel 
              }
            : order
        ));
        
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useOrders] Error actualizando estado:', error);
      throw error;
    }
  }, []);

  /**
   * Búsqueda de órdenes
   */
  const searchOrders = useCallback(async (searchParams) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderService.searchOrders(searchParams);
      
      if (response.success) {
        setOrders(response.data.orders || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0,
          totalPages: response.data.pagination?.totalPages || 0
        }));
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useOrders] Error en búsqueda:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Actualizar filtros y recargar
   */
  const updateFilters = useCallback((newFilters) => {
    console.log('🔍 [useOrders] Actualizando filtros:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset a primera página
  }, []);

  /**
   * Limpiar filtros
   */
  const clearFilters = useCallback(() => {
    console.log('🔄 [useOrders] Limpiando filtros');
    setFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
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
    // Estado
    orders,
    loading,
    error,
    pagination,
    filters,
    
    // Acciones
    fetchOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    searchOrders,
    updateFilters,
    clearFilters,
    changePage,
    refreshOrders,
    
    // Utilidades
    hasOrders: orders.length > 0,
    isEmpty: !loading && orders.length === 0,
    getStatusColor: orderService.getStatusColor
  };
};

/**
 * Hook para estadísticas de órdenes
 */
export const useOrderStats = (filters = {}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = customFilters || filters;
      const response = await orderService.getOrderStats(currentFilters);
      
      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useOrderStats] Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

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
 * Hook para órdenes por usuario
 */
export const useUserOrders = (userId) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUserOrders = useCallback(async (filters = {}) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderService.getUserOrders(userId, filters);
      
      if (response.success) {
        setOrders(response.data.orders || []);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useUserOrders] Error:', error);
      setError(error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserOrders();
  }, [fetchUserOrders]);

  return {
    orders,
    loading,
    error,
    refetch: fetchUserOrders,
    hasOrders: orders.length > 0
  };
};

/**
 * Hook para dashboard de órdenes (estadísticas principales)
 */
export const useDashboardStats = (filters = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDashboardStats = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = customFilters || filters;
      const response = await orderService.getDashboardStats(currentFilters);
      
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useDashboardStats] Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchDashboardStats();
  }, []); // Solo ejecutar una vez al montar

  return {
    data,
    loading,
    error,
    refetch: fetchDashboardStats,
    
    // Métricas calculadas
    todayOrders: data?.today?.totalOrders || 0,
    todayRevenue: data?.today?.totalRevenue || 0,
    monthOrders: data?.thisMonth?.totalOrders || 0,
    monthRevenue: data?.thisMonth?.totalRevenue || 0,
    ordersByStatus: data?.ordersByStatus || {},
    inProduction: data?.production?.inProduction || 0,
    readyForDelivery: data?.production?.readyForDelivery || 0
  };
};

/**
 * Hook para reportes de órdenes
 */
export const useOrderReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Generar reporte de ventas
   */
  const generateSalesReport = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderService.getSalesReport(filters);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useOrderReports] Error reporte ventas:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generar reporte de productos top
   */
  const generateTopProductsReport = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderService.getTopProductsReport(filters);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useOrderReports] Error productos top:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generar reporte de clientes top
   */
  const generateTopCustomersReport = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderService.getTopCustomersReport(filters);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useOrderReports] Error clientes top:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Generar reporte de producción
   */
  const generateProductionReport = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderService.getProductionReport(filters);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useOrderReports] Error producción:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    generateSalesReport,
    generateTopProductsReport,
    generateTopCustomersReport,
    generateProductionReport
  };
};

export default useOrders;