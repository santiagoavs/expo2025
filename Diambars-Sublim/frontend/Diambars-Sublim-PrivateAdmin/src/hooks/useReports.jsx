// src/hooks/useReports.js - Custom hooks para reportes
import { useState, useEffect, useCallback } from 'react';
import reportService from '../api/ReportService';
import toast from 'react-hot-toast';

/**
 * Hook para métricas del dashboard
 */
export const useDashboardStats = (initialFilters = {}) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchStats = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);

      const currentFilters = customFilters || filters;
      console.log('📊 [useDashboardStats] Obteniendo stats:', currentFilters);

      const response = await reportService.getDashboardStats(currentFilters);

      if (response.success) {
        setStats(response.data);
      } else {
        throw new Error(response.message || 'Error obteniendo estadísticas');
      }

    } catch (error) {
      console.error('❌ [useDashboardStats] Error:', error);
      setError(error.message || 'Error obteniendo estadísticas');
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters) => {
    console.log('🔍 [useDashboardStats] Actualizando filtros:', newFilters);
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
 * Hook para reporte de ventas
 */
export const useSalesReport = (initialFilters = {}) => {
  const [salesData, setSalesData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    groupBy: 'day',
    ...initialFilters
  });

  const fetchSalesReport = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);

      const currentFilters = customFilters || filters;
      
      // Validar rango de fechas
      if (currentFilters.startDate && currentFilters.endDate) {
        const validation = reportService.validateDateRange(
          currentFilters.startDate,
          currentFilters.endDate
        );
        
        if (!validation.valid) {
          throw new Error(validation.error);
        }
      }

      console.log('💰 [useSalesReport] Obteniendo reporte ventas:', currentFilters);

      const response = await reportService.getSalesReport(currentFilters);

      if (response.success) {
        setSalesData(response.data);
        // Formatear datos para gráficos
        const formatted = reportService.formatChartData(response.data.chartData || [], 'line');
        setChartData(formatted);
      } else {
        throw new Error(response.message || 'Error obteniendo reporte');
      }

    } catch (error) {
      console.error('❌ [useSalesReport] Error:', error);
      setError(error.message || 'Error obteniendo reporte de ventas');
      setSalesData(null);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters) => {
    console.log('🔍 [useSalesReport] Actualizando filtros:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    fetchSalesReport();
  }, [fetchSalesReport]);

  return {
    salesData,
    chartData,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchSalesReport
  };
};

/**
 * Hook para productos más vendidos
 */
export const useTopProductsReport = (initialFilters = {}) => {
  const [productsData, setProductsData] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    limit: 10,
    ...initialFilters
  });

  const fetchTopProducts = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);

      const currentFilters = customFilters || filters;
      console.log('🏆 [useTopProductsReport] Obteniendo productos top:', currentFilters);

      const response = await reportService.getTopProductsReport(currentFilters);

      if (response.success) {
        setProductsData(response.data);
        // Formatear datos para gráficos
        const formatted = reportService.formatChartData(response.data.products || [], 'bar');
        setChartData(formatted);
      } else {
        throw new Error(response.message || 'Error obteniendo productos');
      }

    } catch (error) {
      console.error('❌ [useTopProductsReport] Error:', error);
      setError(error.message || 'Error obteniendo productos top');
      setProductsData(null);
      setChartData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters) => {
    console.log('🔍 [useTopProductsReport] Actualizando filtros:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    fetchTopProducts();
  }, [fetchTopProducts]);

  return {
    productsData,
    chartData,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchTopProducts
  };
};

/**
 * Hook para clientes frecuentes
 */
export const useTopCustomersReport = (initialFilters = {}) => {
  const [customersData, setCustomersData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    limit: 10,
    sortBy: 'totalSpent',
    ...initialFilters
  });

  const fetchTopCustomers = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);

      const currentFilters = customFilters || filters;
      console.log('👥 [useTopCustomersReport] Obteniendo clientes top:', currentFilters);

      const response = await reportService.getTopCustomersReport(currentFilters);

      if (response.success) {
        setCustomersData(response.data);
      } else {
        throw new Error(response.message || 'Error obteniendo clientes');
      }

    } catch (error) {
      console.error('❌ [useTopCustomersReport] Error:', error);
      setError(error.message || 'Error obteniendo clientes top');
      setCustomersData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters) => {
    console.log('🔍 [useTopCustomersReport] Actualizando filtros:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    fetchTopCustomers();
  }, [fetchTopCustomers]);

  return {
    customersData,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchTopCustomers
  };
};

/**
 * Hook para reporte de producción
 */
