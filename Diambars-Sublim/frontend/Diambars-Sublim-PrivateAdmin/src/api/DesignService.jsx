// src/api/DesignService.js
import apiClient from './ApiClient';

const BASE_URL = '/designs';

export default {
  // ==================== OBTENER DISEÑOS ====================
  
  // Obtener todos los diseños con filtros avanzados
  getAll: async (params = {}) => {
    const {
      page = 1,
      limit = 12,
      status,
      product,
      user,
      search,
      sort = 'createdAt',
      order = 'desc'
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    if (status) queryParams.append('status', status);
    if (product) queryParams.append('product', product);
    if (user) queryParams.append('user', user);
    if (search) queryParams.append('search', search);
    if (sort) queryParams.append('sort', sort);
    if (order) queryParams.append('order', order);

    const response = await apiClient.get(`${BASE_URL}?${queryParams}`);
    return response;
  },

  // Obtener diseño por ID con configuración completa
  getById: async (id) => {
    const response = await apiClient.get(`${BASE_URL}/${id}`);
    return response;
  },

  // Obtener historial de diseños del usuario
  getUserDesignHistory: async (includeDetails = false) => {
    const queryParams = new URLSearchParams();
    if (includeDetails) queryParams.append('includeDetails', 'true');
    
    const response = await apiClient.get(`${BASE_URL}/my-designs?${queryParams}`);
    return response;
  },

  // ==================== CREAR Y ACTUALIZAR DISEÑOS ====================
  
  // Crear nuevo diseño personalizado
  create: async (designData) => {
    const payload = {
      productId: designData.productId,
      elements: designData.elements || [],
      productOptions: designData.productOptions || [],
      clientNotes: designData.clientNotes || "",
      mode: designData.mode || 'simple'
    };

    // Validar elementos antes de enviar
    const validation = validateDesignElements(payload.elements);
    if (!validation.isValid) {
      throw new Error(`Elementos inválidos: ${validation.errors.join(', ')}`);
    }

    const response = await apiClient.post(BASE_URL, payload);
    return response;
  },

  // Actualizar diseño existente (solo en estado draft)
  update: async (id, designData) => {
    const payload = {};
    
    if (designData.elements) payload.elements = designData.elements;
    if (designData.productOptions) payload.productOptions = designData.productOptions;
    if (designData.name) payload.name = designData.name;
    if (designData.clientNotes !== undefined) payload.clientNotes = designData.clientNotes;

    const response = await apiClient.put(`${BASE_URL}/${id}`, payload);
    return response;
  },

  // Guardar diseño como borrador
  saveDraft: async (designData) => {
    const payload = {
      productId: designData.productId,
      elements: designData.elements || [],
      productOptions: designData.productOptions || [],
      name: designData.name || `Borrador - ${new Date().toLocaleDateString()}`,
      clientNotes: designData.clientNotes || ""
    };

    const response = await apiClient.post(`${BASE_URL}/draft`, payload);
    return response;
  },

  // Clonar/duplicar diseño existente
  clone: async (designId, newName) => {
    const payload = {};
    if (newName) payload.name = newName;

    const response = await apiClient.post(`${BASE_URL}/${designId}/clone`, payload);
    return response;
  },

  // ==================== GESTIÓN DE COTIZACIONES ====================
  
  // Cotizar diseño (admin/manager)
  submitQuote: async (designId, quoteData) => {
    const { price, productionDays, adminNotes } = quoteData;
    
    if (!price || price <= 0) {
      throw new Error('El precio debe ser mayor que cero');
    }
    
    if (!productionDays || productionDays <= 0) {
      throw new Error('Los días de producción deben ser mayor que cero');
    }

    const payload = {
      price: parseFloat(price),
      productionDays: parseInt(productionDays),
      adminNotes: adminNotes || ""
    };

    const response = await apiClient.post(`${BASE_URL}/${designId}/quote`, payload);
    return response;
  },

  // Responder a cotización (cliente)
  respondToQuote: async (designId, response) => {
    const { accept, clientNotes } = response;
    
    if (typeof accept !== 'boolean') {
      throw new Error('Debe especificar si acepta o rechaza la cotización');
    }

    const payload = {
      accept,
      clientNotes: clientNotes || ""
    };

    const responseData = await apiClient.post(`${BASE_URL}/${designId}/respond`, payload);
    return responseData;
  },

  // ==================== EDITOR KONVA ====================
  
  // Obtener configuración Konva para editar diseño
  getKonvaConfig: async (designId) => {
    const response = await apiClient.get(`${BASE_URL}/${designId}/konva-config`);
    return response;
  },

  // Guardar elementos de Konva
  saveKonvaElements: async (designId, konvaData) => {
    const elements = convertKonvaToElements(konvaData);
    
    const payload = {
      elements,
      konvaJSON: JSON.stringify(konvaData)
    };

    const response = await apiClient.put(`${BASE_URL}/${designId}/elements`, payload);
    return response;
  },

  // Generar vista previa del diseño
  generatePreview: async (designId) => {
    const response = await apiClient.post(`${BASE_URL}/${designId}/generate-preview`);
    return response;
  },

  // ==================== BÚSQUEDA Y FILTROS ====================
  
  // Buscar diseños
  search: async (query, filters = {}) => {
    if (!query || query.trim().length < 2) {
      return { success: true, data: { designs: [] } };
    }

    const queryParams = new URLSearchParams({
      q: query.trim(),
      ...filters
    });

    const response = await apiClient.get(`${BASE_URL}/search?${queryParams}`);
    return response;
  },

  // Filtrar diseños por estado
  getByStatus: async (status, params = {}) => {
    const validStatuses = ['draft', 'pending', 'quoted', 'approved', 'rejected', 'completed', 'archived'];
    
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido. Estados válidos: ${validStatuses.join(', ')}`);
    }

    return await this.getAll({ ...params, status });
  },

  // ==================== VALIDACIONES Y UTILIDADES ====================
  
  // Validar datos del diseño
  validateDesignData: (designData) => {
    const errors = [];

    if (!designData.productId) {
      errors.push('ID de producto requerido');
    }

    if (!designData.elements || !Array.isArray(designData.elements) || designData.elements.length === 0) {
      errors.push('Debe incluir al menos un elemento de diseño');
    }

    // Validar elementos individuales
    if (designData.elements) {
      designData.elements.forEach((element, index) => {
        if (!element.type) {
          errors.push(`Elemento ${index + 1}: Tipo requerido`);
        }
        
        if (!element.areaId) {
          errors.push(`Elemento ${index + 1}: ID de área requerido`);
        }
        
        if (!element.konvaAttrs) {
          errors.push(`Elemento ${index + 1}: Atributos Konva requeridos`);
        }
      });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Formatear diseño para mostrar en UI
  formatDesign: (design) => {
    return {
      ...design,
      id: design._id || design.id,
      statusText: getStatusText(design.status),
      statusColor: getStatusColor(design.status),
      formattedPrice: design.price ? `${design.price.toFixed(2)}` : 'Sin cotizar',
      elementCount: design.elements?.length || 0,
      canEdit: ['draft', 'pending'].includes(design.status),
      canRespond: design.status === 'quoted',
      productName: design.product?.name || 'Producto eliminado',
      productImage: design.product?.images?.main || null,
      createdDate: design.createdAt ? new Date(design.createdAt).toLocaleDateString() : null,
      lastUpdated: design.updatedAt ? new Date(design.updatedAt).toLocaleDateString() : null,
      estimatedCompletion: design.productionDays ? `${design.productionDays} días` : null
    };
  },

  // ==================== FUNCIONES KONVA ESPECÍFICAS ====================
  
  // Convertir elementos a formato Konva
  prepareForKonvaEditor: (design) => {
    if (!design.elements) return null;

    return {
      designId: design._id,
      productId: design.product._id,
      productName: design.product.name,
      backgroundImage: design.product.images?.main,
      stageConfig: {
        width: 800,
        height: 600,
        container: 'design-editor-container'
      },
      elements: design.elements.map(element => ({
        id: element._id || `element-${Date.now()}-${Math.random()}`,
        type: element.type,
        areaId: element.areaId,
        ...element.konvaAttrs,
        // Asegurar propiedades específicas por tipo
        ...(element.type === 'text' && {
          text: element.konvaAttrs.text || 'Texto',
          fontFamily: element.konvaAttrs.fontFamily || 'Arial',
          fontSize: element.konvaAttrs.fontSize || 16,
          fill: element.konvaAttrs.fill || '#000000'
        }),
        ...(element.type === 'image' && {
          image: element.konvaAttrs.image,
          crop: element.konvaAttrs.crop
        })
      })),
      areas: design.product.customizationAreas?.map(area => ({
        id: area._id,
        name: area.name,
        displayName: area.displayName,
        x: area.position.x,
        y: area.position.y,
        width: area.position.width,
        height: area.position.height,
        rotation: area.position.rotationDegree || 0,
        accepts: area.accepts,
        maxElements: area.maxElements || 10,
        stroke: area.konvaConfig?.strokeColor || '#06AED5',
        strokeWidth: area.konvaConfig?.strokeWidth || 2,
        fillOpacity: area.konvaConfig?.fillOpacity || 0.1
      })) || []
    };
  },

  // Convertir datos de Konva a elementos de diseño
  prepareFromKonvaEditor: (konvaData) => {
    if (!konvaData.elements) return [];

    return konvaData.elements.map(element => ({
      type: element.type,
      areaId: element.areaId,
      konvaAttrs: {
        // Propiedades básicas de transformación
        x: element.x || 0,
        y: element.y || 0,
        width: element.width,
        height: element.height,
        rotation: element.rotation || 0,
        scaleX: element.scaleX || 1,
        scaleY: element.scaleY || 1,
        skewX: element.skewX || 0,
        skewY: element.skewY || 0,
        offsetX: element.offsetX || 0,
        offsetY: element.offsetY || 0,
        
        // Propiedades visuales
        opacity: element.opacity || 1,
        visible: element.visible !== false,
        draggable: false,
        listening: true,
        
        // Propiedades específicas por tipo
        ...(element.type === 'text' && {
          text: element.text || '',
          fontFamily: element.fontFamily || 'Arial',
          fontSize: element.fontSize || 16,
          fontStyle: element.fontStyle || 'normal',
          textDecoration: element.textDecoration || '',
          align: element.align || 'left',
          verticalAlign: element.verticalAlign || 'top',
          padding: element.padding || 0,
          lineHeight: element.lineHeight || 1,
          letterSpacing: element.letterSpacing || 0,
          wrap: element.wrap || 'word',
          ellipsis: element.ellipsis || false
        }),
        
        ...(element.type === 'image' && {
          image: element.image,
          crop: element.crop
        }),
        
        // Colores y bordes
        fill: element.fill,
        stroke: element.stroke,
        strokeWidth: element.strokeWidth || 0,
        strokeScaleEnabled: element.strokeScaleEnabled !== false,
        dash: element.dash,
        dashOffset: element.dashOffset || 0,
        lineJoin: element.lineJoin || 'miter',
        lineCap: element.lineCap || 'butt',
        
        // Sombras
        shadowColor: element.shadowColor,
        shadowBlur: element.shadowBlur || 0,
        shadowOffset: element.shadowOffset || { x: 0, y: 0 },
        shadowOpacity: element.shadowOpacity || 1,
        shadowEnabled: element.shadowEnabled || false,
        
        // Filtros
        filters: element.filters || [],
        blurRadius: element.blurRadius || 10,
        brightness: element.brightness || 0,
        contrast: element.contrast || 0,
        
        // Otros
        cornerRadius: element.cornerRadius || 0,
        perfectDrawEnabled: element.perfectDrawEnabled !== false,
        globalCompositeOperation: element.globalCompositeOperation || 'source-over'
      },
      
      // Metadata adicional
      metadata: {
        originalFileName: element.originalFileName,
        fileSize: element.fileSize,
        mimeType: element.mimeType,
        uploadedAt: element.uploadedAt,
        source: element.source || 'editor',
        tags: element.tags || [],
        userNotes: element.userNotes || ''
      },
      
      isLocked: element.isLocked || false,
      zIndex: element.zIndex || 1
    }));
  },

  // ==================== ESTADÍSTICAS ====================
  
  // Obtener estadísticas de diseños
  getStats: async (params = {}) => {
    const queryParams = new URLSearchParams(params);
    const response = await apiClient.get(`${BASE_URL}/stats?${queryParams}`);
    return response;
  },

  // Obtener diseños más populares
  getPopular: async (limit = 10) => {
    const response = await apiClient.get(`${BASE_URL}/popular?limit=${limit}`);
    return response;
  },

  // ==================== EXPORTACIÓN E IMPORTACIÓN ====================
  
  // Exportar diseño en diferentes formatos
  exportDesign: async (designId, format = 'json') => {
    const validFormats = ['json', 'pdf', 'png', 'svg'];
    
    if (!validFormats.includes(format)) {
      throw new Error(`Formato inválido. Formatos válidos: ${validFormats.join(', ')}`);
    }

    const response = await apiClient.get(`${BASE_URL}/${designId}/export?format=${format}`, {
      responseType: format === 'json' ? 'json' : 'blob'
    });
    return response;
  },

  // Importar elementos desde archivo
  importElements: async (designId, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`${BASE_URL}/${designId}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response;
  },

  // ==================== COLABORACIÓN ====================
  
  // Compartir diseño con otro usuario
  shareDesign: async (designId, shareData) => {
    const payload = {
      email: shareData.email,
      permissions: shareData.permissions || 'view', // view, edit, comment
      message: shareData.message || ""
    };

    const response = await apiClient.post(`${BASE_URL}/${designId}/share`, payload);
    return response;
  },

  // Obtener colaboradores de un diseño
  getCollaborators: async (designId) => {
    const response = await apiClient.get(`${BASE_URL}/${designId}/collaborators`);
    return response;
  },

  // ==================== COMENTARIOS ====================
  
  // Agregar comentario a un diseño
  addComment: async (designId, comment) => {
    const payload = {
      comment: comment.text,
      elementId: comment.elementId, // Si el comentario es sobre un elemento específico
      position: comment.position // Posición en el canvas si aplica
    };

    const response = await apiClient.post(`${BASE_URL}/${designId}/comments`, payload);
    return response;
  },

  // Obtener comentarios de un diseño
  getComments: async (designId) => {
    const response = await apiClient.get(`${BASE_URL}/${designId}/comments`);
    return response;
  },

  // ==================== VERSIONES ====================
  
  // Obtener historial de versiones
  getVersionHistory: async (designId) => {
    const response = await apiClient.get(`${BASE_URL}/${designId}/versions`);
    return response;
  },

  // Restaurar versión específica
  restoreVersion: async (designId, versionId) => {
    const response = await apiClient.post(`${BASE_URL}/${designId}/versions/${versionId}/restore`);
    return response;
  }
};

// ==================== FUNCIONES AUXILIARES ====================

// Obtener texto del estado
function getStatusText(status) {
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
}

// Obtener color del estado
function getStatusColor(status) {
  const colorMap = {
    'draft': 'gray',
    'pending': 'yellow',
    'quoted': 'blue',
    'approved': 'green',
    'rejected': 'red',
    'completed': 'purple',
    'archived': 'gray'
  };
  return colorMap[status] || 'gray';
}

// Validar elementos de diseño
function validateDesignElements(elements) {
  const errors = [];
  
  if (!Array.isArray(elements) || elements.length === 0) {
    return {
      isValid: false,
      errors: ['Debe incluir al menos un elemento de diseño']
    };
  }
  
  elements.forEach((element, index) => {
    if (!element.type) {
      errors.push(`Elemento ${index + 1}: Tipo requerido`);
    }
    
    if (!element.areaId) {
      errors.push(`Elemento ${index + 1}: ID de área requerido`);
    }
    
    if (!element.konvaAttrs) {
      errors.push(`Elemento ${index + 1}: Atributos Konva requeridos`);
    } else {
      // Validaciones específicas por tipo
      if (element.type === 'text' && !element.konvaAttrs.text) {
        errors.push(`Elemento ${index + 1}: Texto requerido`);
      }
      
      if (element.type === 'image' && !element.konvaAttrs.image) {
        errors.push(`Elemento ${index + 1}: Imagen requerida`);
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Convertir datos de Konva a elementos (función auxiliar)
function convertKonvaToElements(konvaData) {
  // Esta función se implementaría según la estructura específica de Konva
  // Por ahora retornamos los elementos tal como vienen
  return konvaData.elements || [];
}