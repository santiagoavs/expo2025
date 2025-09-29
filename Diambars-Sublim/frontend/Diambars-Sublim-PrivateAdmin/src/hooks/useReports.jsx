// src/hooks/useReports.jsx - Hook personalizado para reportes refactorizado
import { useState, useEffect, useCallback, useRef } from 'react';
import reportService from '../api/ReportService';
import Swal from 'sweetalert2';

/**
 * Hook principal para dashboard stats
 */
export const useDashboardStats = (initialFilters = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchDashboardStats = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = customFilters || filters;
      console.log('📊 [useDashboardStats] Fetching dashboard stats with filters:', currentFilters);
      
      const response = await reportService.getDashboardStats(currentFilters);
      console.log('📊 [useDashboardStats] Response received:', response);
      
      if (response.success) {
        console.log('📊 [useDashboardStats] Setting data:', response.data);
        setData(response.data);
      } else {
        console.error('📊 [useDashboardStats] Response not successful:', response);
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
    updateFilters: setFilters,
    
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
 * Hook para reportes de ventas
 */
export const useSalesReport = (initialFilters = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchSalesReport = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = customFilters || filters;
      console.log('📊 [useSalesReport] Fetching sales report with filters:', currentFilters);
      
      // Validar filtros
      const validation = reportService.validateReportFilters(currentFilters);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      const response = await reportService.getSalesReport(currentFilters);
      console.log('📊 [useSalesReport] Response received:', response);
      
      if (response.success) {
        console.log('📊 [useSalesReport] Setting data:', response.data);
        setData(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useSalesReport] Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchSalesReport();
  }, []); // Solo ejecutar una vez al montar

  const exportSalesReport = useCallback(async (format = 'excel') => {
    try {
      const filename = `ventas_${filters.startDate || 'all'}_${Date.now()}`;
      
      if (format === 'excel') {
        await reportService.exportToExcel('sales', filters, filename);
      } else {
        await reportService.exportToPDF('sales', filters, filename);
      }
      
      await Swal.fire({
        title: 'Exportado',
        text: `Reporte exportado como ${format.toUpperCase()}`,
        icon: 'success',
        confirmButtonColor: '#1F64BF'
      });
    } catch (error) {
      console.error('❌ [useSalesReport] Error exportando:', error);
      throw error;
    }
  }, [filters]);

  return {
    data,
    loading,
    error,
    filters,
    fetchSalesReport,
    exportSalesReport,
    updateFilters: setFilters,
    hasData: !!data
  };
};

/**
 * Hook para productos top
 */
export const useTopProductsReport = (initialFilters = { limit: 10 }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchTopProducts = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = customFilters || filters;
      console.log('📊 [useTopProductsReport] Fetching top products with filters:', currentFilters);
      
      const response = await reportService.getTopProductsReport(currentFilters);
      console.log('📊 [useTopProductsReport] Response received:', response);
      
      if (response.success) {
        console.log('📊 [useTopProductsReport] Setting data:', response.data);
        setData(response.data);
      } else {
        console.error('📊 [useTopProductsReport] Response not successful:', response);
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useTopProductsReport] Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTopProducts();
  }, []); // Solo ejecutar una vez al montar

  return {
    data,
    loading,
    error,
    fetchTopProducts,
    updateFilters: setFilters,
    hasData: !!data
  };
};

/**
 * Hook para clientes top
 */
export const useTopCustomersReport = (initialFilters = { limit: 10, sortBy: 'totalSpent' }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchTopCustomers = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = customFilters || filters;
      console.log('📊 [useTopCustomersReport] Fetching top customers with filters:', currentFilters);
      
      const response = await reportService.getTopCustomersReport(currentFilters);
      console.log('📊 [useTopCustomersReport] Response received:', response);
      
      if (response.success) {
        console.log('📊 [useTopCustomersReport] Setting data:', response.data);
        setData(response.data);
      } else {
        console.error('📊 [useTopCustomersReport] Response not successful:', response);
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useTopCustomersReport] Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTopCustomers();
  }, []); // Solo ejecutar una vez al montar

  return {
    data,
    loading,
    error,
    fetchTopCustomers,
    updateFilters: setFilters,
    hasData: !!data
  };
};

/**
 * Hook para reporte de producción
 */
