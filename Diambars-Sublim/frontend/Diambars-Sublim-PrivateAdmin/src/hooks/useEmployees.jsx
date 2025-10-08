// src/hooks/useEmployees.js
import { useCallback, useEffect, useState } from 'react';
import employeeService from '../api/EmployeeService';
import { toast } from 'react-hot-toast';

const handleError = (error, defaultMessage) => {
  const errorData = error.response?.data || {};
  const errorMessage = errorData.message || errorData.error || error.message || defaultMessage;

  console.error('Error:', { error, response: error.response, config: error.config });
  toast.error(errorMessage);
  throw new Error(errorMessage);
};

const useEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para formatear empleados con campos faltantes
  const formatEmployee = (employee) => {
    const formattedEmployee = {
      ...employee,
      id: employee._id || employee.id,
      phone: employee.phoneNumber || employee.phone || '', // Mapear phoneNumber a phone para compatibilidad
      phoneNumber: employee.phoneNumber || employee.phone || '', // Mantener ambos
      status: employee.active !== false ? 'active' : 'inactive', // Mapear active a status
      fullName: employee.name || '', // Alias para nombre completo
      duiFormatted: employee.dui || '', // DUI formateado si es necesario
      roleDisplay: employee.role ? employee.role.charAt(0).toUpperCase() + employee.role.slice(1) : 'Employee'
    };
    
    console.log('[formatEmployee] Empleado formateado:', {
      id: formattedEmployee.id,
      name: formattedEmployee.name,
      role: formattedEmployee.role,
      status: formattedEmployee.status,
      active: formattedEmployee.active
    });
    
    return formattedEmployee;
  };

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await employeeService.getAll();
      console.log("👉 Empleados recibidos:", data);

      if (!Array.isArray(data)) {
        throw new Error("Formato de empleados inválido");
      }

      const formattedEmployees = data.map(formatEmployee);
      setEmployees(formattedEmployees);

    } catch (err) {
      console.error("❌ Error al cargar empleados:", err);
      setError(err.message || "Error al cargar empleados");
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createEmployee = useCallback(async (employeeData) => {
    try {
      const response = await employeeService.createEmployee(employeeData);
      toast.success('Empleado registrado exitosamente');
      await fetchEmployees(); // Recargar lista
      return response;
    } catch (error) {
      handleError(error, 'Error al crear empleado');
    }
  }, [fetchEmployees]);

  const updateEmployee = useCallback(async (id, employeeData) => {
    try {
      const response = await employeeService.updateEmployee(id, employeeData);
      toast.success('Empleado actualizado exitosamente');
      await fetchEmployees(); // Recargar lista
      return response;
    } catch (error) {
      handleError(error, 'Error al actualizar empleado');
    }
  }, [fetchEmployees]);

  const inactivateEmployee = useCallback(async (id) => {
    try {
      const response = await employeeService.inactivateEmployee(id);
      toast.success('Empleado inactivado exitosamente');
      await fetchEmployees(); // Recargar lista
      return response;
    } catch (error) {
      handleError(error, 'Error al inactivar empleado');
    }
  }, [fetchEmployees]);

  const hardDeleteEmployee = useCallback(async (id) => {
    try {
      const response = await employeeService.hardDeleteEmployee(id);
      toast.success('Empleado eliminado permanentemente');
      await fetchEmployees(); // Recargar lista
      return response;
    } catch (error) {
      handleError(error, 'Error al eliminar empleado');
    }
  }, [fetchEmployees]);

  // Función para validar datos antes de crear/actualizar
  const validateEmployeeData = useCallback((employeeData) => {
    return employeeService.validateEmployeeData(employeeData);
  }, []);

  const changePassword = useCallback(async (id, passwordData) => {
    try {
      const response = await employeeService.changePassword(id, passwordData);
      toast.success('Contraseña cambiada exitosamente');
      return response;
    } catch (error) {
      handleError(error, 'Error al cambiar contraseña');
    }
  }, []);

  const getEmployeeById = useCallback(async (id) => {
    try {
      const response = await employeeService.getEmployeeById(id);
      return formatEmployee(response);
    } catch (error) {
      handleError(error, 'Error al obtener empleado');
    }
  }, []);

  const updateOwnProfile = useCallback(async (employeeData) => {
    try {
      const response = await employeeService.updateOwnProfile(employeeData);
      toast.success('Perfil actualizado exitosamente');
      return response;
    } catch (error) {
      handleError(error, 'Error al actualizar perfil');
    }
  }, []);

  // Funciones específicas para empleados
  const getEmployeesByRole = useCallback(async (role) => {
    try {
      const data = await employeeService.getEmployeesByRole(role);
      return data.map(formatEmployee);
    } catch (error) {
      handleError(error, 'Error al obtener empleados por rol');
    }
  }, []);

  const getActiveEmployees = useCallback(async () => {
    try {
      const data = await employeeService.getActiveEmployees();
      return data.map(formatEmployee);
    } catch (error) {
      handleError(error, 'Error al obtener empleados activos');
    }
  }, []);

  const checkEmailAvailability = useCallback(async (email) => {
    // Como no hay endpoint específico, podemos hacer validación en frontend
    // o intentar crear y manejar el error de duplicado
    try {
      const allEmployees = await employeeService.getAll();
      const emailExists = allEmployees.some(emp => emp.email?.toLowerCase() === email.toLowerCase());
      return { available: !emailExists, message: emailExists ? 'Email ya está en uso' : 'Email disponible' };
    } catch (error) {
      console.error('Error al verificar email:', error);
      return { available: false, message: 'Error al verificar email' };
    }
  }, []);

  const checkDuiAvailability = useCallback(async (dui) => {
    // Como no hay endpoint específico, podemos hacer validación en frontend
    try {
      const allEmployees = await employeeService.getAll();
      const duiExists = allEmployees.some(emp => emp.dui === dui);
      return { available: !duiExists, message: duiExists ? 'DUI ya está en uso' : 'DUI disponible' };
    } catch (error) {
      console.error('Error al verificar DUI:', error);
      return { available: false, message: 'Error al verificar DUI' };
    }
  }, []);

  // Funciones de estadísticas
  const getEmployeeStats = useCallback(() => {
    const total = employees.length;
    const active = employees.filter(e => e.status === 'active').length;
    const inactive = employees.filter(e => e.status === 'inactive').length;
    
    // Estadísticas por rol
    const admins = employees.filter(e => e.role?.toLowerCase() === 'admin').length;
    const managers = employees.filter(e => e.role?.toLowerCase() === 'manager').length;
    const employeesCount = employees.filter(e => e.role?.toLowerCase() === 'employee').length;
    const delivery = employees.filter(e => e.role?.toLowerCase() === 'delivery').length;
    const production = employees.filter(e => e.role?.toLowerCase() === 'production').length;

    return { 
      total, 
      active, 
      inactive,
      roles: {
        admins,
        managers,
        employees: employeesCount,
        delivery,
        production
      }
    };
  }, [employees]);

  // Funciones de filtrado útiles
  const getEmployeesByStatus = useCallback((status) => {
    return employees.filter(employee => employee.status === status);
  }, [employees]);

  const searchEmployees = useCallback((searchTerm) => {
    const term = searchTerm.toLowerCase();
    return employees.filter(employee => 
      employee.name?.toLowerCase().includes(term) ||
      employee.email?.toLowerCase().includes(term) ||
      employee.phoneNumber?.includes(term) ||
      employee.dui?.includes(term) ||
      employee.role?.toLowerCase().includes(term)
    );
  }, [employees]);

  // Cargar empleados al inicializar
  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    inactivateEmployee,
    hardDeleteEmployee,
    changePassword,
    getEmployeeById,
    getEmployeesByRole,
    getActiveEmployees,
    checkEmailAvailability,
    checkDuiAvailability,
    validateEmployeeData,
    getEmployeeStats,
    getEmployeesByStatus,
    searchEmployees,
    updateOwnProfile
  };
};

export default useEmployees;