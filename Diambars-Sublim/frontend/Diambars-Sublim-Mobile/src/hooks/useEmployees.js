// src/hooks/useEmployees.js - Hook para gestión de empleados en React Native
import { useCallback, useEffect, useState } from 'react';
import employeeService from '../api/employeeService';
import { showError, showSuccess, showValidationError } from '../utils/SweetAlert';

const useEmployees = () => {
  // ==================== ESTADOS ====================
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalEmployees: 0,
    totalPages: 0,
    currentPage: 1,
    perPage: 12,
    hasNext: false,
    hasPrev: false,
    nextPage: null,
    prevPage: null
  });

  // Estados para filtros y búsqueda
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    dateRange: 'all'
  });

  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // ==================== UTILIDADES ====================

  // Manejar errores de manera consistente
  const handleError = useCallback((error, defaultMessage) => {
    const errorMessage = error.message || defaultMessage;
    console.error('❌ [useEmployees-Mobile] Error:', error);
    setError(errorMessage);
    showError('Error', errorMessage);
  }, []);

  // ==================== FUNCIONES PRINCIPALES ====================

  // Obtener todos los empleados
  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('👥 [useEmployees-Mobile] Obteniendo empleados');
      
      const response = await employeeService.getAll();
      
      if (!response || !Array.isArray(response)) {
        throw new Error('Formato de empleados inválido');
      }

      const formattedEmployees = response.map(employeeService.formatEmployee);
      setEmployees(formattedEmployees);
      
      console.log('✅ [useEmployees-Mobile] Empleados obtenidos:', formattedEmployees.length);
    } catch (error) {
      handleError(error, 'Error al cargar empleados');
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // Crear empleado
  const createEmployee = useCallback(async (employeeData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🆕 [useEmployees-Mobile] Creando empleado:', employeeData);

      // Sanitizar datos
      const sanitizedData = employeeService.sanitizeEmployeeData(employeeData);
      console.log('🔍 [useEmployees-Mobile] Datos sanitizados:', sanitizedData);

      // Validar datos
      const validation = employeeService.validateEmployeeData(sanitizedData);
      if (!validation.isValid) {
        showValidationError(validation.errors);
        throw new Error(`Errores de validación:\n• ${validation.errors.join('\n• ')}`);
      }

      // Preparar datos para envío (sin FormData porque el endpoint no maneja archivos)
      const dataToSend = { ...sanitizedData };
      
      // Remover campos que no debe enviar el endpoint de registro
      delete dataToSend.profileImage;
      delete dataToSend.confirmPassword;
      delete dataToSend.status;
      delete dataToSend.active;

      console.log('📤 [useEmployees-Mobile] Datos preparados para envío:', dataToSend);
      const response = await employeeService.create(dataToSend);
      
      console.log('🔍 [useEmployees-Mobile] Respuesta del backend:', response);
      
      // Verificar si hay error en la respuesta
      if (response && response.error) {
        throw new Error(response.message || response.error || 'Error al crear empleado');
      }

      // Mostrar éxito
      showSuccess(
        '¡Empleado creado!',
        'El empleado se ha registrado exitosamente',
        () => {
          fetchEmployees();
        }
      );

      console.log('✅ [useEmployees-Mobile] Empleado creado exitosamente');
      return response;
    } catch (error) {
      handleError(error, 'Error al crear empleado');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchEmployees, handleError]);

  // Actualizar empleado
  const updateEmployee = useCallback(async (id, employeeData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('✏️ [useEmployees-Mobile] Actualizando empleado:', { id, employeeData });

      if (!id) {
        throw new Error('ID de empleado requerido');
      }

      // Sanitizar datos
      const sanitizedData = employeeService.sanitizeEmployeeData(employeeData);
      
      const response = await employeeService.update(id, sanitizedData);
      
      console.log('🔍 [useEmployees-Mobile] Respuesta del backend:', response);
      
      // Verificar si hay error en la respuesta
      if (response && response.error) {
        throw new Error(response.message || response.error || 'Error al actualizar empleado');
      }

      // Mostrar éxito
      showSuccess(
        '¡Empleado actualizado!',
        'Los cambios se han guardado exitosamente',
        () => {
          fetchEmployees();
        }
      );

      console.log('✅ [useEmployees-Mobile] Empleado actualizado exitosamente');
      return response;
    } catch (error) {
      handleError(error, 'Error al actualizar empleado');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchEmployees, handleError]);

  // Eliminar empleado (soft delete)
  const deleteEmployee = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ [useEmployees-Mobile] Eliminando empleado:', id);

      if (!id) {
        throw new Error('ID de empleado requerido');
      }

      const response = await employeeService.delete(id);
      
      console.log('🔍 [useEmployees-Mobile] Respuesta del backend:', response);
      
      // Verificar si hay error en la respuesta
      if (response && response.error) {
        throw new Error(response.message || response.error || 'Error al eliminar empleado');
      }

      // Mostrar éxito
      showSuccess(
        '¡Empleado eliminado!',
        'El empleado ha sido eliminado exitosamente',
        () => {
          fetchEmployees();
        }
      );

      console.log('✅ [useEmployees-Mobile] Empleado eliminado exitosamente');
      return response;
    } catch (error) {
      handleError(error, 'Error al eliminar empleado');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchEmployees, handleError]);

  // Eliminar empleado permanentemente (hard delete)
  const hardDeleteEmployee = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ [useEmployees-Mobile] Eliminando empleado permanentemente:', id);

      if (!id) {
        throw new Error('ID de empleado requerido');
      }

      const response = await employeeService.hardDelete(id);
      
      console.log('🔍 [useEmployees-Mobile] Respuesta del backend:', response);
      
      // Verificar si hay error en la respuesta
      if (response && response.error) {
        throw new Error(response.message || response.error || 'Error al eliminar empleado permanentemente');
      }

      // Mostrar éxito
      showSuccess(
        '¡Empleado eliminado permanentemente!',
        'El empleado ha sido eliminado de forma permanente',
        () => {
          fetchEmployees();
        }
      );

      console.log('✅ [useEmployees-Mobile] Empleado eliminado permanentemente');
      return response;
    } catch (error) {
      handleError(error, 'Error al eliminar empleado permanentemente');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchEmployees, handleError]);

  // Cambiar contraseña
  const changePassword = useCallback(async (id, passwordData) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔐 [useEmployees-Mobile] Cambiando contraseña:', id);

      if (!id) {
        throw new Error('ID de empleado requerido');
      }

      const response = await employeeService.changePassword(id, passwordData);
      
      console.log('🔍 [useEmployees-Mobile] Respuesta del backend:', response);
      
      // Verificar si hay error en la respuesta
      if (response && response.error) {
        throw new Error(response.message || response.error || 'Error al cambiar contraseña');
      }

      // Mostrar éxito
      showSuccess(
        '¡Contraseña cambiada!',
        'La contraseña se ha actualizado exitosamente'
      );

      console.log('✅ [useEmployees-Mobile] Contraseña cambiada exitosamente');
      return response;
    } catch (error) {
      handleError(error, 'Error al cambiar contraseña');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [handleError]);

  // ==================== FUNCIONES DE BÚSQUEDA Y FILTROS ====================

  // Buscar empleados
  const searchEmployees = useCallback((query) => {
    if (!query || query.trim().length < 2) {
      return employees;
    }

    const searchTerm = query.toLowerCase().trim();
    return employees.filter(employee => 
      employee.name?.toLowerCase().includes(searchTerm) ||
      employee.email?.toLowerCase().includes(searchTerm) ||
      employee.phoneNumber?.includes(searchTerm) ||
      employee.dui?.includes(searchTerm) ||
      employee.role?.toLowerCase().includes(searchTerm)
    );
  }, [employees]);

  // Obtener empleados por rol
  const getEmployeesByRole = useCallback((role) => {
    return employees.filter(employee => employee.role === role);
  }, [employees]);

  // Obtener empleados por estado
  const getEmployeesByStatus = useCallback((status) => {
    return employees.filter(employee => employee.status === status);
  }, [employees]);

  // ==================== FUNCIONES DE FILTROS ====================

  // Actualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      role: 'all',
      status: 'all',
      dateRange: 'all'
    });
  }, []);

  // Actualizar ordenamiento
  const updateSorting = useCallback((field, order) => {
    setSortBy(field);
    setSortOrder(order);
  }, []);

  // ==================== FUNCIONES DE ESTADÍSTICAS ====================

  // Obtener estadísticas de empleados
  const getEmployeeStats = useCallback(() => {
    const total = employees.length;
    const active = employees.filter(emp => emp.status === 'active').length;
    const inactive = employees.filter(emp => emp.status === 'inactive').length;
    const managers = employees.filter(emp => emp.role === 'manager').length;
    const employees_count = employees.filter(emp => emp.role === 'employee').length;
    const delivery = employees.filter(emp => emp.role === 'delivery').length;
    const production = employees.filter(emp => emp.role === 'production').length;

    return {
      total,
      active,
      inactive,
      managers,
      employees: employees_count,
      delivery,
      production
    };
  }, [employees]);

  // ==================== FUNCIONES DE UTILIDAD ====================

  // Limpiar error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Obtener empleado por ID
  const getEmployeeById = useCallback((id) => {
    return employees.find(emp => emp.id === id || emp._id === id);
  }, [employees]);

  // ==================== EFECTOS ====================

  // Cargar empleados al montar el componente
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // ==================== ESTADOS CALCULADOS ====================

  const hasEmployees = employees.length > 0;
  const isEmpty = !loading && employees.length === 0;
  const hasError = !!error;
  const canRetry = hasError && !loading;

  // ==================== RETORNO ====================

  return {
    // Estados
    employees,
    loading,
    error,
    pagination,
    filters,
    sortBy,
    sortOrder,

    // Estados calculados
    hasEmployees,
    isEmpty,
    hasError,
    canRetry,

    // Funciones principales CRUD
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    hardDeleteEmployee,
    changePassword,
    getEmployeeById,

    // Funciones de búsqueda y filtros
    searchEmployees,
    getEmployeesByRole,
    getEmployeesByStatus,
    updateFilters,
    clearFilters,
    updateSorting,

    // Estadísticas
    getEmployeeStats,

    // Utilidades
    clearError,
    handleError,
    
    // Refetch
    refetch: fetchEmployees
  };
};

export default useEmployees;