export const useProductionReport = (initialFilters = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchProductionReport = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentFilters = customFilters || filters;
      const response = await reportService.getProductionReport(currentFilters);
      
      if (response.success) {
        setData(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useProductionReport] Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchProductionReport();
  }, []); // Solo ejecutar una vez al montar

  return {
    data,
    loading,
    error,
    fetchProductionReport,
    updateFilters: setFilters,
    hasData: !!data,
    
    // Métricas calculadas
    averageProductionTime: data?.summary?.averageProductionDays || 0,
    onTimeRate: data?.summary?.onTimeRate || 0,
    totalOrdersAnalyzed: data?.summary?.totalOrders || 0
  };
};

/**
 * Hook para reportes de pagos
 */
export const usePaymentReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getPaymentMethodsReport = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reportService.getPaymentMethodsReport(filters);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [usePaymentReports] Error métodos pago:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCashReport = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reportService.getCashReport(filters);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [usePaymentReports] Error efectivo:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPendingTransfersReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reportService.getPendingTransfersReport();
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [usePaymentReports] Error transferencias pendientes:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getPaymentMethodsReport,
    getCashReport,
    getPendingTransfersReport
  };
};

/**
 * Hook para exportación de reportes
 */
export const useReportExport = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const exportReport = useCallback(async (reportType, format = 'excel', filters = {}, filename = null) => {
    try {
      setLoading(true);
      setError(null);
      
      const finalFilename = filename || `${reportType}_${Date.now()}`;
      
      if (format === 'excel') {
        await reportService.exportToExcel(reportType, filters, finalFilename);
      } else if (format === 'pdf') {
        await reportService.exportToPDF(reportType, filters, finalFilename);
      } else {
        throw new Error(`Formato no soportado: ${format}`);
      }
      
      await Swal.fire({
        title: 'Exportado exitosamente',
        text: `El reporte se ha exportado como ${format.toUpperCase()}`,
        icon: 'success',
        confirmButtonColor: '#1F64BF'
      });
      
      return true;
    } catch (error) {
      console.error('❌ [useReportExport] Error:', error);
      setError(error.message);
      
      await Swal.fire({
        title: 'Error al exportar',
        text: error.message || 'No se pudo exportar el reporte',
        icon: 'error',
        confirmButtonColor: '#1F64BF'
      });
      
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    exportReport,
    loading,
    error
  };
};

/**
 * Hook para comparación de períodos
 */
export const usePeriodComparison = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const comparePeriods = useCallback(async (currentPeriod, previousPeriod) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reportService.getPeriodComparison(currentPeriod, previousPeriod);
      
      if (response.success) {
        setData(response.data);
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [usePeriodComparison] Error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    comparePeriods,
    
    // Utilidades
    hasComparison: !!data,
    revenueGrowth: data?.comparison?.revenue?.growth || 0,
    ordersGrowth: data?.comparison?.orders?.growth || 0,
    aovGrowth: data?.comparison?.averageOrderValue?.growth || 0
  };
};

/**
 * Hook para reportes personalizados
 */
export const useCustomReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateCustomReport = useCallback(async (reportConfig) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await reportService.getCustomReport(reportConfig);
      
      if (response.success) {
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useCustomReports] Error:', error);
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    generateCustomReport,
    loading,
    error
  };
};

/**
 * Hook principal que combina todos los reportes
 */
export const useReports = (initialConfig = {}) => {
  const dashboardStats = useDashboardStats(initialConfig.dashboard);
  const salesReport = useSalesReport(initialConfig.sales);
  const topProducts = useTopProductsReport(initialConfig.products);
  const topCustomers = useTopCustomersReport(initialConfig.customers);
  const productionReport = useProductionReport(initialConfig.production);
  const paymentReports = usePaymentReports();
  const reportExport = useReportExport();
  const periodComparison = usePeriodComparison();
  const customReports = useCustomReports();

  // Estado general
  const isAnyLoading = 
    dashboardStats.loading || 
    salesReport.loading || 
    topProducts.loading || 
    topCustomers.loading || 
    productionReport.loading ||
    paymentReports.loading ||
    reportExport.loading ||
    periodComparison.loading ||
    customReports.loading;

  const hasAnyError = 
    dashboardStats.error || 
    salesReport.error || 
    topProducts.error || 
    topCustomers.error || 
    productionReport.error ||
    paymentReports.error ||
    reportExport.error ||
    periodComparison.error ||
    customReports.error;

  return {
    // Sub-hooks
    dashboardStats,
    salesReport,
    topProducts,
    topCustomers,
    productionReport,
    paymentReports,
    reportExport,
    periodComparison,
    customReports,
    
    // Estado general
    isAnyLoading,
    hasAnyError,
    
    // Utilidades
    dateRangePresets: reportService.getDateRangePresets(),
    validateFilters: reportService.validateReportFilters
  };
};

export default useReports;