// src/hooks/useAddresses.js
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import addressService from '../api/AddressService';

const handleError = (error, defaultMessage) => {
  const errorData = error.response?.data || {};
  const errorMessage = errorData.message || errorData.error || error.message || defaultMessage;

  console.error('❌ [useAddresses] Error:', { error, response: error.response });
  toast.error(errorMessage);
  throw new Error(errorMessage);
};

const useAddresses = () => {
  // ==================== ESTADOS ====================
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    byDepartment: {},
    byUser: {},
    recentlyCreated: 0
  });

  // Estados de filtros y paginación
  const [filters, setFilters] = useState({
    userId: '',
    department: '',
    municipality: '',
    search: '',
    isActive: null,
    page: 1,
    limit: 20,
    sort: 'createdAt_desc'
  });

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
    itemsPerPage: 20
  });

  // Estados auxiliares
  const [selectedAddresses, setSelectedAddresses] = useState([]);
  const [deliveryFees, setDeliveryFees] = useState({});
  const [locationData, setLocationData] = useState({
    departments: [],
    municipalities: {}
  });

  // ==================== FUNCIONES DE DATOS ====================

  /**
   * Formatear dirección para uso en el frontend
   * @param {Object} address - Dirección del backend
   * @returns {Object} Dirección formateada
   */
  const formatAddress = (address) => {
    return {
      id: address._id || address.id,
      user: address.user || {},
      userId: address.user?._id || address.userId,
      userName: address.user?.name || address.recipient || 'Usuario desconocido',
      userEmail: address.user?.email || '',
      label: address.label || 'Dirección',
      recipient: address.recipient,
      phoneNumber: address.phoneNumber,
      department: address.department,
      municipality: address.municipality,
      address: address.address,
      additionalDetails: address.additionalDetails || '',
      coordinates: address.location?.coordinates || [],
      latitude: address.location?.coordinates?.[1] || null,
      longitude: address.location?.coordinates?.[0] || null,
      isDefault: address.isDefault || false,
      isActive: address.isActive !== false,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
      fullAddress: `${address.address}, ${address.municipality}, ${address.department}`,
      estimatedDeliveryFee: address.estimatedDeliveryFee || 0,
      formattedCoordinates: address.location?.coordinates 
        ? `${address.location.coordinates[1].toFixed(6)}, ${address.location.coordinates[0].toFixed(6)}`
        : 'Sin coordenadas',
      statusText: address.isActive !== false ? 'Activa' : 'Inactiva',
      formattedPhone: formatSalvadoranPhone(address.phoneNumber),
      formattedDate: formatDate(address.createdAt)
    };
  };

  /**
   * Formatear teléfono salvadoreño
   * @param {string} phone - Número de teléfono
   * @returns {string} Teléfono formateado
   */
  const formatSalvadoranPhone = (phone) => {
    if (!phone) return '';
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length === 8) {
      return `${cleanPhone.slice(0, 4)}-${cleanPhone.slice(4)}`;
    }
    return phone;
  };

  /**
   * Formatear fecha
   * @param {string} dateString - Fecha en string
   * @returns {string} Fecha formateada
   */
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  // ==================== OPERACIONES CRUD ====================

  /**
   * Obtener todas las direcciones con filtros
   * @param {Object} customFilters - Filtros personalizados
   */
  const fetchAddresses = useCallback(async (customFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const mergedFilters = { ...filters, ...customFilters };
      console.log('📍 [useAddresses] Fetching addresses with filters:', mergedFilters);
      
      const response = await addressService.getAll(mergedFilters);
      
      if (response.success && response.data) {
        const formattedAddresses = (response.data.addresses || []).map(formatAddress);
        setAddresses(formattedAddresses);
        
        // Actualizar paginación si existe
        if (response.data.pagination) {
          setPagination({
            currentPage: response.data.pagination.currentPage || 1,
            totalPages: response.data.pagination.totalPages || 1,
            totalItems: response.data.pagination.totalItems || 0,
            hasNext: response.data.pagination.hasNext || false,
            hasPrev: response.data.pagination.hasPrev || false,
            itemsPerPage: response.data.pagination.itemsPerPage || 20
          });
        }
        
        console.log('✅ [useAddresses] Addresses loaded:', formattedAddresses.length);
      } else {
        setAddresses([]);
        console.warn('⚠️ [useAddresses] No addresses data in response');
      }
    } catch (err) {
      console.error('❌ [useAddresses] Error fetching addresses:', err);
      setError(err.message || 'Error al cargar direcciones');
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  /**
   * Obtener direcciones de un usuario específico
   * @param {string} userId - ID del usuario
   */
  const fetchUserAddresses = useCallback(async (userId) => {
    if (!userId) return [];
    
    try {
      const response = await addressService.getUserAddresses(userId);
      
      if (response.success && response.data) {
        return (response.data.addresses || []).map(formatAddress);
      }
      return [];
    } catch (err) {
      console.error('❌ [useAddresses] Error fetching user addresses:', err);
      toast.error('Error al cargar direcciones del usuario');
      return [];
    }
  }, []);

  /**
   * Crear nueva dirección
   * @param {Object} addressData - Datos de la dirección
   */
  const createAddress = useCallback(async (addressData) => {
    try {
      setLoading(true);
      console.log('📍 [useAddresses] Creating address:', addressData);
      
      const response = await addressService.create(addressData);
      
      if (response.success) {
        toast.success('Dirección creada exitosamente');
        await fetchAddresses(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message || 'Error al crear dirección');
      }
    } catch (error) {
      handleError(error, 'Error al crear dirección');
    } finally {
      setLoading(false);
    }
  }, [fetchAddresses]);

  /**
   * Actualizar dirección existente
   * @param {string} addressId - ID de la dirección
   * @param {Object} updateData - Datos a actualizar
   */
  const updateAddress = useCallback(async (addressId, updateData) => {
    try {
      console.log('📍 [useAddresses] Updating address:', addressId, updateData);
      
      const response = await addressService.update(addressId, updateData);
      
      if (response.success) {
        toast.success('Dirección actualizada exitosamente');
        await fetchAddresses(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message || 'Error al actualizar dirección');
      }
    } catch (error) {
      handleError(error, 'Error al actualizar dirección');
    }
  }, [fetchAddresses]);

  /**
   * Eliminar dirección
   * @param {string} addressId - ID de la dirección
   */
  const deleteAddress = useCallback(async (addressId) => {
    try {
      console.log('📍 [useAddresses] Deleting address:', addressId);
      
      const response = await addressService.delete(addressId);
      
      if (response.success) {
        toast.success('Dirección eliminada exitosamente');
        await fetchAddresses(); // Recargar lista
        return response;
      } else {
        throw new Error(response.message || 'Error al eliminar dirección');
      }
    } catch (error) {
      handleError(error, 'Error al eliminar dirección');
    }
  }, [fetchAddresses]);

  /**
   * Establecer dirección como predeterminada
   * @param {string} addressId - ID de la dirección
   */
  const setDefaultAddress = useCallback(async (addressId) => {
    try {
      console.log('📍 [useAddresses] Setting default address:', addressId);
      
      const response = await addressService.setDefault(addressId);
      
      if (response.success) {
        toast.success('Dirección predeterminada actualizada');
        await fetchAddresses(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message || 'Error al establecer dirección predeterminada');
      }
    } catch (error) {
      handleError(error, 'Error al establecer dirección predeterminada');
    }
  }, [fetchAddresses]);

  /**
   * Quitar dirección como predeterminada
   * @param {string} addressId - ID de la dirección
   */
  const unsetDefaultAddress = useCallback(async (addressId) => {
    try {
      console.log('📍 [useAddresses] Unsetting default address:', addressId);
      
      const response = await addressService.unsetDefault(addressId);
      
      if (response.success) {
        toast.success('Dirección ya no es predeterminada');
        await fetchAddresses(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message || 'Error al quitar dirección predeterminada');
      }
    } catch (error) {
      handleError(error, 'Error al quitar dirección predeterminada');
    }
  }, [fetchAddresses]);

  /**
   * Activar dirección
   * @param {string} addressId - ID de la dirección
   */
  const activateAddress = useCallback(async (addressId) => {
    try {
      console.log('📍 [useAddresses] Activating address:', addressId);
      
      const response = await addressService.update(addressId, { isActive: true });
      
      if (response.success) {
        toast.success('Dirección activada exitosamente');
        await fetchAddresses(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message || 'Error al activar dirección');
      }
    } catch (error) {
      handleError(error, 'Error al activar dirección');
    }
  }, [fetchAddresses]);

  /**
   * Desactivar dirección
   * @param {string} addressId - ID de la dirección
   */
  const deactivateAddress = useCallback(async (addressId) => {
    try {
      console.log('📍 [useAddresses] Deactivating address:', addressId);
      
      const response = await addressService.update(addressId, { isActive: false });
      
      if (response.success) {
        toast.success('Dirección desactivada exitosamente');
        await fetchAddresses(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message || 'Error al desactivar dirección');
      }
    } catch (error) {
      handleError(error, 'Error al desactivar dirección');
    }
  }, [fetchAddresses]);

  /**
   * Eliminar dirección permanentemente (hard delete)
   * @param {string} addressId - ID de la dirección
   */
  const hardDeleteAddress = useCallback(async (addressId) => {
    try {
      console.log('📍 [useAddresses] Hard deleting address:', addressId);
      
      const response = await addressService.hardDelete(addressId);
      
      if (response.success) {
        toast.success('Dirección eliminada permanentemente');
        await fetchAddresses(); // Recargar lista
        return response.data;
      } else {
        throw new Error(response.message || 'Error al eliminar dirección permanentemente');
      }
    } catch (error) {
      handleError(error, 'Error al eliminar dirección permanentemente');
    }
  }, [fetchAddresses]);

  // ==================== VALIDACIÓN Y DATOS AUXILIARES ====================

  /**
   * Validar dirección antes de guardar
   * @param {Object} addressData - Datos de dirección
   */
  const validateAddress = useCallback(async (addressData) => {
    try {
      const response = await addressService.validate(addressData);
      return response;
    } catch (error) {
      console.error('❌ [useAddresses] Validation error:', error);
      return { isValid: false, error: error.message };
    }
  }, []);

  /**
   * Obtener tarifas de envío
   */
  const fetchDeliveryFees = useCallback(async () => {
    try {
      const response = await addressService.getDeliveryFees();
      if (response.success && response.data) {
        setDeliveryFees(response.data);
      }
      return response.data || {};
    } catch (error) {
      console.error('❌ [useAddresses] Error fetching delivery fees:', error);
      return {};
    }
  }, []);

  /**
   * Obtener datos de ubicaciones (departamentos y municipios)
   */
  const fetchLocationData = useCallback(async () => {
    try {
      const response = await addressService.getLocationData();
      if (response.success && response.data) {
        setLocationData(response.data);
      }
      return response.data || { departments: [], municipalities: {} };
    } catch (error) {
      console.error('❌ [useAddresses] Error fetching location data:', error);
      return { departments: [], municipalities: {} };
    }
  }, []);

  // ==================== ESTADÍSTICAS Y ANÁLISIS ====================

  /**
   * Obtener estadísticas de direcciones
   */
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await addressService.getStatistics();
      if (response.success && response.data) {
        setStatistics(response.data);
      }
      return response.data || {};
    } catch (error) {
      console.error('❌ [useAddresses] Error fetching statistics:', error);
      return {};
    }
  }, []);

  /**
   * Obtener distribución por departamento
   */
  const fetchDistributionByDepartment = useCallback(async () => {
    try {
      const response = await addressService.getDistributionByDepartment();
      return response.data || {};
    } catch (error) {
      console.error('❌ [useAddresses] Error fetching distribution:', error);
      return {};
    }
  }, []);

  /**
   * Obtener usuarios con más direcciones
   * @param {number} limit - Límite de usuarios
   */
  const fetchTopUsersByAddresses = useCallback(async (limit = 10) => {
    try {
      const response = await addressService.getTopUsersByAddresses(limit);
      return response.data || [];
    } catch (error) {
      console.error('❌ [useAddresses] Error fetching top users:', error);
      return [];
    }
  }, []);

  // ==================== OPERACIONES EN LOTE ====================

  /**
   * Actualizar múltiples direcciones
   * @param {Array} addressIds - IDs de direcciones
   * @param {Object} updateData - Datos a actualizar
   */
  const batchUpdateAddresses = useCallback(async (addressIds, updateData) => {
    try {
      setLoading(true);
      console.log('📍 [useAddresses] Batch updating addresses:', addressIds.length);
      
      const response = await addressService.batchUpdate(addressIds, updateData);
      
      if (response.success) {
        toast.success(`${addressIds.length} direcciones actualizadas exitosamente`);
        await fetchAddresses(); // Recargar lista
        setSelectedAddresses([]); // Limpiar selección
        return response.data;
      } else {
        throw new Error(response.message || 'Error en actualización masiva');
      }
    } catch (error) {
      handleError(error, 'Error en actualización masiva');
    } finally {
      setLoading(false);
    }
  }, [fetchAddresses]);

  /**
   * Eliminar múltiples direcciones
   * @param {Array} addressIds - IDs de direcciones a eliminar
   */
  const batchDeleteAddresses = useCallback(async (addressIds) => {
    try {
      setLoading(true);
      console.log('📍 [useAddresses] Batch deleting addresses:', addressIds.length);
      
      const response = await addressService.batchDelete(addressIds);
      
      if (response.success) {
        toast.success(`${addressIds.length} direcciones eliminadas exitosamente`);
        await fetchAddresses(); // Recargar lista
        setSelectedAddresses([]); // Limpiar selección
        return response.data;
      } else {
        throw new Error(response.message || 'Error en eliminación masiva');
      }
    } catch (error) {
      handleError(error, 'Error en eliminación masiva');
    } finally {
      setLoading(false);
    }
  }, [fetchAddresses]);

  // ==================== GESTIÓN DE FILTROS ====================

  /**
   * Actualizar filtros
   * @param {Object} newFilters - Nuevos filtros
   */
  const updateFilters = useCallback((newFilters) => {
    console.log('📍 [useAddresses] Updating filters:', newFilters);
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })); // Reset página al cambiar filtros
  }, []);

  /**
   * Limpiar todos los filtros
   */
  const clearFilters = useCallback(() => {
    console.log('📍 [useAddresses] Clearing filters');
    setFilters({
      userId: '',
      department: '',
      municipality: '',
      search: '',
      isActive: null,
      page: 1,
      limit: 20,
      sort: 'createdAt_desc'
    });
  }, []);

  /**
   * Buscar direcciones
   * @param {string} searchTerm - Término de búsqueda
   */
  const searchAddresses = useCallback(async (searchTerm) => {
    updateFilters({ search: searchTerm, page: 1 });
  }, [updateFilters]);

  // ==================== GESTIÓN DE SELECCIÓN ====================

  /**
   * Seleccionar/deseleccionar dirección
   * @param {string} addressId - ID de la dirección
   */
  const toggleAddressSelection = useCallback((addressId) => {
    setSelectedAddresses(prev => {
      if (prev.includes(addressId)) {
        return prev.filter(id => id !== addressId);
      } else {
        return [...prev, addressId];
      }
    });
  }, []);

  /**
   * Seleccionar todas las direcciones visibles
   */
  const selectAllAddresses = useCallback(() => {
    const allIds = addresses.map(addr => addr.id);
    setSelectedAddresses(allIds);
  }, [addresses]);

  /**
   * Limpiar selección
   */
  const clearSelection = useCallback(() => {
    setSelectedAddresses([]);
  }, []);

  // ==================== UTILIDADES ====================

  /**
   * Obtener dirección por ID
   * @param {string} addressId - ID de la dirección
   */
  const getAddressById = useCallback((addressId) => {
    return addresses.find(addr => addr.id === addressId) || null;
  }, [addresses]);

  /**
   * Verificar si hay direcciones
   */
  const hasAddresses = addresses.length > 0;

  /**
   * Verificar si está vacío (sin direcciones y sin filtros activos)
   */
  const isEmpty = !hasAddresses && !filters.search && !filters.userId && !filters.department;

  /**
   * Obtener estadísticas calculadas de las direcciones actuales
   */
  const getCalculatedStats = useCallback(() => {
    const total = addresses.length;
    const active = addresses.filter(addr => addr.isActive).length;
    const inactive = total - active;
    
    // Distribución por departamento
    const byDepartment = addresses.reduce((acc, addr) => {
      acc[addr.department] = (acc[addr.department] || 0) + 1;
      return acc;
    }, {});

    // Distribución por usuario
    const byUser = addresses.reduce((acc, addr) => {
      const userId = addr.userId;
      if (userId) {
        acc[userId] = (acc[userId] || 0) + 1;
      }
      return acc;
    }, {});

    return {
      total,
      active,
      inactive,
      byDepartment,
      byUser,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0
    };
  }, [addresses]);

  /**
   * Exportar direcciones con filtros actuales
   * @param {string} format - Formato de exportación ('csv', 'excel')
   */
  const exportAddresses = useCallback(async (format = 'csv') => {
    try {
      console.log('📍 [useAddresses] Exporting addresses in format:', format);
      
      const response = await addressService.export({ ...filters, format });
      
      // Crear y descargar archivo
      const blob = new Blob([response], { 
        type: format === 'csv' ? 'text/csv' : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `direcciones_${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Direcciones exportadas exitosamente');
      
    } catch (error) {
      handleError(error, 'Error al exportar direcciones');
    }
  }, [filters]);

  // ==================== EFECTOS ====================

  /**
   * Efecto para cargar direcciones cuando cambian los filtros
   */
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  /**
   * Efecto para cargar datos auxiliares al montar el componente
   */
  useEffect(() => {
    fetchDeliveryFees();
    fetchLocationData();
    fetchStatistics();
  }, [fetchDeliveryFees, fetchLocationData, fetchStatistics]);

  // ==================== RETURN ====================
  return {
    // Datos principales
    addresses,
    loading,
    error,
    statistics,
    pagination,
    filters,
    deliveryFees,
    locationData,
    selectedAddresses,

    // Operaciones CRUD
    fetchAddresses,
    fetchUserAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    hardDeleteAddress,
    setDefaultAddress,
    unsetDefaultAddress,
    activateAddress,
    deactivateAddress,

    // Validación y datos auxiliares
    validateAddress,
    fetchDeliveryFees,
    fetchLocationData,
    fetchStatistics,
    fetchDistributionByDepartment,
    fetchTopUsersByAddresses,

    // Operaciones en lote
    batchUpdateAddresses,
    batchDeleteAddresses,

    // Gestión de filtros
    updateFilters,
    clearFilters,
    searchAddresses,

    // Gestión de selección
    toggleAddressSelection,
    selectAllAddresses,
    clearSelection,

    // Utilidades
    getAddressById,
    hasAddresses,
    isEmpty,
    getCalculatedStats,
    exportAddresses,

    // Funciones de formato
    formatAddress,
    formatSalvadoranPhone,
    formatDate
  };
};

export default useAddresses;