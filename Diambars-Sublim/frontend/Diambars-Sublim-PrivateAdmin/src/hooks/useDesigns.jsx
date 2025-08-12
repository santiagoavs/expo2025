// src/hooks/useDesigns.jsx - Hook completo para gestión de diseños
import { useCallback, useEffect, useState } from 'react';
import designService from '../api/DesignService';
import { toast } from 'react-hot-toast';

const handleError = (error, defaultMessage) => {
  const errorData = error.response?.data || {};
  const errorMessage = errorData.message || errorData.error || error.message || defaultMessage;

  console.error('Error:', { error, response: error.response, config: error.config });
  toast.error(errorMessage);
  throw new Error(errorMessage);
};

const useDesigns = () => {
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    currentPage: 1,
    limit: 10,
    hasNext: false,
    hasPrev: false
  });

  // Función para formatear diseños con campos faltantes
  const formatDesign = (design) => {
    return {
      ...design,
      id: design._id || design.id,
      formattedPrice: design.price ? `$${design.price.toFixed(2)}` : 'Sin cotizar',
      statusText: getStatusText(design.status),
      statusColor: getStatusColor(design.status),
      productName: design.product?.name || 'Producto no disponible',
      productImage: design.product?.images?.main || null,
      userName: design.user?.name || 'Usuario desconocido',
      userEmail: design.user?.email || '',
      createdDate: design.createdAt ? new Date(design.createdAt).toLocaleDateString() : null,
      quotedDate: design.quotedAt ? new Date(design.quotedAt).toLocaleDateString() : null,
      approvedDate: design.approvedAt ? new Date(design.approvedAt).toLocaleDateString() : null,
      canEdit: design.status === 'draft',
      canQuote: design.status === 'pending',
      canRespond: design.status === 'quoted',
      totalElements: design.elements?.length || 0,
      complexity: design.metadata?.complexity || 'medium',
      estimatedDays: design.productionDays || 0
    };
  };

  // Obtener diseños con filtros
  const fetchDesigns = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      console.log("👉 Obteniendo diseños con params:", params);
      const response = await designService.getAll(params);
      
      console.log("🎨 Diseños recibidos:", response);

      if (!response.success || !Array.isArray(response.data?.designs)) {
        throw new Error("Formato de respuesta de diseños inválido");
      }

      const formattedDesigns = response.data.designs.map(formatDesign);
      setDesigns(formattedDesigns);
      
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      }

    } catch (err) {
      console.error("❌ Error al cargar diseños:", err);
      setError(err.message || "Error al cargar diseños");
      setDesigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Crear diseño
  const createDesign = useCallback(async (designData) => {
    try {
      console.log("🆕 Creando diseño:", designData);
      
      // Validar datos antes de enviar
      const validation = designService.validateDesignData(designData);
      if (!validation.isValid) {
        throw new Error(`Errores de validación: ${validation.errors.join(', ')}`);
      }

      const response = await designService.create(designData);
      toast.success('Diseño creado exitosamente');
      
      // Actualizar lista de diseños
      await fetchDesigns();
      return response;
    } catch (error) {
      handleError(error, 'Error al crear diseño');
    }
  }, [fetchDesigns]);

  // Guardar como borrador
  const saveDraft = useCallback(async (draftData) => {
    try {
      console.log("💾 Guardando borrador:", draftData);
      
      const response = await designService.saveDraft(draftData);
      toast.success('Borrador guardado exitosamente');
      
      await fetchDesigns();
      return response;
    } catch (error) {
      handleError(error, 'Error al guardar borrador');
    }
  }, [fetchDesigns]);

  // Actualizar diseño
  const updateDesign = useCallback(async (id, designData) => {
    try {
      console.log("✏️ Actualizando diseño:", id, designData);
      
      const response = await designService.update(id, designData);
      toast.success('Diseño actualizado exitosamente');
      
      await fetchDesigns();
      return response;
    } catch (error) {
      handleError(error, 'Error al actualizar diseño');
    }
  }, [fetchDesigns]);

  // Clonar diseño
  const cloneDesign = useCallback(async (id, newName) => {
    try {
      console.log("📋 Clonando diseño:", id);
      
      const response = await designService.clone(id, newName);
      toast.success('Diseño clonado exitosamente');
      
      await fetchDesigns();
      return response;
    } catch (error) {
      handleError(error, 'Error al clonar diseño');
    }
  }, [fetchDesigns]);

  // Obtener diseño por ID
  const getDesignById = useCallback(async (id) => {
    try {
      console.log("🔍 Obteniendo diseño por ID:", id);
      
      const response = await designService.getById(id);
      if (response.success && response.data?.design) {
        return formatDesign(response.data.design);
      }
      throw new Error("Diseño no encontrado");
    } catch (error) {
      handleError(error, 'Error al obtener diseño');
    }
  }, []);

  // ==================== FUNCIONES DE ADMIN ====================

  // Cotizar diseño (admin)
  const submitQuote = useCallback(async (id, quoteData) => {
    try {
      console.log("💰 Enviando cotización:", id, quoteData);
      
      if (!quoteData.price || quoteData.price <= 0) {
        throw new Error("El precio debe ser mayor que 0");
      }

      if (!quoteData.productionDays || quoteData.productionDays <= 0) {
        throw new Error("Los días de producción deben ser mayor que 0");
      }

      const response = await designService.submitQuote(id, quoteData);
      toast.success('Cotización enviada al cliente');
      
      await fetchDesigns();
      return response;
    } catch (error) {
      handleError(error, 'Error al enviar cotización');
    }
  }, [fetchDesigns]);

  // Responder a cotización (cliente)
  const respondToQuote = useCallback(async (id, responseData) => {
    try {
      console.log("📝 Respondiendo a cotización:", id, responseData);
      
      const response = await designService.respondToQuote(id, responseData);
      
      if (responseData.accept) {
        toast.success('Cotización aceptada. Tu pedido ha sido creado.');
      } else {
        toast.success('Cotización rechazada');
      }
      
      await fetchDesigns();
      return response;
    } catch (error) {
      handleError(error, 'Error al responder cotización');
    }
  }, [fetchDesigns]);

  // Obtener mis diseños (cliente)
  const getMyDesigns = useCallback(async (includeDetails = false) => {
    try {
      const response = await designService.getMyDesigns(includeDetails);
      if (response.success && Array.isArray(response.data?.designs)) {
        return response.data.designs.map(formatDesign);
      }
      return [];
    } catch (error) {
      console.error("Error obteniendo mis diseños:", error);
      return [];
    }
  }, []);

  // ==================== ESTADÍSTICAS Y ANÁLISIS ====================

  // Calcular estadísticas de diseños
  const getDesignStats = useCallback(() => {
    const total = designs.length;
    const pending = designs.filter(d => d.status === 'pending').length;
    const quoted = designs.filter(d => d.status === 'quoted').length;
    const approved = designs.filter(d => d.status === 'approved').length;
    const rejected = designs.filter(d => d.status === 'rejected').length;
    const completed = designs.filter(d => d.status === 'completed').length;
    
    const totalRevenue = designs
      .filter(d => d.price && ['approved', 'completed'].includes(d.status))
      .reduce((sum, d) => sum + d.price, 0);

    const avgPrice = quoted > 0 ? 
      designs.filter(d => d.price).reduce((sum, d) => sum + d.price, 0) / designs.filter(d => d.price).length :
      0;

    const avgProductionTime = designs.filter(d => d.productionDays).length > 0 ?
      designs.filter(d => d.productionDays).reduce((sum, d) => sum + d.productionDays, 0) / designs.filter(d => d.productionDays).length :
      0;

    // Diseños por complejidad
    const complexityStats = {
      low: designs.filter(d => d.complexity === 'low').length,
      medium: designs.filter(d => d.complexity === 'medium').length,
      high: designs.filter(d => d.complexity === 'high').length
    };

    // Top productos más diseñados
    const productStats = {};
    designs.forEach(design => {
      const productName = design.productName;
      if (productStats[productName]) {
        productStats[productName]++;
      } else {
        productStats[productName] = 1;
      }
    });

    const topProducts = Object.entries(productStats)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return { 
      total, 
      pending, 
      quoted, 
      approved, 
      rejected, 
      completed,
      totalRevenue,
      avgPrice,
      avgProductionTime,
      complexityStats,
      topProducts,
      conversionRate: total > 0 ? (approved / total) * 100 : 0,
      pendingQuotes: pending,
      activeQuotes: quoted
    };
  }, [designs]);

  // Filtrar diseños por criterios específicos
  const filterDesigns = useCallback((criteria) => {
    return designs.filter(design => {
      if (criteria.status && design.status !== criteria.status) return false;
      if (criteria.product && design.product?._id !== criteria.product) return false;
      if (criteria.user && design.user?._id !== criteria.user) return false;
      if (criteria.minPrice && (!design.price || design.price < criteria.minPrice)) return false;
      if (criteria.maxPrice && design.price && design.price > criteria.maxPrice) return false;
      if (criteria.complexity && design.complexity !== criteria.complexity) return false;
      
      if (criteria.search) {
        const searchTerm = criteria.search.toLowerCase();
        return design.name?.toLowerCase().includes(searchTerm) ||
               design.productName?.toLowerCase().includes(searchTerm) ||
               design.userName?.toLowerCase().includes(searchTerm);
      }
      
      return true;
    });
  }, [designs]);

  // ==================== EFECTOS ====================

  // Cargar diseños inicialmente
  useEffect(() => {
    fetchDesigns();
  }, []);

  return {
    // Estado
    designs,
    loading,
    error,
    pagination,

    // Funciones principales
    fetchDesigns,
    createDesign,
    saveDraft,
    updateDesign,
    cloneDesign,
    getDesignById,

    // Funciones de admin
    submitQuote,
    respondToQuote,
    getMyDesigns,

    // Análisis y estadísticas
    getDesignStats,
    filterDesigns,

    // Refrescar datos
    refetch: fetchDesigns
  };
};

// ==================== FUNCIONES AUXILIARES ====================

// Obtener texto del estado
const getStatusText = (status) => {
  const statusMap = {
    'draft': 'Borrador',
    'pending': 'Pendiente',
    'quoted': 'Cotizado',
    'approved': 'Aprobado',
    'rejected': 'Rechazado',
    'completed': 'Completado',
    'archived': 'Archivado'
  };
  return statusMap[status] || status;
};

// Obtener color del estado
const getStatusColor = (status) => {
  const colorMap = {
    'draft': 'gray',
    'pending': 'blue',
    'quoted': 'orange',
    'approved': 'green',
    'rejected': 'red',
    'completed': 'purple',
    'archived': 'gray'
  };
  return colorMap[status] || 'gray';
};

export default useDesigns;