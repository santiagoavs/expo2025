// src/hooks/usePayments.jsx - Hook personalizado para gestión de pagos
import { useState, useEffect, useCallback, useRef } from 'react';
import paymentService from '../api/PaymentService';
import Swal from 'sweetalert2';

/**
 * Hook principal para gestión de pagos
 */
export const usePayments = (initialFilters = {}) => {
  const [payments, setPayments] = useState([]);
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
   * Cargar pagos con filtros
   */
  const fetchPayments = useCallback(async (customFilters = null) => {
    try {
      setLoading(true);
      setError(null);

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();

      const currentFilters = customFilters || filters;
      console.log('💳 [usePayments] Cargando pagos con filtros:', currentFilters);

      const response = await paymentService.listPayments({
        ...currentFilters,
        page: pagination.page,
        limit: pagination.limit
      });

      if (response.success) {
        const formattedPayments = (response.data.payments || []).map(payment => 
          paymentService.formatPaymentForDisplay(payment)
        );
        
        setPayments(formattedPayments);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.total || 0,
          totalPages: response.data.pagination?.totalPages || 0,
          hasNext: response.data.pagination?.hasNext || false,
          hasPrev: response.data.pagination?.hasPrev || false
        }));
      } else {
        throw new Error(response.message || 'Error cargando pagos');
      }

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('🔄 [usePayments] Request cancelado');
        return;
      }
      
      console.error('❌ [usePayments] Error cargando pagos:', error);
      setError(error.message || 'Error cargando pagos');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  /**
   * Procesar pago
   */
  const processPayment = useCallback(async (orderId, paymentData) => {
    try {
      const validation = paymentService.validatePaymentData(paymentData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const response = await paymentService.processPayment(orderId, paymentData);
      
      if (response.success) {
        await Swal.fire({
          title: 'Pago procesado',
          text: 'El pago se ha procesado exitosamente',
          icon: 'success',
          confirmButtonColor: '#1F64BF'
        });
        
        // Refrescar lista de pagos
        fetchPayments();
        
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [usePayments] Error procesando pago:', error);
      throw error;
    }
  }, [fetchPayments]);

  /**
   * Confirmar pago (efectivo/transferencia)
   */
  const confirmPayment = useCallback(async (paymentId, confirmationData) => {
    try {
      const response = await paymentService.confirmPayment(paymentId, confirmationData);
      
      if (response.success) {
        await Swal.fire({
          title: 'Pago confirmado',
          text: 'El pago se ha confirmado exitosamente',
          icon: 'success',
          confirmButtonColor: '#1F64BF'
        });
        
        // Refrescar lista
        fetchPayments();
        
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [usePayments] Error confirmando pago:', error);
      throw error;
    }
  }, [fetchPayments]);

  /**
   * Cancelar pago
   */
  const cancelPayment = useCallback(async (paymentId, reason) => {
    try {
      const { isConfirmed } = await Swal.fire({
        title: '¿Cancelar pago?',
        text: '¿Estás seguro de cancelar este pago?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No cancelar'
      });

      if (!isConfirmed) return null;

      const response = await paymentService.cancelPayment(paymentId, reason);
      
      if (response.success) {
        await Swal.fire({
          title: 'Pago cancelado',
          text: 'El pago se ha cancelado exitosamente',
          icon: 'success',
          confirmButtonColor: '#1F64BF'
        });
        
        fetchPayments();
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [usePayments] Error cancelando pago:', error);
      throw error;
    }
  }, [fetchPayments]);

  /**
   * Subir comprobante de transferencia
   */
  const submitTransferProof = useCallback(async (paymentId, file, transferData = {}) => {
    try {
      const formData = new FormData();
      formData.append('proof', file);
      
      if (transferData.transferDate) {
        formData.append('transferDate', transferData.transferDate);
      }
      if (transferData.bankReference) {
        formData.append('bankReference', transferData.bankReference);
      }
      if (transferData.notes) {
        formData.append('notes', transferData.notes);
      }

      const response = await paymentService.submitTransferProof(paymentId, formData);
      
      if (response.success) {
        await Swal.fire({
          title: 'Comprobante subido',
          text: 'El comprobante se ha subido exitosamente',
          icon: 'success',
          confirmButtonColor: '#1F64BF'
        });
        
        fetchPayments();
        return response.data;
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [usePayments] Error subiendo comprobante:', error);
      throw error;
    }
  }, [fetchPayments]);

  /**
   * Actualizar filtros
   */
  const updateFilters = useCallback((newFilters) => {
    console.log('🔍 [usePayments] Actualizando filtros:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Cambiar página
   */
  const changePage = useCallback((newPage) => {
    console.log('📄 [usePayments] Cambiando página:', newPage);
    setPagination(prev => ({ ...prev, page: newPage }));
  }, []);

  /**
   * Limpiar filtros
   */
  const clearFilters = useCallback(() => {
    console.log('🔄 [usePayments] Limpiando filtros');
    setFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
  }, []);

  /**
   * Refrescar pagos
   */
  const refreshPayments = useCallback(() => {
    console.log('🔄 [usePayments] Refrescando pagos');
    fetchPayments();
  }, [fetchPayments]);

  // Cargar pagos cuando cambien filtros o paginación
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

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
    payments,
    loading,
    error,
    pagination,
    filters,
    
    // Acciones
    fetchPayments,
    processPayment,
    confirmPayment,
    cancelPayment,
    submitTransferProof,
    updateFilters,
    changePage,
    clearFilters,
    refreshPayments,
    
    // Utilidades
    hasPayments: payments.length > 0,
    isEmpty: !loading && payments.length === 0
  };
};

/**
 * Hook para obtener estado de pagos de una orden específica
 */
export const useOrderPaymentStatus = (orderId) => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPaymentStatus = useCallback(async () => {
    if (!orderId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await paymentService.getOrderPaymentStatus(orderId);
      
      if (response.success) {
        setPaymentStatus(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useOrderPaymentStatus] Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    fetchPaymentStatus();
  }, [fetchPaymentStatus]);

  return {
    paymentStatus,
    loading,
    error,
    refetch: fetchPaymentStatus
  };
};

/**
 * Hook para transferencias pendientes
 */
export const usePendingTransfers = () => {
  const [transfers, setTransfers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPendingTransfers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await paymentService.getPendingTransfers();
      
      if (response.success) {
        const formattedTransfers = (response.data || []).map(transfer => 
          paymentService.formatPaymentForDisplay(transfer)
        );
        setTransfers(formattedTransfers);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [usePendingTransfers] Error:', error);
      setError(error.message);
      setTransfers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Aprobar transferencia
   */
  const approveTransfer = useCallback(async (transferId, confirmationData) => {
    try {
      await paymentService.confirmPayment(transferId, {
        ...confirmationData,
        isApproved: true
      });
      
      // Refrescar lista
      await fetchPendingTransfers();
      
      return true;
    } catch (error) {
      console.error('❌ [usePendingTransfers] Error aprobando:', error);
      throw error;
    }
  }, [fetchPendingTransfers]);

  /**
   * Rechazar transferencia
   */
  const rejectTransfer = useCallback(async (transferId, reason) => {
    try {
      const { isConfirmed } = await Swal.fire({
        title: '¿Rechazar transferencia?',
        text: 'Esta acción notificará al cliente del rechazo',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sí, rechazar',
        cancelButtonText: 'Cancelar'
      });

      if (!isConfirmed) return null;

      await paymentService.rejectTransfer(transferId, reason);
      
      await fetchPendingTransfers();
      
      await Swal.fire({
        title: 'Transferencia rechazada',
        text: 'El cliente ha sido notificado del rechazo',
        icon: 'success',
        confirmButtonColor: '#1F64BF'
      });
      
      return true;
    } catch (error) {
      console.error('❌ [usePendingTransfers] Error rechazando:', error);
      throw error;
    }
  }, [fetchPendingTransfers]);

  useEffect(() => {
    fetchPendingTransfers();
  }, [fetchPendingTransfers]);

  return {
    transfers,
    loading,
    error,
    refetch: fetchPendingTransfers,
    approveTransfer,
    rejectTransfer,
    hasTransfers: transfers.length > 0
  };
};

/**
 * Hook para historial de pagos de un cliente
 */
export const useCustomerPaymentHistory = (userId) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async (filters = {}) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await paymentService.getCustomerPaymentHistory(userId, filters);
      
      if (response.success) {
        const formattedHistory = (response.data || []).map(payment => 
          paymentService.formatPaymentForDisplay(payment)
        );
        setHistory(formattedHistory);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('❌ [useCustomerPaymentHistory] Error:', error);
      setError(error.message);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    history,
    loading,
    error,
    refetch: fetchHistory,
    hasHistory: history.length > 0
  };
};

export default usePayments;