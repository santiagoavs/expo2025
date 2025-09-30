// src/api/employeeService.js - Servicio de empleados para React Native
import apiClient from './ApiClient';
import { showError } from '../utils/SweetAlert';

const BASE_URL = '/employees';

const EmployeeService = {
  // ==================== CRUD BÁSICO ====================
  
  /**
   * Obtener todos los empleados
   */
  getAll: async (params = {}) => {
    try {
      console.log('👥 [EmployeeService-Mobile] Obteniendo empleados:', params);
      
      const response = await apiClient.get(BASE_URL, { params });
      console.log('✅ [EmployeeService-Mobile] Empleados obtenidos:', response);
      return response;
    } catch (error) {
      console.error('❌ [EmployeeService-Mobile] Error obteniendo empleados:', error);
      throw error;
    }
  },

  /**
   * Obtener empleado por ID
   */
  getById: async (id) => {
    try {
      console.log('👥 [EmployeeService-Mobile] Obteniendo empleado:', id);
      
      const response = await apiClient.get(`${BASE_URL}/${id}`);
      console.log('✅ [EmployeeService-Mobile] Empleado obtenido:', response);
      return response;
    } catch (error) {
      console.error('❌ [EmployeeService-Mobile] Error obteniendo empleado:', error);
      throw error;
    }
  },

  /**
   * Crear nuevo empleado
   */
  create: async (employeeData) => {
    try {
      console.log('🆕 [EmployeeService-Mobile] Creando empleado:', employeeData);
      console.log('🔍 [EmployeeService-Mobile] Tipo de employeeData:', typeof employeeData);
      console.log('🔍 [EmployeeService-Mobile] Es FormData:', employeeData instanceof FormData);

      // Si es FormData, no validar aquí (se validó en el hook)
      if (!(employeeData instanceof FormData)) {
        // Validaciones básicas solo para objetos JavaScript
        if (!employeeData.name || !employeeData.name.trim()) {
          throw new Error('El nombre del empleado es obligatorio');
        }
        if (!employeeData.email || !employeeData.email.trim()) {
          throw new Error('El email del empleado es obligatorio');
        }
        if (!employeeData.phoneNumber || !employeeData.phoneNumber.trim()) {
          throw new Error('El teléfono del empleado es obligatorio');
        }
        if (!employeeData.dui || !employeeData.dui.trim()) {
          throw new Error('El DUI del empleado es obligatorio');
        }
        if (!employeeData.password || employeeData.password.length < 6) {
          throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
      }

      // Enviar como JSON (no FormData) porque el endpoint de registro no maneja archivos
      const response = await apiClient.post('/employees/register', employeeData, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 60000, // 60 segundos
      });
      console.log('✅ [EmployeeService-Mobile] Empleado creado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [EmployeeService-Mobile] Error creando empleado:', error);
      throw error;
    }
  },

  /**
   * Actualizar empleado
   */
  update: async (id, employeeData) => {
    try {
      console.log('✏️ [EmployeeService-Mobile] Actualizando empleado:', id, employeeData);

      const response = await apiClient.put(`${BASE_URL}/${id}`, employeeData);
      console.log('✅ [EmployeeService-Mobile] Empleado actualizado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [EmployeeService-Mobile] Error actualizando empleado:', error);
      throw error;
    }
  },

  /**
   * Eliminar empleado (soft delete)
   */
  delete: async (id) => {
    try {
      console.log('🗑️ [EmployeeService-Mobile] Eliminando empleado:', id);

      const response = await apiClient.delete(`${BASE_URL}/${id}`);
      console.log('✅ [EmployeeService-Mobile] Empleado eliminado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [EmployeeService-Mobile] Error eliminando empleado:', error);
      throw error;
    }
  },

  /**
   * Eliminar empleado permanentemente (hard delete)
   */
  hardDelete: async (id) => {
    try {
      console.log('🗑️ [EmployeeService-Mobile] Eliminando empleado permanentemente:', id);

      const response = await apiClient.delete(`${BASE_URL}/${id}/hard`);
      console.log('✅ [EmployeeService-Mobile] Empleado eliminado permanentemente:', response);
      return response;
    } catch (error) {
      console.error('❌ [EmployeeService-Mobile] Error eliminando empleado permanentemente:', error);
      throw error;
    }
  },

  // ==================== FUNCIONALIDADES AVANZADAS ====================

  /**
   * Buscar empleados
   */
  search: async (query, filters = {}) => {
    try {
      console.log('🔍 [EmployeeService-Mobile] Buscando empleados:', { query, filters });
      
      if (!query || query.trim().length < 2) {
        return { success: true, data: { employees: [] } };
      }

      const queryParams = new URLSearchParams({
        q: query.trim(),
        ...filters
      });

      const response = await apiClient.get(`${BASE_URL}/search?${queryParams}`);
      console.log('✅ [EmployeeService-Mobile] Resultados de búsqueda:', response);
      return response;
    } catch (error) {
      console.error('❌ [EmployeeService-Mobile] Error en búsqueda:', error);
      throw error;
    }
  },

  /**
   * Cambiar contraseña de empleado
   */
  changePassword: async (id, passwordData) => {
    try {
      console.log('🔐 [EmployeeService-Mobile] Cambiando contraseña:', id);

      const response = await apiClient.patch(`${BASE_URL}/${id}/password`, passwordData);
      console.log('✅ [EmployeeService-Mobile] Contraseña cambiada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [EmployeeService-Mobile] Error cambiando contraseña:', error);
      throw error;
    }
  },

  /**
   * Obtener empleados por rol
   */
  getByRole: async (role) => {
    try {
      console.log('👥 [EmployeeService-Mobile] Obteniendo empleados por rol:', role);
      
      const response = await apiClient.get(`${BASE_URL}?role=${role}`);
      console.log('✅ [EmployeeService-Mobile] Empleados por rol obtenidos:', response);
      return response;
    } catch (error) {
      console.error('❌ [EmployeeService-Mobile] Error obteniendo empleados por rol:', error);
      throw error;
    }
  },

  /**
   * Obtener solo empleados activos
   */
  getActive: async () => {
    try {
      console.log('👥 [EmployeeService-Mobile] Obteniendo empleados activos');
      
      const response = await apiClient.get(`${BASE_URL}?status=active`);
      console.log('✅ [EmployeeService-Mobile] Empleados activos obtenidos:', response);
      return response;
    } catch (error) {
      console.error('❌ [EmployeeService-Mobile] Error obteniendo empleados activos:', error);
      throw error;
    }
  },

  // ==================== UTILIDADES ====================
  
  /**
   * Validar datos de empleado
   */
  validateEmployeeData: (employeeData) => {
    const errors = [];
    
    if (!employeeData.name?.trim()) errors.push('Nombre es requerido');
    if (!employeeData.email?.trim()) errors.push('Email es requerido');
    if (!employeeData.phoneNumber?.trim()) errors.push('Teléfono es requerido');
    if (!employeeData.dui?.trim()) errors.push('DUI es requerido');
    if (!employeeData.address?.trim()) errors.push('Dirección es requerida');
    if (!employeeData.birthday) errors.push('Fecha de nacimiento es requerida');
    if (!employeeData.hireDate) errors.push('Fecha de contratación es requerida');
    if (!employeeData.password || employeeData.password.length < 6) {
      errors.push('Contraseña debe tener al menos 6 caracteres');
    }
    
    // Validar formato DUI
    const duiPattern = /^[0-9]{8}-[0-9]{1}$/;
    if (employeeData.dui && !duiPattern.test(employeeData.dui)) {
      errors.push('Formato de DUI inválido (debe ser 12345678-9)');
    }
    
    // Validar formato teléfono
    const phonePattern = /^[0-9]{8,15}$/;
    if (employeeData.phoneNumber && !phonePattern.test(employeeData.phoneNumber)) {
      errors.push('Teléfono debe contener entre 8 y 15 dígitos');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Sanitizar datos de empleado
   */
  sanitizeEmployeeData: (employeeData) => {
    console.log('🔍 [EmployeeService-Mobile] Datos originales para sanitizar:', employeeData);
    
    const sanitized = { ...employeeData };
    
    // Sanitizar campos de texto
    if (sanitized.name) sanitized.name = sanitized.name.trim();
    if (sanitized.email) sanitized.email = sanitized.email.trim().toLowerCase();
    if (sanitized.phoneNumber) sanitized.phoneNumber = sanitized.phoneNumber.trim();
    if (sanitized.dui) sanitized.dui = sanitized.dui.trim();
    if (sanitized.address) sanitized.address = sanitized.address.trim();
    
    // Asegurar que el rol tenga un valor por defecto
    if (!sanitized.role) sanitized.role = 'employee';
    
    console.log('🔍 [EmployeeService-Mobile] Datos sanitizados:', sanitized);
    
    return sanitized;
  },

  /**
   * Formatear empleado para mostrar
   */
  formatEmployee: (employee) => {
    const formattedEmployee = {
      ...employee,
      id: employee._id || employee.id,
      phone: employee.phoneNumber || employee.phone || '',
      phoneNumber: employee.phoneNumber || employee.phone || '',
      status: employee.active !== false ? 'active' : 'inactive',
      fullName: employee.name || '',
      duiFormatted: employee.dui || '',
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
  }
};

export default EmployeeService;
