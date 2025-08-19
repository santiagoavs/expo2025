// src/api/DesignService.js - SERVICIO DE DISEÑOS PARA USUARIOS PÚBLICOS
import apiClient from './apiClient';

class DesignService {
  // ==================== CRUD BÁSICO ====================
  
  /**
   * Crear nuevo diseño personalizado
   * @param {Object} designData - Datos del diseño
   * @returns {Promise} Respuesta del servidor
   */
  async create(designData) {
    try {
      console.log('🎨 [DesignService] Creando diseño:', designData);
      
      const response = await apiClient.post('/designs', designData);
      
      if (response.success) {
        console.log('✅ [DesignService] Diseño creado exitosamente');
      }
      
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error creando diseño:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Obtener diseño por ID
   * @param {string} id - ID del diseño
   * @returns {Promise} Diseño encontrado
   */
  async getById(id) {
    try {
      console.log('🔍 [DesignService] Obteniendo diseño por ID:', id);
      
      const response = await apiClient.get(`/designs/${id}`);
      
      if (response.success) {
        console.log('✅ [DesignService] Diseño obtenido exitosamente');
      }
      
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error obteniendo diseño:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar diseño existente (solo en estado draft)
   * @param {string} id - ID del diseño
   * @param {Object} designData - Datos actualizados
   * @returns {Promise} Respuesta del servidor
   */
  async update(id, designData) {
    try {
      console.log('✏️ [DesignService] Actualizando diseño:', { id, designData });
      
      const response = await apiClient.put(`/designs/${id}`, designData);
      
      if (response.success) {
        console.log('✅ [DesignService] Diseño actualizado exitosamente');
      }
      
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error actualizando diseño:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Actualizar color del producto en un diseño
   * @param {string} id - ID del diseño
   * @param {string} color - Color en formato hexadecimal
   * @returns {Promise} Respuesta del servidor
   */
  async updateProductColor(id, color) {
    try {
      console.log('🎨 [DesignService] Actualizando color del producto:', { id, color });
      
      const response = await apiClient.patch(`/designs/${id}/product-color`, { color });
      
      if (response.success) {
        console.log('✅ [DesignService] Color del producto actualizado');
      }
      
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error actualizando color:', error);
      throw this.handleError(error);
    }
  }

  // ==================== BORRADORES ====================

  /**
   * Guardar diseño como borrador
   * @param {Object} draftData - Datos del borrador
   * @returns {Promise} Respuesta del servidor
   */
  async saveDraft(draftData) {
    try {
      console.log('💾 [DesignService] Guardando borrador:', draftData);
      
      const response = await apiClient.post('/designs/draft', draftData);
      
      if (response.success) {
        console.log('✅ [DesignService] Borrador guardado exitosamente');
      }
      
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error guardando borrador:', error);
      throw this.handleError(error);
    }
  }

  // ==================== HISTORIAL Y GESTIÓN ====================

  /**
   * Obtener historial de diseños del usuario
   * @param {Object} options - Opciones de consulta
   * @returns {Promise} Lista de diseños
   */
  async getUserDesigns(options = {}) {
    try {
      console.log('📋 [DesignService] Obteniendo diseños del usuario:', options);
      
      const params = new URLSearchParams();
      
      if (options.includeDetails) params.append('includeDetails', 'true');
      if (options.limit) params.append('limit', options.limit.toString());
      
      const queryString = params.toString();
      const url = `/designs/my-designs${queryString ? `?${queryString}` : ''}`;
      
      const response = await apiClient.get(url);
      
      if (response.success) {
        console.log('✅ [DesignService] Diseños obtenidos:', response.data?.designs?.length || 0);
      }
      
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error obteniendo diseños del usuario:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Clonar/duplicar diseño
   * @param {string} id - ID del diseño a clonar
   * @param {Object} options - Opciones del clon
   * @returns {Promise} Diseño clonado
   */
  async clone(id, options = {}) {
    try {
      console.log('📋 [DesignService] Clonando diseño:', { id, options });
      
      const response = await apiClient.post(`/designs/${id}/clone`, options);
      
      if (response.success) {
        console.log('✅ [DesignService] Diseño clonado exitosamente');
      }
      
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error clonando diseño:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Cancelar diseño
   * @param {string} id - ID del diseño
   * @param {string} reason - Motivo de cancelación
   * @returns {Promise} Respuesta del servidor
   */
  async cancel(id, reason = '') {
    try {
      console.log('❌ [DesignService] Cancelando diseño:', { id, reason });
      
      const response = await apiClient.post(`/designs/${id}/cancel`, { reason });
      
      if (response.success) {
        console.log('✅ [DesignService] Diseño cancelado exitosamente');
      }
      
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error cancelando diseño:', error);
      throw this.handleError(error);
    }
  }

  // ==================== SISTEMA DE COTIZACIONES ====================

  /**
   * Responder a una cotización (aceptar o rechazar)
   * @param {string} id - ID del diseño
   * @param {boolean} accept - true para aceptar, false para rechazar
   * @param {string} clientNotes - Notas del cliente
   * @returns {Promise} Respuesta del servidor
   */
  async respondToQuote(id, accept, clientNotes = '') {
    try {
      console.log('📝 [DesignService] Respondiendo a cotización:', { id, accept, clientNotes });
      
      const response = await apiClient.post(`/designs/${id}/respond`, {
        accept,
        clientNotes
      });
      
      if (response.success) {
        const action = accept ? 'aceptada' : 'rechazada';
        console.log(`✅ [DesignService] Cotización ${action} exitosamente`);
      }
      
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error respondiendo a cotización:', error);
      throw this.handleError(error);
    }
  }

  // ==================== UTILIDADES DE VALIDACIÓN ====================

  /**
   * Validar datos de diseño antes de enviar
   * @param {Object} designData - Datos a validar
   * @returns {Object} Resultado de validación
   */
  validateDesignData(designData) {
    const errors = [];
    
    if (!designData.productId) {
      errors.push('Debe seleccionar un producto');
    }
    
    if (!designData.elements || !Array.isArray(designData.elements) || designData.elements.length === 0) {
      errors.push('Debe agregar al menos un elemento al diseño');
    }
    
    if (designData.elements) {
      designData.elements.forEach((element, index) => {
        if (!element.type) {
          errors.push(`Elemento ${index + 1}: tipo no definido`);
        }
        
        if (!element.konvaAttrs) {
          errors.push(`Elemento ${index + 1}: atributos no definidos`);
        }
        
        if (element.type === 'text' && (!element.konvaAttrs?.text || !element.konvaAttrs.text.trim())) {
          errors.push(`Elemento de texto ${index + 1}: texto vacío`);
        }
        
        if (element.type === 'image' && !element.konvaAttrs?.image) {
          errors.push(`Elemento de imagen ${index + 1}: URL de imagen no definida`);
        }
      });
    }
    
    if (designData.clientNotes && designData.clientNotes.length > 1000) {
      errors.push('Las notas no pueden exceder 1000 caracteres');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Formatear diseño para mostrar en la UI
   * @param {Object} design - Diseño raw del backend
   * @returns {Object} Diseño formateado
   */
  formatDesign(design) {
    if (!design || typeof design !== 'object') {
      return null;
    }
    
    try {
      const formatted = {
        id: design._id || design.id,
        name: design.name || 'Diseño sin nombre',
        status: design.status || 'draft',
        price: design.price || 0,
        formattedPrice: design.price ? `$${design.price.toFixed(2)}` : 'Pendiente',
        productionDays: design.productionDays || 0,
        createdAt: design.createdAt ? new Date(design.createdAt) : new Date(),
        updatedAt: design.updatedAt ? new Date(design.updatedAt) : new Date(),
        quotedAt: design.quotedAt ? new Date(design.quotedAt) : null,
        approvedAt: design.approvedAt ? new Date(design.approvedAt) : null,
        rejectedAt: design.rejectedAt ? new Date(design.rejectedAt) : null,
        
        // Información del producto
        product: design.product ? {
          id: design.product._id || design.product.id,
          name: design.product.name || 'Producto desconocido',
          image: design.product.images?.main || design.product.mainImage || null,
          customizationAreas: design.product.customizationAreas || [],
          options: design.product.options || []
        } : null,
        
        // Elementos del diseño
        elements: Array.isArray(design.elements) ? design.elements : [],
        productOptions: Array.isArray(design.productOptions) ? design.productOptions : [],
        productColorFilter: design.productColorFilter || null,
        
        // Notas
        clientNotes: design.clientNotes || '',
        adminNotes: design.adminNotes || '',
        rejectionReason: design.rejectionReason || '',
        
        // Metadatos
        metadata: design.metadata || {},
        complexity: design.metadata?.complexity || 'medium',
        
        // Estados calculados
        canEdit: ['draft', 'pending'].includes(design.status),
        canCancel: ['pending', 'quoted'].includes(design.status),
        canRespond: design.status === 'quoted',
        isCompleted: design.status === 'completed',
        needsResponse: design.status === 'quoted',
        
        // Vista previa
        previewImage: design.previewImage || null
      };
      
      return formatted;
    } catch (error) {
      console.error('❌ [DesignService] Error formateando diseño:', error);
      return null;
    }
  }

  // ==================== UTILIDADES KONVA ====================

  /**
   * Preparar diseño para el editor Konva
   * @param {Object} design - Diseño a preparar
   * @returns {Object} Configuración para Konva
   */
  prepareForKonvaEditor(design) {
    if (!design) return null;
    
    try {
      return {
        elements: Array.isArray(design.elements) ? design.elements.map(el => ({
          ...el,
          id: el.id || `elem-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
        })) : [],
        productColorFilter: design.productColorFilter || '#ffffff'
      };
    } catch (error) {
      console.error('❌ [DesignService] Error preparando para Konva:', error);
      return null;
    }
  }

  /**
   * Convertir datos de Konva a formato backend
   * @param {Array} elements - Elementos de Konva
   * @param {string} productColorFilter - Color del producto
   * @returns {Object} Datos formateados para backend
   */
  prepareFromKonvaEditor(elements, productColorFilter) {
    try {
      const processedElements = elements.map(el => ({
        type: el.type,
        areaId: el.areaId,
        konvaAttrs: {
          ...el.konvaAttrs,
          // Remover propiedades que no necesita el backend
          id: undefined,
          draggable: undefined
        }
      }));
      
      return {
        elements: processedElements,
        productColorFilter: productColorFilter !== '#ffffff' ? productColorFilter : null
      };
    } catch (error) {
      console.error('❌ [DesignService] Error convirtiendo desde Konva:', error);
      return null;
    }
  }

  // ==================== TEXTOS Y ESTADOS ====================

  /**
   * Obtener texto descriptivo del estado
   * @param {string} status - Estado del diseño
   * @returns {string} Texto descriptivo
   */
  getStatusText(status) {
    const statusMap = {
      'draft': 'Borrador',
      'pending': 'Pendiente de cotización',
      'quoted': 'Cotizado - Pendiente respuesta',
      'approved': 'Aprobado - En producción',
      'rejected': 'Rechazado',
      'completed': 'Completado',
      'cancelled': 'Cancelado',
      'archived': 'Archivado'
    };
    
    return statusMap[status] || 'Estado desconocido';
  }

  /**
   * Obtener color para el estado
   * @param {string} status - Estado del diseño
   * @returns {string} Color CSS
   */
  getStatusColor(status) {
    const colorMap = {
      'draft': '#6B7280',
      'pending': '#F59E0B',
      'quoted': '#3B82F6',
      'approved': '#10B981',
      'rejected': '#EF4444',
      'completed': '#059669',
      'cancelled': '#6B7280',
      'archived': '#9CA3AF'
    };
    
    return colorMap[status] || '#6B7280';
  }

  // ==================== MANEJO DE ERRORES ====================

  /**
   * Manejar errores de manera consistente
   * @param {Error} error - Error capturado
   * @returns {Error} Error procesado
   */
  handleError(error) {
    let message = 'Error en operación de diseños';
    
    if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.message) {
      message = error.message;
    }
    
    // Crear error personalizado
    const processedError = new Error(message);
    processedError.status = error?.response?.status;
    processedError.code = error?.response?.data?.error;
    processedError.originalError = error;
    
    return processedError;
  }
}

// Exportar instancia única
export default new DesignService();