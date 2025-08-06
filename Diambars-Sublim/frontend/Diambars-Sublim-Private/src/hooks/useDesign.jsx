import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import designService from '../api/services/designService';

// Keys para React Query
const queryKeys = {
  all: ['designs'],
  detail: (id) => ['designs', id],
};

const errorHandler = (error, fallbackMessage) => {
  const message = error.message || fallbackMessage;
  toast.error(message);
  return error;
};

/**
 * Hook para gestionar diseños personalizados
 */
export const useDesigns = (filters = {}) => {
  const queryClient = useQueryClient();
  
  // Obtener todos los diseños
  const {
    data = { designs: [], pagination: {} },
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [...queryKeys.all, filters],
    queryFn: () => designService.getAllDesigns(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
  
  // Obtener un diseño específico
  const getDesign = (id) => {
    return useQuery({
      queryKey: queryKeys.detail(id),
      queryFn: () => designService.getDesignById(id),
      enabled: !!id,
    });
  };
  
  // Crear un diseño
  const createMutation = useMutation({
    mutationFn: (designData) => designService.createDesign(designData),
    onSuccess: (data) => {
      toast.success(data.message || 'Diseño creado y enviado para cotización');
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      return data;
    },
    onError: (error) => errorHandler(error, 'Error al crear el diseño')
  });
  
  // Actualizar un diseño
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => designService.updateDesign(id, data),
    onSuccess: (_, variables) => {
      toast.success('Diseño actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
    },
    onError: (error) => errorHandler(error, 'Error al actualizar el diseño')
  });
  
  // Enviar cotización (admin)
  const quoteMutation = useMutation({
    mutationFn: ({ id, data }) => designService.submitQuote(id, data),
    onSuccess: (data) => {
      toast.success(data.message || 'Cotización enviada al cliente');
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      return data;
    },
    onError: (error) => errorHandler(error, 'Error al enviar la cotización')
  });
  
  // Responder a cotización (cliente)
  const respondMutation = useMutation({
    mutationFn: ({ id, data }) => designService.respondToQuote(id, data),
    onSuccess: (data) => {
      const message = data.data?.accept 
        ? 'Cotización aceptada. Tu pedido ha sido creado.'
        : 'Cotización rechazada. Gracias por tu feedback.';
      
      toast.success(data.message || message);
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      return data;
    },
    onError: (error) => errorHandler(error, 'Error al responder a la cotización')
  });
  
  return {
    // Datos
    designs: data.designs || [],
    pagination: data.pagination || {},
    
    // Estados
    isLoading,
    error,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isQuoting: quoteMutation.isPending,
    isResponding: respondMutation.isPending,
    
    // Acciones
    refetch,
    getDesign,
    createDesign: createMutation.mutate,
    updateDesign: updateMutation.mutate,
    submitQuote: quoteMutation.mutate, // Admin
    respondToQuote: respondMutation.mutate, // Cliente
    
    // Resultados de las mutaciones
    createResult: createMutation.data,
    quoteResult: quoteMutation.data,
    respondResult: respondMutation.data,
    
    // Errores de las mutaciones
    createError: createMutation.error,
    updateError: updateMutation.error,
    quoteError: quoteMutation.error,
    respondError: respondMutation.error
  };
};