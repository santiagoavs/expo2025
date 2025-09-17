// src/api/addressService.js
import apiClient from './ApiClient';

const BASE_URL = '/addresses';

export default {
  // ==================== CRUD Básico ====================
  
  /**
   * Obtener todas las direcciones (admin)
   * @param {Object} filters - Filtros de búsqueda
   */
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    
    // Agregar filtros válidos
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.department) params.append('department', filters.department);
    if (filters.municipality) params.append('municipality', filters.municipality);
    if (filters.search) params.append('search', filters.search);
    if (filters.isActive !== undefined && filters.isActive !== '') {
      params.append('isActive', filters.isActive);
    }
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.sort) params.append('sort', filters.sort);

    const queryString = params.toString();
    const url = queryString ? `${BASE_URL}/admin/all?${queryString}` : `${BASE_URL}/admin/all`;
    
    const response = await apiClient.get(url);
    return response;
  },

  /**
   * Obtener direcciones de un usuario específico
   * @param {string} userId - ID del usuario
   */
  getUserAddresses: async (userId) => {
    const response = await apiClient.get(`${BASE_URL}/user/${userId}`);
    return response;
  },

  /**
   * Obtener dirección por ID
   * @param {string} addressId - ID de la dirección
   */
  getById: async (addressId) => {
    const response = await apiClient.get(`${BASE_URL}/${addressId}`);
    return response;
  },

  /**
   * Crear nueva dirección
   * @param {Object} addressData - Datos de la dirección
   */
  create: async (addressData) => {
    // Asegurar que userId esté en el campo correcto para admin
    const payload = {
      ...addressData,
      // Si es creación desde admin, el userId va en el body
      userId: addressData.userId || addressData.user
    };

    const response = await apiClient.post(BASE_URL, payload);
    return response;
  },

  /**
   * Actualizar dirección
   * @param {string} addressId - ID de la dirección
   * @param {Object} updateData - Datos a actualizar
   */
  update: async (addressId, updateData) => {
    const response = await apiClient.put(`${BASE_URL}/${addressId}`, updateData);
    return response;
  },

  /**
   * Eliminar dirección (soft delete)
   * @param {string} addressId - ID de la dirección
   */
  delete: async (addressId) => {
    const response = await apiClient.delete(`${BASE_URL}/${addressId}`);
    return response;
  },

  /**
   * Establecer dirección como predeterminada
   * @param {string} addressId - ID de la dirección
   */
  setDefault: async (addressId) => {
    const response = await apiClient.patch(`${BASE_URL}/${addressId}/set-default`);
    return response;
  },

  // ==================== Validación y Datos Auxiliares ====================

  /**
   * Validar dirección
   * @param {Object} addressData - Datos de dirección a validar
   */
  validate: async (addressData) => {
    const response = await apiClient.post(`${BASE_URL}/validate`, {
      department: addressData.department,
      municipality: addressData.municipality,
      address: addressData.address
    });
    return response;
  },

  /**
   * Obtener tarifas de envío por departamento
   */
  getDeliveryFees: async () => {
    const response = await apiClient.get(`${BASE_URL}/delivery/fees`);
    return response;
  },

  /**
   * Obtener datos de ubicaciones (departamentos y municipios)
   */
  getLocationData: async () => {
    const response = await apiClient.get('/locations/data');
    return response;
  },

  // ==================== Funcionalidades Admin ====================

  /**
   * Obtener estadísticas de direcciones
   */
  getStatistics: async () => {
    const response = await apiClient.get(`${BASE_URL}/admin/statistics`);
    return response;
  },

  /**
   * Buscar direcciones con filtros avanzados
   * @param {Object} searchParams - Parámetros de búsqueda
   */
  search: async (searchParams) => {
    const params = new URLSearchParams({
      ...searchParams,
      page: searchParams.page || 1,
      limit: searchParams.limit || 20
    });

    const response = await apiClient.get(`${BASE_URL}/admin/search?${params.toString()}`);
    return response;
  },

  /**
   * Exportar direcciones a CSV
   * @param {Object} filters - Filtros para exportación
   */
  export: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await apiClient.get(`${BASE_URL}/admin/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response;
  },

  // ==================== Funciones de Batch ====================

  /**
   * Actualizar múltiples direcciones
   * @param {Array} addressIds - IDs de direcciones
   * @param {Object} updateData - Datos a actualizar
   */
  batchUpdate: async (addressIds, updateData) => {
    const response = await apiClient.patch(`${BASE_URL}/admin/batch-update`, {
      addressIds,
      updateData
    });
    return response;
  },

  /**
   * Eliminar múltiples direcciones
   * @param {Array} addressIds - IDs de direcciones a eliminar
   */
  batchDelete: async (addressIds) => {
    const response = await apiClient.delete(`${BASE_URL}/admin/batch-delete`, {
      data: { addressIds }
    });
    return response;
  },

  // ==================== Funciones de Análisis ====================

  /**
   * Obtener distribución de direcciones por departamento
   */
  getDistributionByDepartment: async () => {
    const response = await apiClient.get(`${BASE_URL}/admin/distribution/department`);
    return response;
  },

  /**
   * Obtener usuarios con más direcciones
   * @param {number} limit - Límite de usuarios a retornar
   */
  getTopUsersByAddresses: async (limit = 10) => {
    const response = await apiClient.get(`${BASE_URL}/admin/top-users?limit=${limit}`);
    return response;
  },

  /**
   * Obtener direcciones cercanas a una coordenada
   * @param {number} lat - Latitud
   * @param {number} lng - Longitud
   * @param {number} radius - Radio en kilómetros
   */
  getNearbyAddresses: async (lat, lng, radius = 10) => {
    const response = await apiClient.get(
      `${BASE_URL}/admin/nearby?lat=${lat}&lng=${lng}&radius=${radius}`
    );
    return response;
  }
};