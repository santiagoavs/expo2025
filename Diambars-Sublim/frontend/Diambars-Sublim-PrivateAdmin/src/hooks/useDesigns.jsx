// src/hooks/useDesigns.js - HOOK COMPLETO PARA GESTIÓN DE DISEÑOS ADMIN
import { useCallback, useEffect, useState } from 'react';
import DesignService from '../api/DesignService';
import Swal from 'sweetalert2';

const useDesigns = () => {
  // ==================== ESTADOS ====================
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    totalDesigns: 0,
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
    status: '',      // 'pending', 'quoted', 'approved', etc.
    product: '',     // ID del producto
    user: '',        // ID del usuario/cliente
    sort: 'createdAt',
    order: 'desc'
  });

  // ==================== UTILIDADES ====================

  // Manejar errores de manera consistente
  const handleError = useCallback((error, defaultMessage = 'Error en operación de diseños') => {
    console.error('❌ [useDesigns] Error:', error);
    
    let errorMessage = defaultMessage;
    
    if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.message) {
      errorMessage = error.message;
    }
    
    // Mostrar error específico según el tipo
    if (error?.response?.status === 404) {
      errorMessage = 'Diseño no encontrado';
    } else if (error?.response?.status === 403) {
      errorMessage = 'No tienes permisos para realizar esta acción';
    } else if (error?.response?.status === 400) {
      errorMessage = error?.response?.data?.message || 'Datos inválidos';
    }
    
    setError(errorMessage);
    
    // Mostrar toast de error
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'error',
      title: errorMessage,
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
      background: '#ffffff',
      color: '#010326',
      iconColor: '#040DBF'
    });
    
    return errorMessage;
  }, []);

  // Formatear diseño usando el servicio
  const formatDesign = useCallback((design) => {
    return DesignService.formatDesign(design);
  }, []);

  // ==================== FUNCIONES PRINCIPALES ====================

  // Obtener diseños con filtros y paginación
  const fetchDesigns = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎨 [useDesigns] Obteniendo diseños:', params);
      
      // Combinar parámetros con filtros actuales
      const queryParams = {
        ...filters,
        ...params
      };
      
      const response = await DesignService.getAll(queryParams);
      
      if (!response.success || !Array.isArray(response.data?.designs)) {
        throw new Error("Formato de respuesta inválido");
      }

      // Formatear diseños
      const formattedDesigns = response.data.designs
        .map(formatDesign)
        .filter(design => design !== null)
        // Excluir diseños cancelados por defecto, a menos que se esté filtrando específicamente por "cancelled"
        .filter(design => {
          if (queryParams.status === 'cancelled') {
            return design.status === 'cancelled';
          }
          // Si no se está filtrando por "cancelled", excluir los cancelados
          return design.status !== 'cancelled';
        });
      
      setDesigns(formattedDesigns);
      
      // Actualizar paginación
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }
      
      console.log('✅ [useDesigns] Diseños cargados:', {
        count: formattedDesigns.length,
        pagination: response.data.pagination
      });
      
      return formattedDesigns;
    } catch (error) {
      handleError(error, 'Error al cargar diseños');
      setDesigns([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, [filters, formatDesign, handleError]);

  // Crear diseño para cliente (Admin)
  const createDesignForClient = useCallback(async (designData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🆕 [useDesigns] Creando diseño para cliente:', designData);
      
      // Validar datos antes de enviar
      const validation = DesignService.validateDesignData(designData);
      if (!validation.isValid) {
        throw new Error(`Errores de validación:\n• ${validation.errors.join('\n• ')}`);
      }

      const response = await DesignService.createForClient(designData);
      
      if (!response.success) {
        throw new Error(response.message || 'Error al crear diseño');
      }
      
      // Mostrar éxito
      await Swal.fire({
        title: '¡Diseño creado!',
        text: 'El diseño se ha enviado para cotización',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#1F64BF',
        timer: 3000,
        timerProgressBar: true,
        showClass: {
          popup: 'animate__animated animate__fadeInDown animate__faster'
        }
      });
      
      // Refrescar lista
      await fetchDesigns();
      
      console.log('✅ [useDesigns] Diseño creado exitosamente');
      return response.data;
    } catch (error) {
      handleError(error, 'Error al crear diseño');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchDesigns, handleError]);

  // Actualizar diseño existente
  const updateDesign = useCallback(async (id, designData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('✏️ [useDesigns] Actualizando diseño:', { id, designData });
      
      if (!id) {
        throw new Error('ID de diseño requerido');
      }
      
      const response = await DesignService.update(id, designData);
      
      if (!response.success) {
        throw new Error(response.message || 'Error al actualizar diseño');
      }
      
      // Mostrar éxito
      await Swal.fire({
        title: '¡Diseño actualizado!',
        text: 'Los cambios se han guardado exitosamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#1F64BF',
        timer: 3000,
        timerProgressBar: true
      });
      
      // Refrescar lista
      await fetchDesigns();
      
      console.log('✅ [useDesigns] Diseño actualizado exitosamente');
      return response.data;
    } catch (error) {
      handleError(error, 'Error al actualizar diseño');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchDesigns, handleError]);

  /**
 * Actualizar color del producto en un diseño
 * @param {string} id - ID del diseño
 * @param {string} color - Color en formato hexadecimal
 * @returns {Promise} Resultado de la actualización
 */
const updateProductColor = useCallback(async (id, color) => {
  try {
    setError(null);
    
    console.log('🎨 [useDesigns] Actualizando color del producto:', { id, color });
    
    if (!id) {
      throw new Error('ID de diseño requerido');
    }

    const response = await DesignService.updateProductColor(id, color);
    
    if (!response.success) {
      throw new Error(response.message || 'Error al actualizar color del producto');
    }
    
    // Mostrar éxito con toast discreto
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: 'Color del producto actualizado',
      showConfirmButton: false,
      timer: 2000,
      background: '#ffffff',
      color: '#010326'
    });
    
    // Actualizar localmente
    setDesigns(prev => prev.map(d => d._id === id || d.id === id ? { ...d, productColorFilter: color || null } : d));

    console.log('✅ [useDesigns] Color del producto actualizado exitosamente');
    return response.data;
  } catch (error) {
    handleError(error, 'Error al actualizar color del producto');
    throw error;
  }
}, [handleError]);

  // Obtener diseño por ID
  const getDesignById = useCallback(async (id) => {
    try {
      setError(null);
      
      console.log('🔍 [useDesigns] Obteniendo diseño por ID:', id);
      
      if (!id) {
        throw new Error('ID de diseño requerido');
      }

      const response = await DesignService.getById(id);
      
      if (!response.success || !response.data?.design) {
        throw new Error('Diseño no encontrado');
      }

      const formattedDesign = formatDesign(response.data.design);
      console.log('✅ [useDesigns] Diseño obtenido:', formattedDesign);
      
      return formattedDesign;
    } catch (error) {
      handleError(error, 'Error al obtener diseño');
      return null;
    }
  }, [formatDesign, handleError]);

  // Clonar diseño
  const cloneDesign = useCallback(async (id, options = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📋 [useDesigns] Clonando diseño:', { id, options });
      
      if (!id) {
        throw new Error('ID de diseño requerido');
      }

      const response = await DesignService.clone(id, options);
      
      if (!response.success) {
        throw new Error(response.message || 'Error al clonar diseño');
      }
      
      // Mostrar éxito
      await Swal.fire({
        title: '¡Diseño clonado!',
        text: 'Se ha creado una copia del diseño',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#1F64BF',
        timer: 3000,
        timerProgressBar: true
      });
      
      // Refrescar lista
      await fetchDesigns();
      
      console.log('✅ [useDesigns] Diseño clonado exitosamente');
      return response.data;
    } catch (error) {
      handleError(error, 'Error al clonar diseño');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchDesigns, handleError]);

  // Guardar borrador
  const saveDraft = useCallback(async (designData) => {
    try {
      setError(null);
      
      console.log('💾 [useDesigns] Guardando borrador:', designData);
      
      const response = await DesignService.saveDraft(designData);
      
      if (!response.success) {
        throw new Error(response.message || 'Error al guardar borrador');
      }
      
      // Mostrar éxito (toast más discreto para borradores)
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Borrador guardado',
        showConfirmButton: false,
        timer: 2000,
        background: '#ffffff',
        color: '#010326'
      });
      
      console.log('✅ [useDesigns] Borrador guardado exitosamente');
      return response.data;
    } catch (error) {
      handleError(error, 'Error al guardar borrador');
      throw error;
    }
  }, [handleError]);

  // ==================== SISTEMA DE COTIZACIONES ====================

  // Enviar cotización (Admin)
  const submitQuote = useCallback(async (id, quoteData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('💰 [useDesigns] Enviando cotización:', { id, quoteData });
      
      if (!id) {
        throw new Error('ID de diseño requerido');
      }

      const response = await DesignService.submitQuote(id, quoteData);
      
      if (!response.success) {
        // Manejar errores específicos
        if (response.message?.includes('No se puede cotizar un diseño en estado')) {
          throw new Error('Este diseño ya ha sido cotizado anteriormente');
        }
        throw new Error(response.message || 'Error al enviar cotización');
      }
      
      // Mostrar éxito
      await Swal.fire({
        title: '¡Cotización enviada!',
        text: 'La cotización ha sido enviada al cliente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#1F64BF',
        timer: 3000,
        timerProgressBar: true
      });
      
      // Refrescar lista
      await fetchDesigns();
      
      console.log('✅ [useDesigns] Cotización enviada exitosamente');
      return response.data;
    } catch (error) {
      handleError(error, 'Error al enviar cotización');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchDesigns, handleError]);

  // Responder a cotización (Para testing como cliente)
  const respondToQuote = useCallback(async (id, responseData) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('📝 [useDesigns] Respondiendo a cotización:', { id, responseData });
      
      if (!id) {
        throw new Error('ID de diseño requerido');
      }

      const response = await DesignService.respondToQuote(id, responseData);
      
      if (!response.success) {
        throw new Error(response.message || 'Error al responder cotización');
      }
      
      const actionText = responseData.accept ? 'aceptada' : 'rechazada';
      
      // Mostrar éxito
      await Swal.fire({
        title: `¡Cotización ${actionText}!`,
        text: response.message || `La cotización ha sido ${actionText}`,
        icon: responseData.accept ? 'success' : 'info',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#1F64BF',
        timer: 3000,
        timerProgressBar: true
      });
      
      // Refrescar lista
      await fetchDesigns();
      
      console.log('✅ [useDesigns] Respuesta a cotización procesada');
      return response.data;
    } catch (error) {
      handleError(error, 'Error al responder cotización');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchDesigns, handleError]);

  // ==================== GESTIÓN DE ESTADOS ====================

  // Cambiar estado del diseño
  const changeDesignStatus = useCallback(async (id, newStatus, notes = '') => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 [useDesigns] Cambiando estado:', { id, newStatus, notes });
      
      if (!id) {
        throw new Error('ID de diseño requerido');
      }

      const response = await DesignService.changeStatus(id, newStatus, notes);
      
      if (!response.success) {
        throw new Error(response.message || 'Error al cambiar estado');
      }
      
      const statusText = DesignService.getStatusText(newStatus);
      
      // Mostrar éxito
      await Swal.fire({
        title: '¡Estado actualizado!',
        text: `El diseño ahora está en estado: ${statusText}`,
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#1F64BF',
        timer: 3000,
        timerProgressBar: true
      });
      
      // Refrescar lista
      await fetchDesigns();
      
      console.log('✅ [useDesigns] Estado cambiado exitosamente');
      return response.data;
    } catch (error) {
      handleError(error, 'Error al cambiar estado');
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchDesigns, handleError]);

  // Cancelar diseño
  const cancelDesign = useCallback(async (id, reason = '') => {
    try {
      console.log('❌ [useDesigns] Solicitando cancelación de diseño:', id);
      
      if (!id) {
        throw new Error('ID de diseño requerido');
      }
      
      // Confirmación con SweetAlert2
      const result = await Swal.fire({
        title: '¿Cancelar diseño?',
        html: `
          <p>¿Estás seguro de que quieres cancelar este diseño?</p>
          <p class="text-sm text-gray-600 mt-2">Esta acción no se puede deshacer.</p>
        `,
        input: 'textarea',
        inputPlaceholder: 'Motivo de cancelación (opcional)',
        inputValue: reason,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#040DBF',
        cancelButtonColor: '#032CA6',
        confirmButtonText: 'Sí, cancelar',
        cancelButtonText: 'No cancelar',
        reverseButtons: true,
        focusCancel: true
      });

      if (!result.isConfirmed) {
        return false;
      }
      
      setLoading(true);
      setError(null);
      
      const response = await DesignService.cancel(id, result.value || reason);
      
      if (!response.success) {
        throw new Error(response.message || 'Error al cancelar diseño');
      }
      
      // Mostrar éxito
      await Swal.fire({
        title: '¡Diseño cancelado!',
        text: response.message || 'El diseño ha sido cancelado exitosamente',
        icon: 'success',
        confirmButtonText: 'Continuar',
        confirmButtonColor: '#1F64BF',
        timer: 3000,
        timerProgressBar: true
      });
      
      // Refrescar lista
      await fetchDesigns();
      
      console.log('✅ [useDesigns] Diseño cancelado exitosamente');
      return true;
    } catch (error) {
      handleError(error, 'Error al cancelar diseño');
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchDesigns, handleError]);

  // ==================== OBTENER DISEÑOS DE USUARIO ====================

  // Obtener diseños de un usuario específico
  const getUserDesigns = useCallback(async (userId, options = {}) => {
    try {
      setError(null);
      
      console.log('👤 [useDesigns] Obteniendo diseños del usuario:', userId);
      
      if (!userId) {
        throw new Error('ID de usuario requerido');
      }

      const response = await DesignService.getUserDesigns(userId, options);
      
      if (!response.success || !Array.isArray(response.data?.designs)) {
        throw new Error('Error obteniendo diseños del usuario');
      }

      const formattedDesigns = response.data.designs
        .map(formatDesign)
        .filter(design => design !== null);
      
      console.log('✅ [useDesigns] Diseños del usuario obtenidos:', formattedDesigns.length);
      return formattedDesigns;
    } catch (error) {
      handleError(error, 'Error al obtener diseños del usuario');
      return [];
    }
  }, [formatDesign, handleError]);

  // ==================== ESTADÍSTICAS Y ANÁLISIS ====================

  // Obtener estadísticas de diseños
  const getDesignStats = useCallback(() => {
    const total = designs.length;
    const pending = designs.filter(d => d.status === 'pending').length;
    const quoted = designs.filter(d => d.status === 'quoted').length;
    const approved = designs.filter(d => d.status === 'approved').length;
    const rejected = designs.filter(d => d.status === 'rejected').length;
    const completed = designs.filter(d => d.status === 'completed').length;
    const drafts = designs.filter(d => d.status === 'draft').length;
    
    const totalRevenue = designs
      .filter(d => d.status === 'approved' || d.status === 'completed')
      .reduce((sum, design) => sum + (design.price || 0), 0);
    
    const avgPrice = quoted > 0 ? 
      designs.filter(d => d.price > 0).reduce((sum, d) => sum + d.price, 0) / designs.filter(d => d.price > 0).length 
      : 0;

    // Top 5 diseños por precio
    const topDesignsByPrice = [...designs]
      .filter(d => d.price > 0)
      .sort((a, b) => b.price - a.price)
      .slice(0, 5);

    // Diseños más recientes
    const recentDesigns = [...designs]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Complejidad promedio
    const complexityDistribution = designs.reduce((acc, design) => {
      acc[design.complexity] = (acc[design.complexity] || 0) + 1;
      return acc;
    }, {});

    // Tasa de conversión (cotizados -> aprobados)
    const conversionRate = quoted > 0 ? ((approved / quoted) * 100) : 0;

    return { 
      total, 
      pending, 
      quoted, 
      approved, 
      rejected, 
      completed,
      drafts,
      totalRevenue,
      avgPrice,
      topDesignsByPrice,
      recentDesigns,
      complexityDistribution,
      conversionRate
    };
  }, [designs]);

  // ==================== GESTIÓN DE FILTROS ====================

  // Actualizar filtros
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({
      search: '',
      status: '',
      product: '',
      user: '',
      sort: 'createdAt',
      order: 'desc'
    });
  }, []);

  // ==================== UTILIDADES DE KONVA ====================

  // Preparar diseño para editor Konva
  const prepareForKonvaEditor = useCallback((design) => {
    try {
      return DesignService.prepareForKonvaEditor(design);
    } catch (error) {
      console.error('❌ [useDesigns] Error preparando para Konva:', error);
      return null;
    }
  }, []);

  // Convertir datos de Konva a formato backend
  const prepareFromKonvaEditor = useCallback((konvaData) => {
    try {
      return DesignService.prepareFromKonvaEditor(konvaData);
    } catch (error) {
      console.error('❌ [useDesigns] Error convirtiendo desde Konva:', error);
      return null;
    }
  }, []);

  // ==================== EFECTOS ====================

  // Cargar diseños cuando cambien los filtros
  useEffect(() => {
    fetchDesigns();
  }, [fetchDesigns]);

  // Limpiar error después de un tiempo
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [error]);

  // ==================== RETORNO ====================

  return {
    // Estados principales
    designs,
    loading,
    error,
    pagination,
    filters,

    // Funciones principales CRUD
    fetchDesigns,
    createDesignForClient,
    updateDesign,
    updateProductColor,
    getDesignById,
    cloneDesign,
    saveDraft,
    getUserDesigns,

    // Sistema de cotizaciones
    submitQuote,
    respondToQuote,

    // Gestión de estados
    changeDesignStatus,
    cancelDesign,

    // Estadísticas y análisis
    getDesignStats,

    // Gestión de filtros
    updateFilters,
    clearFilters,

    // Utilidades Konva
    prepareForKonvaEditor,
    prepareFromKonvaEditor,

    // Utilidades
    refetch: fetchDesigns,
    
    // Estados calculados
    hasDesigns: designs.length > 0,
    isEmpty: !loading && designs.length === 0,
    hasError: !!error,
    isFirstLoad: !loading && designs.length === 0 && !error,
    
    // Funciones auxiliares
    formatDesign,
    
    // Validación
    validateDesignData: DesignService.validateDesignData,
    
    // Configuración de estados
    getStatusText: DesignService.getStatusText,
    getStatusColor: DesignService.getStatusColor
  };
};

export default useDesigns;