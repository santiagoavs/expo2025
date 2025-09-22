// src/api/DesignService.js - SERVICIO COMPLETO PARA DISEÑOS ADMIN CORREGIDO
import apiClient from './ApiClient';

const BASE_URL = '/designs';

const DesignService = {
  // ==================== OBTENER DISEÑOS ====================
  
  /**
   * Obtener todos los diseños con filtros avanzados (Admin)
   * @param {Object} params - Parámetros de filtrado y paginación
   * @returns {Promise} Respuesta con diseños paginados
   */
  getAll: async (params = {}) => {
    try {
      const {
        page = 1,
        limit = 12,
        status,      // 'pending', 'quoted', 'approved', 'rejected', 'draft'
        product,     // ID del producto
        user,        // ID del usuario/cliente
        search,      // Búsqueda por nombre
        sort = 'createdAt',
        order = 'desc'
      } = params;

      console.log('🎨 [DesignService] Obteniendo diseños con params:', params);

      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', limit.toString());
      queryParams.append('sort', sort);
      queryParams.append('order', order);
      
      if (status && status.trim() !== '') queryParams.append('status', status);
      if (product && product.trim() !== '') queryParams.append('product', product);
      if (user && user.trim() !== '') queryParams.append('user', user);
      if (search && search.trim() !== '') queryParams.append('search', search.trim());

      const url = `${BASE_URL}?${queryParams.toString()}`;
      console.log('📡 [DesignService] URL final:', url);

      const response = await apiClient.get(url);
      
      console.log('✅ [DesignService] Diseños obtenidos:', {
        total: response.data?.designs?.length || 0,
        pagination: response.data?.pagination
      });
      
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error obteniendo diseños:', error);
      throw error;
    }
  },

  /**
   * Obtener diseño específico por ID
   * @param {string} id - ID del diseño
   * @returns {Promise} Respuesta con datos del diseño
   */
  getById: async (id) => {
    try {
      console.log('🔍 [DesignService] Obteniendo diseño por ID:', id);
      
      if (!id) {
        throw new Error('ID de diseño requerido');
      }

      const response = await apiClient.get(`${BASE_URL}/${id}`);
      console.log('✅ [DesignService] Diseño obtenido:', response);
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error obteniendo diseño:', error);
      throw error;
    }
  },

  /**
   * Obtener historial de diseños de un usuario específico
   * @param {string} userId - ID del usuario
   * @param {Object} options - Opciones adicionales
   * @returns {Promise} Respuesta con diseños del usuario
   */
  getUserDesigns: async (userId, options = {}) => {
    try {
      console.log('👤 [DesignService] Obteniendo diseños del usuario:', userId);
      
      if (!userId) {
        throw new Error('ID de usuario requerido');
      }

      const { includeDetails = false, limit = 20 } = options;
      
      const queryParams = new URLSearchParams();
      if (includeDetails) queryParams.append('includeDetails', 'true');
      queryParams.append('limit', limit.toString());

      const url = queryParams.toString() 
        ? `${BASE_URL}/my-designs?${queryParams}&user=${userId}`
        : `${BASE_URL}/my-designs?user=${userId}`;

      const response = await apiClient.get(url);
      console.log('✅ [DesignService] Diseños del usuario obtenidos:', response);
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error obteniendo diseños del usuario:', error);
      throw error;
    }
  },

  // ==================== CREAR Y GESTIONAR DISEÑOS ====================

  /**
   * Crear diseño para un cliente (Admin) - CORREGIDO
   * @param {Object} designData - Datos del diseño
   * @returns {Promise} Respuesta con diseño creado
   */
  createForClient: async (designData) => {
    try {
      console.log('🆕 [DesignService] Creando diseño para cliente:', designData);

      // Validación básica
      if (!designData.productId) {
        throw new Error('ID del producto es requerido');
      }
      
      if (!designData.userId) {
        throw new Error('ID del cliente es requerido');
      }
      
      if (!designData.elements || !Array.isArray(designData.elements) || designData.elements.length === 0) {
        throw new Error('Debe incluir al menos un elemento en el diseño');
      }

      // Validar y normalizar elementos antes del envío
      const validationResult = DesignService.validateElementsForSubmission(designData.elements);
      if (!validationResult.isValid) {
        throw new Error(`Elementos inválidos: ${validationResult.errors.join('; ')}`);
      }

      // Normalizar elementos para asegurar formato correcto
      const normalizedElements = DesignService.normalizeElementsArray(designData.elements);
      
      // Asignar área de personalización automáticamente si no está presente
      const elementsWithAreas = DesignService.assignDefaultAreas(normalizedElements, designData.productId);

      // Preparar datos para envío - FORMATO CORREGIDO
      const payload = {
        userId: designData.userId, // Campo específico para admin
        productId: designData.productId,
        name: designData.name || `Diseño personalizado - ${new Date().toLocaleDateString()}`,
        elements: elementsWithAreas,
        productOptions: designData.productOptions || [],
        clientNotes: designData.clientNotes || '',
        mode: designData.mode || 'simple',
        productColorFilter: designData.productColorFilter || null
      };

      console.log('📤 [DesignService] Payload preparado:', payload);

      // Usar el endpoint específico para admin
      const response = await apiClient.post(`${BASE_URL}/admin/create-for-client`, payload);
      
      console.log('✅ [DesignService] Diseño creado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error creando diseño:', error);
      throw error;
    }
  },

  /**
   * Actualizar diseño existente (solo en estado draft)
   * @param {string} id - ID del diseño
   * @param {Object} designData - Datos actualizados
   * @returns {Promise} Respuesta con diseño actualizado
   */
  update: async (id, designData) => {
    try {
      console.log('✏️ [DesignService] Actualizando diseño:', { id, designData });

      if (!id) {
        throw new Error('ID de diseño requerido para actualización');
      }

      // Filtrar solo campos permitidos para actualización
      const allowedFields = ['elements', 'productOptions', 'clientNotes', 'name'];
      const payload = {};
      
      allowedFields.forEach(field => {
        if (designData[field] !== undefined) {
          payload[field] = designData[field];
        }
      });

      console.log('📤 [DesignService] Payload para actualización:', payload);

      const response = await apiClient.put(`${BASE_URL}/${id}`, payload);
      console.log('✅ [DesignService] Diseño actualizado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error actualizando diseño:', error);
      throw error;
    }
  },

  /**
 * Actualizar color del producto en un diseño
 * @param {string} id - ID del diseño
 * @param {string} color - Color en formato hexadecimal
 * @returns {Promise} Respuesta con diseño actualizado
 */
updateProductColor: async (id, color) => {
  try {
    console.log('🎨 [DesignService] Actualizando color del producto:', { id, color });
    
    if (!id) {
      throw new Error('ID de diseño requerido');
    }

    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      throw new Error('El color debe estar en formato hexadecimal (#RRGGBB)');
    }

    const payload = {
      color: color || null
    };

    const response = await apiClient.patch(`${BASE_URL}/${id}/product-color`, payload);
    console.log('✅ [DesignService] Color del producto actualizado:', response);
    return response;
  } catch (error) {
    console.error('❌ [DesignService] Error actualizando color del producto:', error);
    throw error;
  }
},

  /**
   * Clonar diseño existente
   * @param {string} id - ID del diseño a clonar
   * @param {Object} options - Opciones de clonación
   * @returns {Promise} Respuesta con diseño clonado
   */
  clone: async (id, options = {}) => {
    try {
      console.log('📋 [DesignService] Clonando diseño:', { id, options });
      
      if (!id) {
        throw new Error('ID de diseño requerido para clonar');
      }

      const payload = {
        name: options.name || undefined
      };

      const response = await apiClient.post(`${BASE_URL}/${id}/clone`, payload);
      console.log('✅ [DesignService] Diseño clonado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error clonando diseño:', error);
      throw error;
    }
  },

  /**
   * Guardar diseño como borrador
   * @param {Object} designData - Datos del borrador
   * @returns {Promise} Respuesta con borrador guardado
   */
  saveDraft: async (designData) => {
    try {
      console.log('💾 [DesignService] Guardando borrador:', designData);

      if (!designData.productId) {
        throw new Error('ID del producto es requerido');
      }

      const payload = {
        productId: designData.productId,
        elements: designData.elements || [],
        productOptions: designData.productOptions || [],
        name: designData.name || 'Borrador de diseño',
        clientNotes: designData.clientNotes || '',
        userId: designData.userId || undefined // Para diseños admin
      };

      const response = await apiClient.post(`${BASE_URL}/draft`, payload);
      console.log('✅ [DesignService] Borrador guardado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error guardando borrador:', error);
      throw error;
    }
  },

  // ==================== SISTEMA DE COTIZACIONES ====================

  /**
   * Enviar cotización para un diseño (Admin)
   * @param {string} id - ID del diseño
   * @param {Object} quoteData - Datos de la cotización
   * @returns {Promise} Respuesta con cotización enviada
   */
  submitQuote: async (id, quoteData) => {
    try {
      console.log('💰 [DesignService] Enviando cotización:', { id, quoteData });
      
      if (!id) {
        throw new Error('ID de diseño requerido');
      }

      // Validar datos de cotización
      if (!quoteData.price || quoteData.price <= 0) {
        throw new Error('El precio debe ser mayor que 0');
      }
      
      if (!quoteData.productionDays || quoteData.productionDays < 1) {
        throw new Error('Los días de producción deben ser al menos 1');
      }

      const payload = {
        price: parseFloat(quoteData.price),
        productionDays: parseInt(quoteData.productionDays),
        adminNotes: quoteData.adminNotes || ''
      };

      console.log('📤 [DesignService] Payload de cotización:', payload);

      const response = await apiClient.post(`${BASE_URL}/${id}/quote`, payload);
      console.log('✅ [DesignService] Cotización enviada exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error enviando cotización:', error);
      throw error;
    }
  },

  /**
   * Responder a cotización como cliente (Solo para testing admin)
   * @param {string} id - ID del diseño
   * @param {Object} responseData - Respuesta del cliente
   * @returns {Promise} Respuesta procesada
   */
  respondToQuote: async (id, responseData) => {
    try {
      console.log('📝 [DesignService] Respondiendo a cotización:', { id, responseData });
      
      if (!id) {
        throw new Error('ID de diseño requerido');
      }

      if (typeof responseData.accept !== 'boolean') {
        throw new Error('Debe especificar si acepta o rechaza la cotización');
      }

      const payload = {
        accept: responseData.accept,
        clientNotes: responseData.clientNotes || ''
      };

      const response = await apiClient.post(`${BASE_URL}/${id}/respond`, payload);
      console.log('✅ [DesignService] Respuesta a cotización procesada:', response);
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error respondiendo a cotización:', error);
      throw error;
    }
  },

  // ==================== GESTIÓN DE ESTADOS ====================

  /**
   * Cambiar estado de un diseño (Admin)
   * @param {string} id - ID del diseño
   * @param {string} newStatus - Nuevo estado
   * @param {string} notes - Notas del cambio
   * @returns {Promise} Respuesta con estado actualizado
   */
  changeStatus: async (id, newStatus, notes = '') => {
    try {
      console.log('🔄 [DesignService] Cambiando estado:', { id, newStatus, notes });
      
      if (!id) {
        throw new Error('ID de diseño requerido');
      }

      const validStatuses = ['draft', 'pending', 'quoted', 'approved', 'rejected', 'completed', 'archived'];
      if (!validStatuses.includes(newStatus)) {
        throw new Error(`Estado inválido. Estados válidos: ${validStatuses.join(', ')}`);
      }

      const payload = {
        status: newStatus,
        notes: notes
      };

      const response = await apiClient.patch(`${BASE_URL}/${id}/status`, payload);
      console.log('✅ [DesignService] Estado cambiado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error cambiando estado:', error);
      throw error;
    }
  },

  /**
   * Cancelar diseño
   * @param {string} id - ID del diseño
   * @param {string} reason - Razón de cancelación
   * @returns {Promise} Respuesta con diseño cancelado
   */
  cancel: async (id, reason = '') => {
    try {
      console.log('❌ [DesignService] Cancelando diseño:', { id, reason });
      
      if (!id) {
        throw new Error('ID de diseño requerido');
      }

      const payload = {
        reason: reason
      };

      const response = await apiClient.post(`${BASE_URL}/${id}/cancel`, payload);
      console.log('✅ [DesignService] Diseño cancelado exitosamente:', response);
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error cancelando diseño:', error);
      throw error;
    }
  },

  // ==================== UTILIDADES ====================

  /**
   * Formatear diseño para mostrar en UI
   * @param {Object} design - Datos del diseño
   * @returns {Object} Diseño formateado
   */
  formatDesign: (design) => {
    if (!design || typeof design !== 'object') {
      return null;
    }

    const safeDesign = {
      ...design,
      id: design._id || design.id,
      name: design.name || 'Diseño sin nombre',
      status: design.status || 'draft',
      price: design.price || 0,
      productionDays: design.productionDays || 0,
      elementsCount: Array.isArray(design.elements) ? design.elements.length : 0,
      hasPreview: !!design.previewImage,
      canEdit: ['draft', 'pending'].includes(design.status),
      canQuote: design.status === 'pending',
      canApprove: design.status === 'quoted',
      
      // Información del cliente
      clientName: design.user?.name || 'Cliente desconocido',
      clientEmail: design.user?.email || '',
      
      // Información del producto
      productName: design.product?.name || 'Producto desconocido',
      productImage: design.product?.images?.main || null,
      basePrice: design.product?.basePrice || 0,
      
      // Fechas formateadas
      createdDate: design.createdAt ? new Date(design.createdAt).toLocaleDateString() : null,
      updatedDate: design.updatedAt ? new Date(design.updatedAt).toLocaleDateString() : null,
      quotedDate: design.quotedAt ? new Date(design.quotedAt).toLocaleDateString() : null,
      approvedDate: design.approvedAt ? new Date(design.approvedAt).toLocaleDateString() : null,
      
      // Estado formateado
      statusText: DesignService.getStatusText(design.status),
      statusColor: DesignService.getStatusColor(design.status),
      
      // Precio formateado
      formattedPrice: design.price ? new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: 'USD'
      }).format(design.price) : '$0.00',
      
      // Tiempo desde creación
      daysAgo: design.createdAt ? DesignService.calculateDaysAgo(design.createdAt) : 0,
      
      // Complejidad del diseño
      complexity: DesignService.calculateComplexity(design.elements || [])
    };

    return safeDesign;
  },

  /**
   * Obtener texto del estado
   * @param {string} status - Estado del diseño
   * @returns {string} Texto legible del estado
   */
  getStatusText: (status) => {
    const statusMap = {
      'draft': 'Borrador',
      'pending': 'Pendiente',
      'quoted': 'Cotizado',
      'approved': 'Aprobado',
      'rejected': 'Rechazado',
      'completed': 'Completado',
      'archived': 'Archivado',
      'cancelled': 'Cancelado'
    };
    
    return statusMap[status] || 'Desconocido';
  },

  /**
   * Obtener color del estado
   * @param {string} status - Estado del diseño
   * @returns {string} Color para el estado
   */
  getStatusColor: (status) => {
    const colorMap = {
      'draft': '#6B7280',      // Gris
      'pending': '#F59E0B',     // Amarillo
      'quoted': '#3B82F6',      // Azul
      'approved': '#10B981',    // Verde
      'rejected': '#EF4444',    // Rojo
      'completed': '#059669',   // Verde oscuro
      'archived': '#9CA3AF',    // Gris claro
      'cancelled': '#DC2626'    // Rojo oscuro
    };
    
    return colorMap[status] || '#6B7280';
  },

  /**
   * Calcular días desde una fecha
   * @param {string} date - Fecha en formato ISO
   * @returns {number} Días transcurridos
   */
  calculateDaysAgo: (date) => {
    if (!date) return 0;
    try {
      const now = new Date();
      const createdDate = new Date(date);
      const diffTime = Math.abs(now - createdDate);
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      console.error('Error calculando días:', error);
      return 0;
    }
  },

  /**
   * Calcular complejidad del diseño
   * @param {Array} elements - Elementos del diseño
   * @returns {string} Nivel de complejidad
   */
  calculateComplexity: (elements) => {
    if (!Array.isArray(elements) || elements.length === 0) {
      return 'low';
    }
    
    const totalElements = elements.length;
    const imageElements = elements.filter(el => el.type === 'image').length;
    const textElements = elements.filter(el => el.type === 'text').length;
    
    // Lógica de complejidad
    let score = 0;
    score += totalElements * 1;
    score += imageElements * 2; // Las imágenes son más complejas
    score += textElements * 1;
    
    // Verificar efectos especiales
    const hasEffects = elements.some(el => 
      el.konvaAttrs && (
        el.konvaAttrs.rotation !== 0 ||
        el.konvaAttrs.opacity < 1 ||
        el.konvaAttrs.shadowEnabled ||
        el.konvaAttrs.filters?.length > 0
      )
    );
    
    if (hasEffects) score += 2;
    
    if (score <= 3) return 'low';
    if (score <= 8) return 'medium';
    return 'high';
  },

  /**
   * Validar datos de diseño
   * @param {Object} designData - Datos del diseño
   * @returns {Object} Resultado de validación
   */
  validateDesignData: (designData) => {
    const errors = [];

    // Validaciones básicas
    if (!designData.productId) {
      errors.push('Debe seleccionar un producto');
    }

    if (!designData.elements || !Array.isArray(designData.elements) || designData.elements.length === 0) {
      errors.push('Debe incluir al menos un elemento en el diseño');
    }

    // Validar elementos
    if (designData.elements && Array.isArray(designData.elements)) {
      designData.elements.forEach((element, index) => {
        if (!element.type) {
          errors.push(`Elemento ${index + 1}: Tipo de elemento requerido`);
        }
        
        // Área de personalización es opcional (se puede asignar automáticamente)
        if (!element.areaId) {
          console.warn(`Elemento ${index + 1}: Sin área de personalización asignada, se usará la primera disponible`);
        }
        
        if (!element.konvaAttrs) {
          errors.push(`Elemento ${index + 1}: Configuración de posición requerida`);
        }
        
        // Validaciones específicas por tipo
        if (element.type === 'text' && (!element.konvaAttrs?.text || element.konvaAttrs.text.trim() === '')) {
          errors.push(`Elemento ${index + 1}: El texto no puede estar vacío`);
        }
        
        if (element.type === 'image') {
          // Validar que tenga al menos una fuente de imagen
          const hasImage = element.konvaAttrs?.image;
          const hasImageUrl = element.konvaAttrs?.imageUrl;
          
          if (!hasImage && !hasImageUrl) {
            errors.push(`Elemento ${index + 1}: Imagen requerida`);
          }
        }
        if (designData.productColorFilter) {
        if (!/^#[0-9A-F]{6}$/i.test(designData.productColorFilter)) {
         errors.push('El color del producto debe estar en formato hexadecimal (#RRGGBB)');
         }
        }
      });
    }

    // Validar opciones del producto
    if (designData.productOptions && Array.isArray(designData.productOptions)) {
      designData.productOptions.forEach((option, index) => {
        if (!option.name || !option.value) {
          errors.push(`Opción ${index + 1}: Nombre y valor requeridos`);
        }
      });
    }

    // Validar cotización si está presente
    if (designData.price !== undefined) {
      if (isNaN(designData.price) || parseFloat(designData.price) <= 0) {
        errors.push('El precio debe ser un número mayor que 0');
      }
    }

    if (designData.productionDays !== undefined) {
      if (isNaN(designData.productionDays) || parseInt(designData.productionDays) < 1) {
        errors.push('Los días de producción deben ser al menos 1');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Validar elementos del diseño para envío al backend - CORREGIDO
   * @param {Array} elements - Elementos del diseño
   * @returns {Object} Resultado de validación
   */
  validateElementsForSubmission: (elements) => {
    if (!elements || !Array.isArray(elements)) {
      return {
        isValid: false,
        errors: ['Los elementos del diseño deben ser un array']
      };
    }

    if (elements.length === 0) {
      return {
        isValid: false,
        errors: ['Debe incluir al menos un elemento en el diseño']
      };
    }

    const errors = [];

    elements.forEach((element, index) => {
      // Validar estructura básica
      if (!element.type) {
        errors.push(`Elemento ${index + 1}: Tipo de elemento requerido`);
        return; // Saltar validaciones adicionales si no hay tipo
      }
      
      if (!element.konvaAttrs) {
        errors.push(`Elemento ${index + 1}: Configuración de posición requerida`);
        return; // Saltar validaciones adicionales si no hay konvaAttrs
      }
      
      // Validar posición básica - Asegurar que sean números
      if (typeof element.konvaAttrs.x !== 'number' || isNaN(element.konvaAttrs.x)) {
        errors.push(`Elemento ${index + 1}: Posición X debe ser un número válido`);
      }
      
      if (typeof element.konvaAttrs.y !== 'number' || isNaN(element.konvaAttrs.y)) {
        errors.push(`Elemento ${index + 1}: Posición Y debe ser un número válido`);
      }
      
      // Validaciones específicas por tipo
      if (element.type === 'text') {
        // Verificar texto en konvaAttrs o directamente en el elemento
        const textValue = element.konvaAttrs.text || element.text;
        if (!textValue || textValue.trim() === '') {
          errors.push(`Elemento de texto ${index + 1}: texto vacío`);
        }
        
        // Asegurar propiedades de texto por defecto
        if (!element.konvaAttrs.fontSize || isNaN(element.konvaAttrs.fontSize)) {
          element.konvaAttrs.fontSize = 24;
        }
        if (!element.konvaAttrs.fontFamily) {
          element.konvaAttrs.fontFamily = 'Arial';
        }
        if (!element.konvaAttrs.fill) {
          element.konvaAttrs.fill = '#000000';
        }
      }
      
      if (element.type === 'image') {
        if (!element.konvaAttrs.image && !element.konvaAttrs.imageUrl) {
          errors.push(`Elemento ${index + 1}: Imagen requerida`);
        }
        
        // Asegurar dimensiones por defecto para imágenes
        if (!element.konvaAttrs.width || isNaN(element.konvaAttrs.width)) {
          element.konvaAttrs.width = 200;
        }
        if (!element.konvaAttrs.height || isNaN(element.konvaAttrs.height)) {
          element.konvaAttrs.height = 150;
        }
      }
      
      // Validar área (opcional para compatibilidad)
      if (!element.areaId) {
        console.warn(`Elemento ${index + 1}: Sin área de personalización asignada, se usará la primera disponible`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  

  /**
   * Preparar datos de Konva para el editor
   * @param {Object} design - Diseño con elementos
   * @returns {Object} Configuración para Konva
   */
  prepareForKonvaEditor: (design) => {
    try {
      if (!design || !design.elements) {
        return {
          stage: { width: 800, height: 600 },
          elements: []
        };
      }

      const konvaElements = design.elements.map((element, index) => ({
        ...element.konvaAttrs,
        id: element._id || `element-${index}`,
        name: `${element.type}-${index}`,
        draggable: true,
        elementType: element.type,
        areaId: element.areaId
      }));

      return {
        stage: {
          width: design.product?.editorConfig?.stageWidth || 800,
          height: design.product?.editorConfig?.stageHeight || 600
        },
        elements: konvaElements,
        product: design.product,
        areas: design.product?.customizationAreas || []
      };
    } catch (error) {
      console.error('Error preparando para Konva:', error);
      return {
        stage: { width: 800, height: 600 },
        elements: []
      };
    }
  },

  /**
   * Convertir datos de Konva a formato del backend - CORREGIDO
   * @param {Array} konvaElements - Elementos del editor Konva
   * @returns {Array} Elementos formateados para backend
   */
  prepareFromKonvaEditor: (konvaElements) => {
    try {
      if (!Array.isArray(konvaElements)) {
        return [];
      }

      return konvaElements.map(element => {
        const { elementType, areaId, id, name, draggable, ...konvaAttrs } = element;
        
        const normalizedKonva = {
          ...konvaAttrs,
          // Normalizar nombre de imagen para backend
          ...(konvaAttrs.imageUrl && !konvaAttrs.image ? { image: konvaAttrs.imageUrl } : {}),
          // Limpiar propiedades específicas de Konva que no necesitamos
          id: undefined,
          name: undefined,
          draggable: undefined
        };

        return {
          type: elementType || element.type || 'text',
          areaId: areaId || '',
          konvaAttrs: normalizedKonva
        };
      });
    } catch (error) {
      console.error('Error convirtiendo desde Konva:', error);
      return [];
    }
  },

  /**
   * Obtener estadísticas de diseños (Admin)
   * @returns {Promise} Respuesta con estadísticas
   */
  getStats: async () => {
    try {
      console.log('📊 [DesignService] Obteniendo estadísticas');
      
      const response = await apiClient.get(`${BASE_URL}/admin/stats`);
      console.log('✅ [DesignService] Estadísticas obtenidas:', response);
      return response;
    } catch (error) {
      console.error('❌ [DesignService] Error obteniendo estadísticas:', error);
      throw error;
    }
  },

  /**
   * Normalizar elemento para compatibilidad con backend
   * @param {Object} element - Elemento del diseño
   * @returns {Object} Elemento normalizado
   */
  normalizeElement: (element) => {
    if (!element || !element.konvaAttrs) {
      console.warn('Elemento sin konvaAttrs:', element);
      return null;
    }

    // Estructura básica esperada por el backend
    const normalized = {
      type: element.type || 'text',
      areaId: element.areaId || '',
      konvaAttrs: {
        x: Number(element.konvaAttrs.x) || 0,
        y: Number(element.konvaAttrs.y) || 0,
        width: element.konvaAttrs.width,
        height: element.konvaAttrs.height,
        ...element.konvaAttrs
      }
    };

    // Asegurar que x e y sean números válidos
    if (isNaN(normalized.konvaAttrs.x)) {
      normalized.konvaAttrs.x = 0;
    }
    if (isNaN(normalized.konvaAttrs.y)) {
      normalized.konvaAttrs.y = 0;
    }

    // Validaciones específicas por tipo
    if (normalized.type === 'text') {
      if (!normalized.konvaAttrs.text) {
        normalized.konvaAttrs.text = 'Texto vacío';
      }
      if (!normalized.konvaAttrs.fontSize || isNaN(normalized.konvaAttrs.fontSize)) {
        normalized.konvaAttrs.fontSize = 24;
      }
      if (!normalized.konvaAttrs.fontFamily) {
        normalized.konvaAttrs.fontFamily = 'Arial';
      }
      if (!normalized.konvaAttrs.fill) {
        normalized.konvaAttrs.fill = '#000000';
      }
    }

    if (normalized.type === 'image') {
      // Log de depuración para imágenes
      console.log('🖼️ [DesignService] Normalizando elemento de imagen:', {
        id: element.id,
        hasImage: !!normalized.konvaAttrs.image,
        hasImageUrl: !!normalized.konvaAttrs.imageUrl,
        imageUrlPreview: normalized.konvaAttrs.imageUrl?.substring(0, 50) + '...',
        originalName: normalized.konvaAttrs.originalName,
        width: normalized.konvaAttrs.width,
        height: normalized.konvaAttrs.height
      });
      
      if (!normalized.konvaAttrs.image && !normalized.konvaAttrs.imageUrl) {
        console.warn('❌ [DesignService] Elemento de imagen sin URL:', {
          id: element.id,
          konvaAttrs: normalized.konvaAttrs
        });
        return null;
      }
      if (!normalized.konvaAttrs.width || isNaN(normalized.konvaAttrs.width)) {
        normalized.konvaAttrs.width = 200;
      }
      if (!normalized.konvaAttrs.height || isNaN(normalized.konvaAttrs.height)) {
        normalized.konvaAttrs.height = 150;
      }
    }

    // ✅ Validaciones para formas - CORREGIDO
    const shapeTypes = [
      'triangle', 'star', 'heart', 'diamond', 'hexagon', 'octagon', 'pentagon',
      'polygon', 'shape', 'path', 'line', 'arrow', 'cross', 'plus', 'minus'
    ];
    
    if (shapeTypes.includes(normalized.type)) {
      console.log('🔷 [DesignService] Normalizando elemento de forma:', {
        id: element.id,
        type: normalized.type,
        hasPoints: !!normalized.konvaAttrs.points,
        pointsLength: normalized.konvaAttrs.points?.length || 0
      });
      
      // ✅ NO eliminar elementos sin puntos - pueden ser formas personalizadas válidas
      if (normalized.konvaAttrs.points && normalized.konvaAttrs.points.length > 0) {
        // Asegurar que los puntos sean números válidos
        normalized.konvaAttrs.points = normalized.konvaAttrs.points.map(point => {
          const num = Number(point);
          return isNaN(num) ? 0 : num;
        });
      } else {
        // ✅ Para formas personalizadas, permitir puntos vacíos
        console.log('ℹ️ [DesignService] Forma personalizada sin puntos predefinidos:', {
          id: element.id,
          type: normalized.type
        });
        normalized.konvaAttrs.points = normalized.konvaAttrs.points || [];
      }
      
      // ✅ Preservar propiedades específicas de formas
      if (normalized.konvaAttrs.closed !== undefined) {
        normalized.konvaAttrs.closed = Boolean(normalized.konvaAttrs.closed);
      }
      if (normalized.konvaAttrs.tension !== undefined) {
        normalized.konvaAttrs.tension = Number(normalized.konvaAttrs.tension) || 0;
      }
      if (normalized.konvaAttrs.lineCap) {
        normalized.konvaAttrs.lineCap = normalized.konvaAttrs.lineCap;
      }
      if (normalized.konvaAttrs.lineJoin) {
        normalized.konvaAttrs.lineJoin = normalized.konvaAttrs.lineJoin;
      }
    }

    return normalized;
  },

  /**
   * Normalizar array de elementos para envío al backend
   * @param {Array} elements - Array de elementos
   * @returns {Array} Array de elementos normalizados
   */
  normalizeElementsArray: (elements) => {
    if (!Array.isArray(elements)) {
      return [];
    }

    console.log('📦 [DesignService] Normalizando array de elementos:', {
      totalElements: elements.length,
      elements: elements.map(el => ({
        id: el.id,
        type: el.type,
        hasKonvaAttrs: !!el.konvaAttrs,
        hasImageUrl: !!el.konvaAttrs?.imageUrl,
        hasImage: !!el.konvaAttrs?.image
      }))
    });

    const normalized = elements
      .map(element => DesignService.normalizeElement(element))
      .filter(element => element !== null);

    console.log('✅ [DesignService] Elementos normalizados:', {
      originalCount: elements.length,
      normalizedCount: normalized.length,
      filteredOut: elements.length - normalized.length
    });

    return normalized;
  },

  /**
   * Asignar área de personalización por defecto a elementos que no la tengan
   * @param {Array} elements - Array de elementos
   * @param {string} productId - ID del producto
   * @returns {Array} Array de elementos con áreas asignadas
   */
  assignDefaultAreas: (elements, productId) => {
    if (!Array.isArray(elements)) {
      return [];
    }

    // Por ahora, asignar un área por defecto vacía
    // En el futuro se puede implementar lógica más sofisticada
    return elements.map(element => ({
      ...element,
      areaId: element.areaId || 'default-area'
    }));
  }
};

export default DesignService;