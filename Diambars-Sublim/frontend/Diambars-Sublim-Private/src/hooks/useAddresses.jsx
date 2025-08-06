import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import addressService from '../api/services/addressService';

// Keys para React Query
const queryKeys = {
  all: ['addresses'],
};

const errorHandler = (error, fallbackMessage) => {
  const message = error.message || fallbackMessage;
  toast.error(message);
  return error;
};

/**
 * Hook para gestionar direcciones del usuario
 */
export const useAddresses = () => {
  const queryClient = useQueryClient();
  
  // Obtener todas las direcciones del usuario
  const {
    data = { addresses: [] },
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: queryKeys.all,
    queryFn: () => addressService.getUserAddresses(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
  
  // Crear una dirección
  const createMutation = useMutation({
    mutationFn: (addressData) => addressService.createAddress(addressData),
    onSuccess: (data) => {
      toast.success(data.message || 'Dirección creada exitosamente');
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      return data;
    },
    onError: (error) => errorHandler(error, 'Error al crear la dirección')
  });
  
  // Actualizar una dirección
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => addressService.updateAddress(id, data),
    onSuccess: (data) => {
      toast.success(data.message || 'Dirección actualizada exitosamente');
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      return data;
    },
    onError: (error) => errorHandler(error, 'Error al actualizar la dirección')
  });
  
  // Eliminar una dirección
  const deleteMutation = useMutation({
    mutationFn: (id) => addressService.deleteAddress(id),
    onSuccess: (data) => {
      toast.success(data.message || 'Dirección eliminada exitosamente');
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      return data;
    },
    onError: (error) => errorHandler(error, 'Error al eliminar la dirección')
  });
  
  // Establecer dirección como predeterminada
  const setDefaultMutation = useMutation({
    mutationFn: (id) => addressService.setDefaultAddress(id),
    onSuccess: (data) => {
      toast.success(data.message || 'Dirección establecida como predeterminada');
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      return data;
    },
    onError: (error) => errorHandler(error, 'Error al establecer la dirección predeterminada')
  });
  
  return {
    // Datos
    addresses: data.addresses || [],
    defaultAddress: data.addresses?.find(address => address.isDefault) || null,
    
    // Estados
    isLoading,
    error,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isSettingDefault: setDefaultMutation.isPending,
    
    // Acciones
    refetch,
    createAddress: createMutation.mutate,
    updateAddress: updateMutation.mutate,
    deleteAddress: deleteMutation.mutate,
    setDefaultAddress: setDefaultMutation.mutate,
    
    // Errores
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
    setDefaultError: setDefaultMutation.error
  };
};