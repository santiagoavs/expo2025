import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import productService from '../api/productService';

// Keys para React Query
const queryKeys = {
  all: ['products'],
  detail: (id) => ['products', id],
  konvaConfig: (id) => ['products', id, 'konva-config'],
};

/**
 * Hook para gestionar productos con manejo robusto de errores
 */
export const useProducts = (filters = {}) => {
  const queryClient = useQueryClient();
  
  // Obtener lista de productos con filtros
  const {
    data = { products: [], pagination: {} },
    isLoading,
    error,
    refetch,
    isError
  } = useQuery({
    queryKey: [...queryKeys.all, filters],
    queryFn: async () => {
      try {
        console.log('🔄 Fetching products with filters:', filters);
        const response = await productService.getAllProducts(filters);
        console.log('✅ Products fetched successfully:', response);
        return response;
      } catch (error) {
        console.error('❌ Error fetching products:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    cacheTime: 10 * 60 * 1000, // 10 minutos
    retry: (failureCount, error) => {
      // Reintentar solo errores de red, no errores 4xx
      if (error.statusCode >= 400 && error.statusCode < 500) {
        return false;
      }
      return failureCount < 2;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  
  // Crear un producto
  const createMutation = useMutation({
    mutationFn: async (productData) => {
      const response = await productService.createProduct(productData);
      return response;
    },
    onSuccess: (data) => {
      toast.success('Producto creado exitosamente');
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      return data;
    },
    onError: (error) => {
      console.error('❌ Error creating product:', error);
      toast.error(error.message || 'Error al crear el producto');
    }
  });
  
  // Actualizar un producto
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await productService.updateProduct(id, data);
      return response;
    },
    onSuccess: (data, variables) => {
      toast.success('Producto actualizado exitosamente');
      queryClient.invalidateQueries({ queryKey: queryKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      return data;
    },
    onError: (error) => {
      console.error('❌ Error updating product:', error);
      toast.error(error.message || 'Error al actualizar el producto');
    }
  });
  
  // Eliminar un producto
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const response = await productService.deleteProduct(id);
      return response;
    },
    onSuccess: (data) => {
      toast.success('Producto eliminado exitosamente');
      queryClient.invalidateQueries({ queryKey: queryKeys.all });
      return data;
    },
    onError: (error) => {
      console.error('❌ Error deleting product:', error);
      toast.error(error.message || 'Error al eliminar el producto');
    }
  });
  
  return {
    // Datos
    products: data.products || [],
    pagination: data.pagination || {},
    
    // Estados
    isLoading,
    isError,
    error,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Acciones
    refetch,
    createProduct: createMutation.mutate,
    updateProduct: updateMutation.mutate,
    deleteProduct: deleteMutation.mutate,
    
    // Resultado de mutaciones
    createResult: createMutation.data,
    updateResult: updateMutation.data,
    deleteResult: deleteMutation.data,
    
    // Errores de mutaciones
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error
  };
};

// Hook para obtener un producto específico
export const useProduct = (id) => {
  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: async () => {
      const response = await productService.getProductById(id);
      return response;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para obtener configuración Konva
export const useKonvaConfig = (id) => {
  return useQuery({
    queryKey: queryKeys.konvaConfig(id),
    queryFn: async () => {
      const response = await productService.getKonvaConfig(id);
      return response;
    },
    enabled: !!id,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
};