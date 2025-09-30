// src/api/employeeService.js
import apiClient from './ApiClient';

const BASE_URL = '/api/employees';

export default {
  // Obtener todos los empleados activos (requiere Admin/Manager)
  getAll: async () => {
    const response = await apiClient.get(BASE_URL);
    return response;
  },

  // Obtener empleado por ID (requiere Admin/Manager)
  getEmployeeById: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response;
  },

  // Crear nuevo empleado (registro - requiere Admin)
  // Usa el endpoint de registro de empleados
  createEmployee: async (employeeData) => {
    const response = await apiClient.post('/api/employees/register', employeeData);
    return response;
  },

  // Actualizar empleado (sin contraseña - requiere Admin/Manager)
  updateEmployee: async (id, employeeData) => {
    const response = await apiClient.put(`${BASE_URL}/${id}`, employeeData);
    return response;
  },

  // Cambiar contraseña de empleado (propia o Admin/Manager puede cambiar cualquiera)
  changePassword: async (id, passwordData) => {
    const response = await apiClient.patch(`${BASE_URL}/${id}/password`, passwordData);
    return response;
  },

  // Inactivar empleado (soft delete - requiere Admin/Manager) 
  // NOTA: El backend usa DELETE pero hace soft delete internamente
  inactivateEmployee: async (id) => {
    const response = await apiClient.delete(`${BASE_URL}/${id}`);
    return response;
  },

  // Eliminar empleado permanentemente (hard delete - requiere Admin)
  hardDeleteEmployee: async (id) => {
    const response = await apiClient.delete(`${BASE_URL}/${id}/hard`);
    return response;
  },

  // Métodos adicionales que podrían ser útiles (aunque no estén en las rutas actuales)
  
  // Obtener empleados por rol (filtro en frontend ya que backend solo devuelve todos)
  getEmployeesByRole: async (role) => {
    const allEmployees = await apiClient.get(BASE_URL);
    return allEmployees.filter(emp => emp.role?.toLowerCase() === role.toLowerCase());
  },

  // Obtener solo empleados activos (el backend ya filtra por activos)
  getActiveEmployees: async () => {
    const response = await apiClient.get(BASE_URL);
    return response;
  },

  // Funciones de validación (para usar en formularios antes de enviar)
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
    
    return { isValid: errors.length === 0, errors };
  }
};