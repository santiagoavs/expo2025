// src/services/reportService.js - Servicio para reportes
import apiClient from '../api/ApiClient';

const reportService = {
  // ==================== MÉTODOS DE REPORTES ====================

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
      console.log('👥 [reportService] Obteniendo clientes top:', filters);
      
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
      console.log('⏱️ [reportService] Obteniendo reporte producción:', filters);
      
      const response = await apiClient.get('/orders/reports/production', {
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          status: filters.status,
          ...filters
        }
      });
      
      return response;
    } catch (error) {
      console.error('❌ [reportService] Error obteniendo reporte producción:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Reporte personalizado con múltiples métricas
   */
  async getCustomReport(reportType, filters = {}) {
    try {
      console.log('🔧 [reportService] Obteniendo reporte personalizado:', reportType, filters);
      
      const response = await apiClient.get(`/orders/reports/custom/${reportType}`, {
        params: filters
      });
      
      return response;
    } catch (error) {
      console.error('❌ [reportService] Error obteniendo reporte personalizado:', error);
      throw this.handleError(error);
    }
  },

  // ==================== EXPORTACIÓN DE REPORTES ====================

  /**
   * Exportar reporte a Excel
   */
  async exportReportToExcel(reportType, filters = {}) {
    try {
      console.log('📄 [reportService] Exportando a Excel:', reportType);
      
      const response = await apiClient.get(`/orders/reports/${reportType}/export/excel`, {
        params: filters,
        responseType: 'blob'
      });
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-${reportType}-${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Reporte descargado exitosamente' };
    } catch (error) {
      console.error('❌ [reportService] Error exportando Excel:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Exportar reporte a PDF
   */
  async exportReportToPDF(reportType, filters = {}) {
    try {
      console.log('📑 [reportService] Exportando a PDF:', reportType);
      
      const response = await apiClient.get(`/orders/reports/${reportType}/export/pdf`, {
        params: filters,
        responseType: 'blob'
      });
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-${reportType}-${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Reporte descargado exitosamente' };
    } catch (error) {
      console.error('❌ [reportService] Error exportando PDF:', error);
      throw this.handleError(error);
    }
  },

  // ==================== MÉTODOS AUXILIARES ====================

  /**
   * Obtener opciones de filtrado disponibles
   */
  async getFilterOptions() {
    try {
      console.log('⚙️ [reportService] Obteniendo opciones de filtro');
      
      const response = await apiClient.get('/orders/reports/filter-options');
      
      return response;
    } catch (error) {
      console.error('❌ [reportService] Error obteniendo opciones:', error);
      throw this.handleError(error);
    }
  },

  /**
   * Validar rango de fechas
   */
  validateDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return { valid: false, error: 'Fechas inválidas' };
    }
    
    if (start > end) {
      return { valid: false, error: 'La fecha inicial debe ser menor que la final' };
    }
    
    if (start > now) {
      return { valid: false, error: 'La fecha inicial no puede ser futura' };
    }
    
    // Máximo 1 año de diferencia
    const maxDiff = 365 * 24 * 60 * 60 * 1000; // 1 año en millisegundos
    if (end - start > maxDiff) {
      return { valid: false, error: 'El rango no puede ser mayor a 1 año' };
    }
    
    return { valid: true };
  },

  /**
   * Formatear datos para gráficos
   */
  formatChartData(data, type = 'line') {
    switch (type) {
      case 'line':
        return {
          labels: data.map(item => item.date || item.label),
          datasets: [{
            label: 'Ventas',
            data: data.map(item => item.value || item.amount),
            borderColor: '#032CA6',
            backgroundColor: 'rgba(3, 44, 166, 0.1)',
            tension: 0.4
          }]
        };
      
      case 'pie':
        return {
          labels: data.map(item => item.label || item.name),
          datasets: [{
            data: data.map(item => item.value || item.count),
            backgroundColor: [
              '#032CA6',
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0'
            ]
          }]
        };
      
      case 'bar':
        return {
          labels: data.map(item => item.label || item.name),
          datasets: [{
            label: 'Cantidad',
            data: data.map(item => item.value || item.count),
            backgroundColor: '#032CA6',
            borderColor: '#010326',
            borderWidth: 1
          }]
        };
      
      default:
        return data;
    }
  },

  /**
   * Manejo de errores centralizado
   */
  handleError(error) {
    if (error.response) {
      // Error de respuesta del servidor
      const errorData = {
        status: error.response.status,
        message: error.response.data?.message || 'Error del servidor',
        errors: error.response.data?.errors || null,
        code: error.response.data?.error || 'SERVER_ERROR'
      };
      
      // Logs específicos para diferentes errores
      switch (error.response.status) {
        case 400:
          console.error('❌ [reportService] Parámetros inválidos');
          break;
        case 401:
          console.error('❌ [reportService] Error de autenticación');
          break;
        case 403:
          console.error('❌ [reportService] Sin permisos para reportes');
          break;
        case 404:
          console.error('❌ [reportService] Reporte no encontrado');
          break;
        case 429:
          console.error('❌ [reportService] Demasiadas solicitudes');
          break;
        default:
          console.error('❌ [reportService] Error del servidor');
      }
      
      return errorData;
    } else if (error.request) {
      // Error de conexión
      return {
        status: 0,
        message: 'Error de conexión. Verifica tu internet.',
        code: 'NETWORK_ERROR'
      };
    } else {
      // Error de configuración
      return {
        status: 0,
        message: error.message || 'Error inesperado',
        code: 'CLIENT_ERROR'
      };
    }
  }
};

export default reportService;