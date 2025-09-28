// src/api/ReportService.jsx - Servicio de reportes actualizado para nueva arquitectura
import apiClient from './ApiClient';

const reportService = {
  // ==================== MÉTRICAS DASHBOARD ====================
  
  /**
   * Obtener métricas del dashboard
   */
  async getDashboardStats(filters = {}) {
    try {
      console.log('📊 [reportService] Obteniendo stats del dashboard:', filters);
      
      const response = await apiClient.get('/orders/reports/dashboard', {
        params: filters
      });
      
      return response;
    } catch (error) {
      console.error('❌ [reportService] Error obteniendo dashboard:', error);
      throw this.handleError(error);
    }
  },

  // ==================== REPORTES DE VENTAS ====================

  /**
   * Reporte de ventas por período
   */
  async getSalesReport(filters = {}) {
    try {
      console.log('💰 [reportService] Obteniendo reporte de ventas:', filters);
      
      const response = await apiClient.get('/orders/reports/sales', {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          groupBy: filters.groupBy || 'day',
          ...filters
        }
      });
      
      // Formatear datos para gráficos
      if (response.success && response.data) {
        response.data = this.formatSalesDataForCharts(response.data);
      }
      
      return response;
    } catch (error) {
      console.error('❌ [reportService] Error obteniendo reporte ventas:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Reporte de productos más vendidos
   */
  async getTopProductsReport(filters = {}) {
    try {
      console.log('🏆 [reportService] Obteniendo productos top:', filters);
      
      const response = await apiClient.get('/orders/reports/top-products', {
        params: {
          limit: filters.limit || 10,
          startDate: filters.startDate,
          endDate: filters.endDate,
          ...filters
        }
      });
      
      return response;
    } catch (error) {
      console.error('❌ [reportService] Error obteniendo productos top:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Reporte de clientes frecuentes
   */
  async getTopCustomersReport(filters = {}) {
    try {
      console.log('👑 [reportService] Obteniendo clientes top:', filters);
      
      const response = await apiClient.get('/orders/reports/top-customers', {
        params: {
          limit: filters.limit || 10,
          sortBy: filters.sortBy || 'totalSpent',
          startDate: filters.startDate,
          endDate: filters.endDate,
          ...filters
        }
      });
      
      return response;
    } catch (error) {
      console.error('❌ [reportService] Error obteniendo clientes top:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Reporte de tiempos de producción
   */
  async getProductionReport(filters = {}) {
    try {
      console.log('⏱️ [reportService] Obteniendo reporte de producción:', filters);
      
      const response = await apiClient.get('/orders/reports/production', {
        params: filters
      });
      
      return response;
    } catch (error) {
      console.error('❌ [reportService] Error obteniendo reporte producción:', error);
      throw this.handleError(error);
    }
  },

  // ==================== REPORTES DE PAGOS ====================

  /**
   * Reporte de pagos por método
   */
  async getPaymentMethodsReport(filters = {}) {
    try {
      console.log('💳 [reportService] Obteniendo reporte de métodos de pago:', filters);
      
      const response = await apiClient.get('/payments/reports/methods', {
        params: filters
      });
      
      return response;
    } catch (error) {
      console.error('❌ [reportService] Error obteniendo reporte métodos pago:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Reporte de efectivo por día/período
   */
  async getCashReport(filters = {}) {
    try {
      console.log('💵 [reportService] Obteniendo reporte de efectivo:', filters);
      
      const response = await apiClient.get('/payments/reports/cash', {
        params: filters
      });
      
      return response;
    } catch (error) {
      console.error('❌ [reportService] Error obteniendo reporte efectivo:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Reporte de transferencias pendientes
   */
  async getPendingTransfersReport() {
    try {
      console.log('🏦 [reportService] Obteniendo transferencias pendientes');
      
      const response = await apiClient.get('/payments/transfers/pending');
      
      return response;
    } catch (error) {
      console.error('❌ [reportService] Error obteniendo transferencias pendientes:', error);
      throw this.handleError(error);
    }
  },

  // ==================== REPORTES PERSONALIZADOS ====================

  /**
   * Reporte personalizado con múltiples métricas
   */
  async getCustomReport(reportConfig) {
    try {
      console.log('📈 [reportService] Generando reporte personalizado:', reportConfig);
      
      const response = await apiClient.post('/reports/custom', reportConfig);
      
      return response;
    } catch (error) {
      console.error('❌ [reportService] Error generando reporte personalizado:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Comparativo período a período
   */
  async getPeriodComparison(currentPeriod, previousPeriod) {
    try {
      console.log('📊 [reportService] Comparando períodos:', currentPeriod, previousPeriod);
      
      const [currentData, previousData] = await Promise.all([
        this.getSalesReport(currentPeriod),
        this.getSalesReport(previousPeriod)
      ]);
      
      return {
        success: true,
        data: {
          current: currentData.data,
          previous: previousData.data,
          comparison: this.calculatePeriodComparison(currentData.data, previousData.data)
        }
      };
    } catch (error) {
      console.error('❌ [reportService] Error comparando períodos:', error);
      throw this.handleError(error);
    }
  },

  // ==================== EXPORTACIÓN ====================

  /**
   * Exportar reporte a Excel
   */
  async exportToExcel(reportType, filters = {}, filename = null) {
    try {
      console.log('📑 [reportService] Exportando a Excel:', reportType);
      
      const response = await apiClient.get(`/reports/export/${reportType}`, {
        params: { 
          format: 'excel',
          filename: filename || `reporte_${reportType}_${Date.now()}`,
          ...filters 
        },
        responseType: 'blob'
      });

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `reporte_${reportType}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Reporte exportado exitosamente' };
    } catch (error) {
      console.error('❌ [reportService] Error exportando a Excel:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Exportar reporte a PDF
   */
  async exportToPDF(reportType, filters = {}, filename = null) {
    try {
      console.log('📄 [reportService] Exportando a PDF:', reportType);
      
      const response = await apiClient.get(`/reports/export/${reportType}`, {
        params: { 
          format: 'pdf',
          filename: filename || `reporte_${reportType}_${Date.now()}`,
          ...filters 
        },
        responseType: 'blob'
      });

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `reporte_${reportType}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true, message: 'Reporte exportado exitosamente' };
    } catch (error) {
      console.error('❌ [reportService] Error exportando a PDF:', error);
      throw this.handleError(error);
    }
  },

  // ==================== UTILIDADES ====================

  /**
   * Formatear datos de ventas para gráficos
   */
  formatSalesDataForCharts(salesData) {
    if (!salesData || !salesData.salesByPeriod) return salesData;

    // Formatear para Chart.js
    const chartData = {
      labels: salesData.salesByPeriod.map(item => {
        const date = new Date(item._id);
        return date.toLocaleDateString('es-CO', { 
          month: 'short', 
          day: 'numeric' 
        });
      }),
      datasets: [
        {
          label: 'Ventas',
          data: salesData.salesByPeriod.map(item => item.totalRevenue),
          backgroundColor: 'rgba(31, 100, 191, 0.1)',
          borderColor: '#1F64BF',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        },
        {
          label: 'Órdenes',
          data: salesData.salesByPeriod.map(item => item.totalOrders),
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderColor: '#10B981',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    };

    return {
      ...salesData,
      chartData,
      formattedData: salesData.salesByPeriod.map(item => ({
        ...item,
        formattedRevenue: new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'USD'
        }).format(item.totalRevenue),
        formattedDate: new Date(item._id).toLocaleDateString('es-CO')
      }))
    };
  },

  /**
   * Calcular comparación entre períodos
   */
  calculatePeriodComparison(currentData, previousData) {
    const current = currentData.summary || {};
    const previous = previousData.summary || {};

    const calculateGrowth = (current, previous) => {
      if (!previous || previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      revenue: {
        current: current.totalRevenue || 0,
        previous: previous.totalRevenue || 0,
        growth: calculateGrowth(current.totalRevenue, previous.totalRevenue),
        difference: (current.totalRevenue || 0) - (previous.totalRevenue || 0)
      },
      orders: {
        current: current.totalOrders || 0,
        previous: previous.totalOrders || 0,
        growth: calculateGrowth(current.totalOrders, previous.totalOrders),
        difference: (current.totalOrders || 0) - (previous.totalOrders || 0)
      },
      averageOrderValue: {
        current: current.averageOrderValue || 0,
        previous: previous.averageOrderValue || 0,
        growth: calculateGrowth(current.averageOrderValue, previous.averageOrderValue),
        difference: (current.averageOrderValue || 0) - (previous.averageOrderValue || 0)
      }
    };
  },

  /**
   * Generar configuración de fechas predeterminadas
   */
  getDateRangePresets() {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const thisWeekStart = new Date(today);
    thisWeekStart.setDate(today.getDate() - today.getDay());
    
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const lastMonthStart = new Date(thisMonthStart);
    lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
    const lastMonthEnd = new Date(thisMonthStart);
    lastMonthEnd.setDate(lastMonthEnd.getDate() - 1);

    return {
      today: {
        label: 'Hoy',
        startDate: today.toISOString(),
        endDate: now.toISOString()
      },
      yesterday: {
        label: 'Ayer',
        startDate: yesterday.toISOString(),
        endDate: today.toISOString()
      },
      thisWeek: {
        label: 'Esta semana',
        startDate: thisWeekStart.toISOString(),
        endDate: now.toISOString()
      },
      thisMonth: {
        label: 'Este mes',
        startDate: thisMonthStart.toISOString(),
        endDate: now.toISOString()
      },
      lastMonth: {
        label: 'Mes pasado',
        startDate: lastMonthStart.toISOString(),
        endDate: lastMonthEnd.toISOString()
      },
      last30Days: {
        label: 'Últimos 30 días',
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: now.toISOString()
      }
    };
  },

  /**
   * Validar filtros de reporte
   */
  validateReportFilters(filters) {
    const errors = [];
    
    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      
      if (start > end) {
        errors.push('La fecha de inicio debe ser anterior a la fecha de fin');
      }
      
      if (end > new Date()) {
        errors.push('La fecha de fin no puede ser futura');
      }
      
      const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
      if (daysDiff > 365) {
        errors.push('El rango de fechas no puede exceder 365 días');
      }
    }
    
    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) {
      errors.push('El límite debe estar entre 1 y 100');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Manejo de errores centralizado
   */
  handleError(error) {
    if (error.response?.data) {
      return {
        message: error.response.data.message || 'Error en el servicio de reportes',
        code: error.response.data.error || 'REPORT_ERROR',
        statusCode: error.response.status
      };
    }
    
    if (error.code === 'NETWORK_ERROR') {
      return {
        message: 'Error de conexión. Verifica tu conexión a internet.',
        code: 'NETWORK_ERROR'
      };
    }
    
    return {
      message: error.message || 'Error desconocido en reportes',
      code: 'UNKNOWN_ERROR'
    };
  }
};

export default reportService;