export const useProductionReport = (initialFilters = {}) => {
  const [productionData, setProductionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchProductionReport = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);

      const currentFilters = customFilters || filters;
      console.log('⏱️ [useProductionReport] Obteniendo reporte producción:', currentFilters);

      const response = await reportService.getProductionReport(currentFilters);

      if (response.success) {
        setProductionData(response.data);
      } else {
        throw new Error(response.message || 'Error obteniendo reporte');
      }

    } catch (error) {
      console.error('❌ [useProductionReport] Error:', error);
      setError(error.message || 'Error obteniendo reporte de producción');
      setProductionData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters) => {
    console.log('🔍 [useProductionReport] Actualizando filtros:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    fetchProductionReport();
  }, [fetchProductionReport]);

  return {
    productionData,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchProductionReport
  };
};

/**
 * Hook para reportes personalizados
 */
export const useCustomReport = (reportType) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchCustomReport = useCallback(async (customFilters = null) => {
    if (!reportType) return;

    try {
      setLoading(true);
      setError(null);

      const currentFilters = customFilters || filters;
      console.log('🔧 [useCustomReport] Obteniendo reporte personalizado:', reportType, currentFilters);

      const response = await reportService.getCustomReport(reportType, currentFilters);

      if (response.success) {
        setReportData(response.data);
      } else {
        throw new Error(response.message || 'Error obteniendo reporte');
      }

    } catch (error) {
      console.error('❌ [useCustomReport] Error:', error);
      setError(error.message || 'Error obteniendo reporte personalizado');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  }, [reportType, filters]);

  const updateFilters = useCallback((newFilters) => {
    console.log('🔍 [useCustomReport] Actualizando filtros:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  useEffect(() => {
    fetchCustomReport();
  }, [fetchCustomReport]);

  return {
    reportData,
    loading,
    error,
    filters,
    updateFilters,
    refetch: fetchCustomReport
  };
};

/**
 * Hook para exportación de reportes
 */
export const useReportExport = () => {
  const [loading, setLoading] = useState(false);

  /**
   * Exportar a Excel
   */
  const exportToExcel = useCallback(async (reportType, filters = {}) => {
    try {
      setLoading(true);
      console.log('📄 [useReportExport] Exportando Excel:', reportType);

      const response = await reportService.exportReportToExcel(reportType, filters);
      
      if (response.success) {
        toast.success('Reporte descargado exitosamente');
        return response;
      } else {
        throw new Error('Error exportando reporte');
      }

    } catch (error) {
      console.error('❌ [useReportExport] Error exportando Excel:', error);
      toast.error(error.message || 'Error exportando reporte');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Exportar a PDF
   */
  const exportToPDF = useCallback(async (reportType, filters = {}) => {
    try {
      setLoading(true);
      console.log('📑 [useReportExport] Exportando PDF:', reportType);

      const response = await reportService.exportReportToPDF(reportType, filters);
      
      if (response.success) {
        toast.success('Reporte descargado exitosamente');
        return response;
      } else {
        throw new Error('Error exportando reporte');
      }

    } catch (error) {
      console.error('❌ [useReportExport] Error exportando PDF:', error);
      toast.error(error.message || 'Error exportando reporte');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    exportToExcel,
    exportToPDF
  };
};

/**
 * Hook para opciones de filtrado
 */
export const useReportFilters = () => {
  const [filterOptions, setFilterOptions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFilterOptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('⚙️ [useReportFilters] Obteniendo opciones de filtro');

      const response = await reportService.getFilterOptions();

      if (response.success) {
        setFilterOptions(response.data);
      } else {
        throw new Error(response.message || 'Error obteniendo opciones');
      }

    } catch (error) {
      console.error('❌ [useReportFilters] Error:', error);
      setError(error.message || 'Error obteniendo opciones de filtro');
      setFilterOptions(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  return {
    filterOptions,
    loading,
    error,
    refetch: fetchFilterOptions
  };
};

/**
 * Hook para validación de fechas en reportes
 */
export const useDateValidation = () => {
  const validateRange = useCallback((startDate, endDate) => {
    return reportService.validateDateRange(startDate, endDate);
  }, []);

  const getPresetRanges = useCallback(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const last3Months = new Date(today);
    last3Months.setMonth(last3Months.getMonth() - 3);
    
    const lastYear = new Date(today);
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    return {
      today: {
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        label: 'Hoy'
      },
      yesterday: {
        startDate: yesterday.toISOString().split('T')[0],
        endDate: yesterday.toISOString().split('T')[0],
        label: 'Ayer'
      },
      lastWeek: {
        startDate: lastWeek.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        label: 'Últimos 7 días'
      },
      lastMonth: {
        startDate: lastMonth.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        label: 'Último mes'
      },
      last3Months: {
        startDate: last3Months.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        label: 'Últimos 3 meses'
      },
      lastYear: {
        startDate: lastYear.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0],
        label: 'Último año'
      }
    };
  }, []);

  return {
    validateRange,
    getPresetRanges
  };
};