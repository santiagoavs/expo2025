import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import orderService from '../api/services/orderService';

// Keys para React Query
const queryKeys = {
  all: ['orders'],
  detail: (id) => ['orders', id],
};

const errorHandler = (error, fallbackMessage) => {
  const message = error.message || fallbackMessage;
  toast.error(message);
  return error;
};

/**
 * Hook para gestionar pedidos
 */
export const useOrders = (filters = {}) => {
  const queryClient = useQueryClient();
  
  // Obtener todos los pedidos
  const {
    data = { orders: [], pagination: {} },
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [...queryKeys.all, filters],
    queryFn: () => orderService.getAllOrders(filters),
    staleTime: 2 * 60 * 1000, // 2 minutos (pedidos cambian más frecuentemente)
  });
  
  // Obtener un pedido específico
  const getOrder = (id) => {
    return useQuery({
      queryKey: queryKeys.detail(id),
      queryFn: () => orderService.getOrderById(id),
      enabled: !!id,
    });
  };
  
  // Crear un pedido
  const createMutation = useMutation({
    mutationFn: (orderData) => orderService.createOrder(orderData),
    onSuccess: (data) => {
      toast.success(data.message || 'Pedido creado exitosamente');
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      return data;
    },
    onError: (error) => errorHandler(error, 'Error al crear el pedido')
  });
  
  // Actualizar estado de un pedido (admin)
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, data }) => orderService.updateOrderStatus(id, data),
    onSuccess: (data, variables) => {
      toast.success(data.message || `Estado actualizado a "${variables.data.status}"`);
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      return data;
    },
    onError: (error) => errorHandler(error, 'Error al actualizar el estado del pedido')
  });
  
  // Confirmar pago (admin)
  const confirmPaymentMutation = useMutation({
    mutationFn: ({ id, data }) => orderService.confirmPayment(id, data),
    onSuccess: (data, variables) => {
      toast.success(data.message || 'Pago confirmado exitosamente');
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      return data;
    },
    onError: (error) => errorHandler(error, 'Error al confirmar el pago')
  });
  
  return {
    // Datos
    orders: data.orders || [],
    pagination: data.pagination || {},
    
    // Estados
    isLoading,
    error,
    isCreating: createMutation.isPending,
    isUpdatingStatus: updateStatusMutation.isPending,
    isConfirmingPayment: confirmPaymentMutation.isPending,
    
    // Acciones
    refetch,
    getOrder,
    createOrder: createMutation.mutate,
    updateOrderStatus: updateStatusMutation.mutate,
    confirmPayment: confirmPaymentMutation.mutate,
    
    // Resultados de las mutaciones
    createResult: createMutation.data,
    statusUpdateResult: updateStatusMutation.data,
    paymentConfirmResult: confirmPaymentMutation.data,
    
    // Errores de las mutaciones
    createError: createMutation.error,
    statusUpdateError: updateStatusMutation.error,
    paymentConfirmError: confirmPaymentMutation.error
  };
};